import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard({ token }) {
  const [enrolled, setEnrolled] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const resEnrolled = await axios.get('http://localhost:5000/api/courses/enrolled', config);
      setEnrolled(resEnrolled.data);
      const resRecs = await axios.get('http://localhost:5000/api/courses/recommendations', config);
      setRecommendations(resRecs.data);
    } catch (err) {
      console.error('Data collection fetch failure', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const changeProgress = async (id, currentVal) => {
    const nextVal = Math.min(currentVal + 25, 100);
    try {
      await axios.put('http://localhost:5000/api/courses/progress', { enrollmentId: id, progress: nextVal }, config);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const enrollFromRec = async (courseId) => {
    try {
      await axios.post('http://localhost:5000/api/courses/enroll', { courseId }, config);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Welcome, {user.name}!</h1>
      <p style={{ fontStyle: 'italic' }}>Interests Matrix: {user.interests?.join(', ') || 'None configuration selected'}</p>

      <section style={{ marginTop: '30px' }}>
        <h2>My Current Enrolled Core Tracks ({enrolled.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          {enrolled.map(item => (
            <div key={item._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', background: '#fff' }}>
              <h3>{item.courseId?.title}</h3>
              <p>Instructor: {item.courseId?.instructor}</p>
              <div style={{ background: '#eee', height: '20px', borderRadius: '10px', overflow: 'hidden', margin: '15px 0' }}>
                <div style={{ background: '#28a745', height: '100%', width: `${item.progress}%`, transition: 'width 0.4s' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Completion Index: <strong>{item.progress}%</strong></span>
                {item.progress < 100 && (
                  <button onClick={() => changeProgress(item._id, item.progress)} style={{ padding: '5px 10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Study Module (+25%)</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Recommended For You (Algorithmic Content Matches)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          {recommendations.length === 0 ? <p>No matching available recommendations found. Explore our full catalog.</p> : 
            recommendations.map(course => (
              <div key={course._id} style={{ border: '1px solid #007bff', padding: '15px', borderRadius: '5px', background: '#f8f9fa' }}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>Category: <span style={{ background: '#007bff', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontSize: '12px' }}>{course.category}</span></p>
                <button onClick={() => enrollFromRec(course._id)} style={{ marginTop: '10px', width: '100%', padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Quick Enroll</button>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}

export default Dashboard;