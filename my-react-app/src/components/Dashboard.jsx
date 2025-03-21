import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css'; // Import the CSS file

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: {
            'x-auth-token': token,
          },
        });
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        // If error, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleAccessKnownPersons = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId) {
      alert('User ID not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/update-known-persons',
        { userId },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        }
      );

      if (response.status === 200) {
        alert('Known persons updated successfully!');
      } else {
        alert('Failed to update known persons.');
      }
    } catch (error) {
      console.error('Error updating known persons:', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  // Get initials for avatar if no profile photo
  const getInitials = () => {
    return userData?.name ? userData.name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="dashboard-container">
      {/* Header with user profile and logout */}
      <header className="dashboard-header">
        <div className="profile-section">
          <div className="user-avatar">
            {getInitials()}
          </div>
          <div className="user-name">
            <h3>{userData.name}</h3>
            <p className="user-email">{userData.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>

      {/* Main content with 4 feature boxes */}
      <main className="dashboard-main">
        <div className="feature-grid">
          {/* Box 1: Prompt */}
          <div className="feature-box" onClick={() => navigate('/prompt')}>
            <div className="feature-icon">📝</div>
            <h3>Prompt</h3>
            <p>Create and manage your prompts</p>
          </div>

          {/* Box 2: Contacts */}
          <div className="feature-box" onClick={handleAccessKnownPersons}>
            <div className="feature-icon">👥</div>
            <h3>Contacts</h3>
            <p>Manage your known persons</p>
          </div>

          {/* Box 3: Dummy Feature 1 */}
          <div className="feature-box">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>View your usage statistics</p>
          </div>

          {/* Box 4: Dummy Feature 2 */}
          <div className="feature-box">
            <div className="feature-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Configure your preferences</p>
          </div>
        </div>
      </main>

      {/* Footer with record button */}
      <footer className="dashboard-footer">
        <button className="record-button">
          <span className="record-icon">●</span> Start Recording
        </button>
      </footer>
    </div>
  );
}

export default Dashboard;