import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import "./Prompt.css";
import { useNavigate } from 'react-router-dom';

function Prompt() {
  const [knownPersons, setKnownPersons] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fadeIn, setFadeIn] = useState(false);

  const navigate = useNavigate();
  // Get patient ID from localStorage
  const patientId = localStorage.getItem('userId') || '';

  // Fetch the list of known persons from MongoDB
  useEffect(() => {
    const fetchKnownPersons = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!patientId || !token) {
          setError('Authentication information missing. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        const response = await axios.get(`http://localhost:5000/api/known-persons/${patientId}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        setKnownPersons(response.data.known_persons);
        
        if (response.data.known_persons.length > 0 && !selectedPersonId) {
          setSelectedPersonId(response.data.known_persons[0].id);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error details:', err);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        setError('Failed to fetch known persons. Please try again later.');
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchKnownPersons();
    }
  }, [patientId, selectedPersonId]);

  // Apply fade-in effect when summary data changes
  useEffect(() => {
    if (summaryData) {
      setFadeIn(false);
      const timer = setTimeout(() => {
        setFadeIn(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [summaryData]);

  // Fetch summary for a specific date
  const fetchDateSummary = async () => {
    if (!selectedPersonId) {
      setError('Please select a known person first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSummaryData(null); // Clear previous data
      
      const response = await axios.get('http://localhost:5002/api/summarize-conversation', {
        params: {
          patient_id: patientId,
          known_person_id: selectedPersonId,
          date: selectedDate
        }
      });
      
      setSummaryData(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch summary. Please try again later.');
      setIsLoading(false);
      console.error('Error fetching summary:', err);
    }
  };

  // Fetch summary for all conversations
  const fetchAllSummaries = async () => {
    if (!selectedPersonId) {
      setError('Please select a known person first');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSummaryData(null); // Clear previous data
      
      const response = await axios.get('http://localhost:5002/api/summarize-all-conversations', {
        params: {
          patient_id: patientId,
          known_person_id: selectedPersonId
        }
      });
      
      setSummaryData(response.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch all summaries. Please try again later.');
      setIsLoading(false);
      console.error('Error fetching all summaries:', err);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle person selection
  const handlePersonChange = (e) => {
    setSelectedPersonId(e.target.value);
    // Clear previous summary data when changing person
    setSummaryData(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const handleDashboardClick = () => {
    navigate('/dashboard'); // Navigate to dashboard
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/'); // Navigate to login
  };

  // Get selected person name
  const getSelectedPersonName = () => {
    const person = knownPersons.find(p => p.known_person_id === selectedPersonId);
    return person ? person.name : 'Unknown Person';
  };

  return (
    <div className="container">
      <nav className="app-nav">
        <h1>Conversation Insights</h1>
        <div className="nav-buttons">
          <button onClick={handleDashboardClick} className="nav-button">
            Dashboard
          </button>
          <button onClick={handleLogoutClick} className="nav-button">
            Logout
          </button>
        </div>
      </nav>
      
      {/* Error display */}
      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="9"></circle>
            <line x1="10" y1="6" x2="10" y2="10"></line>
            <line x1="10" y1="14" x2="10.01" y2="14"></line>
          </svg>
          {error}
        </div>
      )}

      {/* Selection Controls */}
      <div className="control-panel">
        <div className="form-group">
          <label htmlFor="personSelect" className="form-label">
            Select Known Person
          </label>
          <select
            id="personSelect"
            value={selectedPersonId}
            onChange={handlePersonChange}
            className="form-select"
            disabled={isLoading || knownPersons.length === 0}
          >
            <option value="">Select a person...</option>
            {knownPersons.map((person) => (
              <option key={person.known_person_id} value={person.known_person_id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="dateSelect" className="form-label">
            Select Date for Single Day Summary
          </label>
          <input
            type="date"
            id="dateSelect"
            value={selectedDate}
            onChange={handleDateChange}
            className="form-input"
            max={format(new Date(), 'yyyy-MM-dd')}
            disabled={isLoading}
          />
        </div>

        <div className="button-container">
          <button
            onClick={fetchDateSummary}
            disabled={isLoading || !selectedPersonId}
            className="btn btn-primary"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Loading...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Get Summary for Selected Date
              </>
            )}
          </button>
          
          <button
            onClick={fetchAllSummaries}
            disabled={isLoading || !selectedPersonId}
            className="btn btn-success"
          >
            {isLoading ? (
              <>
                <span className="animate-pulse">Loading...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Get All Conversations Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Display */}
      {summaryData && (
        <div className={`results-card ${fadeIn ? 'fade-in' : ''}`} style={{ 
          opacity: fadeIn ? 1 : 0,
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          transform: fadeIn ? 'translateY(0)' : 'translateY(10px)'
        }}>
          <div className="card-header">
            <h2 className="card-title">
              {summaryData.date 
                ? `Summary for ${formatDate(summaryData.date)}`
                : `All Conversation Insights with ${getSelectedPersonName()}`}
            </h2>
            <p className="card-subtitle">
              <span>{summaryData.conversation_count} messages</span>
              <span> • </span>
              <span>{summaryData.conversation_length} characters</span>
            </p>
          </div>
          
          <div className="card-body">
            <div className="card-section">
              <h3 className="section-title">Key Insights</h3>
              {summaryData.success ? (
                <div className="summary-content conversation-text">
                  {summaryData.summary.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-orange-600">
                  {summaryData.summary || 'No summary available for this conversation'}
                </p>
              )}
            </div>
            
            {/* Messages section */}
            {summaryData.original_messages && summaryData.original_messages.length > 0 && (
              <div className="card-section">
                <h3 className="section-title">Original Messages</h3>
                <div className="message-container">
                  {summaryData.original_messages.map((message, index) => (
                    <div key={index} className="message-item">
                      <div className="message-header">
                        <span className="message-sender">{message.speaker}</span>
                        <span className="message-time">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="message-content">{message.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Messages by date section (for all conversations) */}
            {summaryData.messages_by_date && Object.keys(summaryData.messages_by_date).length > 0 && (
              <div className="card-section">
                <h3 className="section-title">Conversation History</h3>
                
                {summaryData.conversation_dates && summaryData.conversation_dates.map(date => (
                  <div key={date} className="mb-4">
                    <h4 className="message-date-header">
                      {formatDate(date)}
                    </h4>
                    <div className="message-container">
                      {summaryData.messages_by_date[date].map((message, index) => (
                        <div key={index} className="message-item">
                          <div className="message-header">
                            <span className="message-sender">{message.speaker}</span>
                            <span className="message-time">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="message-content">{message.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Loading state with no data yet */}
      {isLoading && !summaryData && (
        <div className="loading-state">
          <div className="loading-icon"></div>
          <p>Analyzing conversations...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !summaryData && selectedPersonId && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p className="text-gray-600">Select options and click a button to see conversation summaries</p>
        </div>
      )}
    </div>
  );
}

export default Prompt;