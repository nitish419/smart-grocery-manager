import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Catalog({ token }) {
  const [courses, setCourses] = useState([]);
  const [msg, setMsg] = useState('');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get('http://localhost:5000/api/courses', config)
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  const enroll = async (courseId) => {
    try {
      await axios.post('http://localhost:5000/api/courses/enroll', { courseId }, config);
      setMsg('Enrolled successfully! Check your Learner Dashboard.');
      window.scrollTo(0,0);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Enrollment error trace');
    }
  };

  return (
    <div>
      <h2>Complete Unified Course Catalog Matrix</h2>
      {msg && <p style={{ padding: '10px', background: '#e2f0d9', color: '#385723', borderRadius: '4px' }}>{msg}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {courses.map(course => (
          <div key={course._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p style={{ fontSize: '13px', color: '#666' }}>Lead Instructor: {course.instructor}</p>
            <div style={{ margin: '10px 0' }}>
              {course.tags?.map(t => (
                <span key={t} style={{ background: '#eee', padding: '3px 8px', borderRadius: '12px', marginRight: '5px', fontSize: '12px' }}>#{t}</span>
              ))}
            </div>
            <button onClick={() => enroll(course._id)} style={{ width: '100%', padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginTop: '10px' }}>Enroll Today</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;