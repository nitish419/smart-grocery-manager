require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async() => {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGO_URI);
};

const authController = require('./controllers/authController');
const courseController = require('./controllers/courseController');
const { protect } = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// Routes Integration
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);

app.get('/api/courses', courseController.getCourses);
app.post('/api/courses/enroll', protect, courseController.enrollInCourse);
app.get('/api/courses/enrolled', protect, courseController.getEnrolledCourses);
app.put('/api/courses/progress', protect, courseController.updateProgress);
app.get('/api/courses/recommendations', protect, courseController.getRecommendations);

// Seed route for development
app.post('/api/seed', async(req, res) => {
    const Course = require('./models/Course');
    await Course.deleteMany({});
    const sampleData = [
        { title: 'Full Stack Web Mastery', description: 'Master React & Node frameworks.', instructor: 'Dr. John', category: 'Web Development', tags: ['JavaScript', 'React', 'Node'] },
        { title: 'Data Science Foundations', description: 'Dive into analytical processing systems.', instructor: 'Sarah Lee', category: 'Data Science', tags: ['Python', 'Data Analytics'] },
        { title: 'Deep Learning with Python', description: 'Build and train advanced neural networks.', instructor: 'Alan Turing', category: 'AI', tags: ['Python', 'Machine Learning', 'AI'] },
        { title: 'Cybersecurity Strategies', description: 'Secure networks against advanced threats.', instructor: 'Eve Smith', category: 'Cybersecurity', tags: ['Security', 'Networks'] }
    ];
    await Course.insertMany(sampleData);
    res.send('Database populated with core catalog entries successfully.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async() => {
    try { await connectDB();
        console.log(`Server executing at port ${PORT}`); } catch (e) { console.log(e); }
});