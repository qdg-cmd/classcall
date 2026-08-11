import React, { useState, useEffect } from 'react';
import TeacherUI from './components/TeacherUI';
import StudentUI from './components/StudentUI';

function App() {
  const [role, setRole] = useState('student');

  useEffect(() => {
    // Check URL parameters for role
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'teacher') {
      setRole('teacher');
    }
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {role === 'teacher' ? <TeacherUI /> : <StudentUI />}
    </div>
  );
}

export default App;
