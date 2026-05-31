import React, { useState } from 'react';
import axios from 'axios';

function Register({ setToken }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const interestsArr = interests.split(',').map(i => i.trim()).filter(Boolean);
    const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, interests: interestsArr, skills: skillsArr });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setToken(res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failure encountered');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <h2>Create Learner Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Full Name</label>
          <input type="text" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email</label>
          <input type="email" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password</label>
          <input type="password" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Interests (comma-separated)</label>
          <input type="text" placeholder="e.g., AI, Web Development" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={interests} onChange={e => setInterests(e.target.value)} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Desired Skills (comma-separated)</label>
          <input type="text" placeholder="e.g., Python, React" style={{ width: '100%', padding: '8px', marginTop: '5px' }} value={skills} onChange={e => setSkills(e.target.value)} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Register Portfolio Account</button>
      </form>
    </div>
  );
}

export default Register;