import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
  };

  const navStyle = {
    display: 'flex', gap: '15px', background: '#f4f4f4', padding: '15px', 
    borderBottom: '1px solid #ccc', textDecoration: 'none', fontWeight: 'bold'
  };

  return (
    <Router>
      <nav style={navStyle}>
        <span style={{ marginRight: 'auto', color: '#333' }}>📚 EdTech Platform</span>
        {token ? (
          <>
            <Link to="/dashboard" style={{ color: '#007bff' }}>Dashboard</Link>
            <Link to="/catalog" style={{ color: '#007bff' }}>Browse Courses</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#007bff' }}>Login</Link>
            <Link to="/register" style={{ color: '#007bff' }}>Register</Link>
          </>
        )}
      </nav>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <Routes>
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
          <Route path="/catalog" element={token ? <Catalog token={token} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;