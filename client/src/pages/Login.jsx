import React, { useState } from 'react';
import axios from 'axios';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login operational error');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Account Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email Address</label>
          <input type="email" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Access System</button>
      </form>
    </div>
  );
}

export default Login;