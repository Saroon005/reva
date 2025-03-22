import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Contacts.css'; // Import the CSS file

function Contacts() {
  const [knownPersons, setKnownPersons] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
  }, [navigate, token]);

  useEffect(() => {
    if (!userId || !token) {
      setError('User ID or token not found. Please log in.');
      return;
    }

    const fetchKnownPersons = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/known-persons/${userId}`,
          {
            headers: {
              'x-auth-token': token,
            },
          }
        );
        setKnownPersons(response.data.known_persons);
      } catch (err) {
        if (err.response) {
          setError(err.response.data.message);
        } else {
          setError('An unexpected error occurred.');
        }
      }
    };

    fetchKnownPersons();
  }, [userId, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // Get initials for avatar if no profile photo
  const getInitials = () => {
    return userData?.name ? userData.name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-display">{error}</div>;
  }

  return (
    <div className="contacts-container">
      {/* Navbar with Dashboard and Contacts links */}
      <nav className="app-navbar">
      </nav>

      {/* Header with user profile and logout - copied from Dashboard */}
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
        <Link to="/dashboard" className="logout-button">Dashboard</Link>
      </header>

      {/* Main content */}
      <div className="known-persons-details-container">
        <h2>Known Persons Details</h2>
        {knownPersons.length > 0 ? (
          <ul className="known-persons-details-list">
            {knownPersons.map((person) => (
              <li key={person.id} className="known-person-details-item">
                <p><strong>Name:</strong> {person.name}</p>
                <p><strong>Known Person ID:</strong> {person.known_person_id}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No known persons found.</p>
        )}
      </div>
    </div>
  );
}

export default Contacts;