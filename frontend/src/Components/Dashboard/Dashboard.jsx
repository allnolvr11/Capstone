import React from 'react';
import './dashboardStyle.css';

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  
    console.log('Logged out');
  };

  return (
    <div>
      Welcome
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}

export default Dashboard;