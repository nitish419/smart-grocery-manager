// 1. Import Firebase Authentication AND Firestore (Database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Your Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBkGg00YGLAm6hcQG_dBV0IWXGpgMCQlkI",
    authDomain: "smart-grocery-manager-47d98.firebaseapp.com",
    projectId: "smart-grocery-manager-47d98",
    storageBucket: "smart-grocery-manager-47d98.firebasestorage.app",
    messagingSenderId: "232347846952",
    appId: "1:232347846952:web:5e542ec24321d46a87a81d",
    measurementId: "G-2X39L32RRM"
};

// 3. Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app); // THIS IS YOUR NEW SERVERLESS DATABASE

// 4. DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuth = document.getElementById('toggle-auth');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const inventoryList = document.getElementById('inventory-list');
const addItemForm = document.getElementById('add-item-form');
const alertsContainer = document.getElementById('alerts-container');
const alertsText = document.getElementById('alerts-text');

let isLoginMode = true;

// Toggle Login / Register UI
toggleAuth.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authTitle.innerText = isLoginMode ? 'Login to Pantry' : 'Create Account';
    authBtn.innerText = isLoginMode ? 'Login' : 'Register';

    if (isLoginMode) {
        toggleAuth.innerText = "Don't have an account? Register here";
    } else {
        toggleAuth.innerText = "Already have an account? Login here";
    }
    authError.classList.add('hidden');
});

// Firebase Authentication Form Submit
authForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        authError.innerText = error.message.replace('Firebase: ', '');
        authError.classList.remove('hidden');
    }
});

// Logout
logoutBtn.addEventListener('click', () => signOut(auth));

// Auth State Listener (Controls what the user sees)
onAuthStateChanged(auth, (user) => {
    if (user) {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        fetchItems(); // Load data when logged in
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
});

// ==========================================
// NEW FIRESTORE CLOUD DATABASE LOGIC
// ==========================================

// Fetch Inventory directly from Cloud
async function fetchItems() {
    if (!auth.currentUser) return;

    try {
        // Only fetch items belonging to the currently logged-in user
        const q = query(collection(db, "items"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
            // Create an object with the Firestore ID and the item data
            items.push({ _id: doc.id, ...doc.data() });
        });

        renderDashboard(items);
    } catch (error) {
        console.error("Error fetching items from Firebase:", error);
        alert("Error loading data. Make sure Firestore is enabled in your console!");
    }
}

// Add New Item to Cloud
addItemForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const newItem = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        currentQuantity: Number(document.getElementById('item-qty').value),
        minQuantity: Number(document.getElementById('item-min').value),
        unit: document.getElementById('item-unit').value,
        userId: auth.currentUser.uid // Tie this item to the specific user!
    };

    try {
        // Save directly to Firestore collection named "items"
        await addDoc(collection(db, "items"), newItem);
        addItemForm.reset();
        fetchItems(); // Refresh the table
    } catch (error) {
        console.error("Error adding item:", error);
        alert("Error saving item. Check console for details.");
    }
});

// Update Quantity directly in Cloud (+ / - buttons)
window.updateQuantity = async(id, newQuantity) => {
    if (newQuantity < 0) return; // Stop negative values

    try {
        // Find the exact document in Firestore by its ID and update it
        const itemRef = doc(db, "items", id);
        await updateDoc(itemRef, {
            currentQuantity: newQuantity
        });
        fetchItems(); // Refresh the table
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
};

// Render UI dynamically (Unchanged from before)
function renderDashboard(items) {
    inventoryList.innerHTML = '';
    const lowStockItems = [];

    if (!items || items.length === 0) {
        inventoryList.innerHTML = `
      <tr>
        <td colspan="4" class="p-4 text-center text-gray-500">No items found. Add some groceries!</td>
      </tr>
    `;
        alertsContainer.classList.add('hidden');
        return;
    }

    items.forEach(item => {
        if (item.currentQuantity <= item.minQuantity) {
            lowStockItems.push(item.name);
        }

        const row = document.createElement('tr');
        row.className = "border-b hover:bg-gray-50 transition";
        row.innerHTML = `
      <td class="p-4 font-semibold">${item.name}</td>
      <td class="p-4 text-gray-600">${item.category}</td>
      <td class="p-4 font-mono font-bold text-lg">${item.currentQuantity} <span class="text-sm font-normal text-gray-500">${item.unit}</span></td>
      <td class="p-4 flex gap-2">
        <button onclick="updateQuantity('${item._id}', ${item.currentQuantity - 1})" class="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 font-bold transition">-</button>
        <button onclick="updateQuantity('${item._id}', ${item.currentQuantity + 1})" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 font-bold transition">+</button>
      </td>
    `;
        inventoryList.appendChild(row);
    });

    if (lowStockItems.length > 0) {
        alertsText.innerText = `You are running low on: ${lowStockItems.join(', ')}`;
        alertsContainer.classList.remove('hidden');
    } else {
        alertsContainer.classList.add('hidden');
    }
}