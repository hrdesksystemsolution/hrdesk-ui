import React, { useState, useEffect } from 'react';
import './BirthdayCarousel.css';

const BirthdayCarousel = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch birthday data
  useEffect(() => {
    fetchBirthdays();
  }, []);

  // Auto-rotation every 5 seconds
  useEffect(() => {
    if (birthdays.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % birthdays.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [birthdays]);

  const fetchBirthdays = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/birthday-service.php?action=getCurrentMonth');
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setBirthdays(data.data);
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to fetch birthday data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching birthdays:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + birthdays.length) % birthdays.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % birthdays.length);
  };

  // Format birth date to show full date with year (DD-MM-YYYY)
  const formatBirthDate = (birthdate) => {
    if (!birthdate) return '';
    const [year, month, day] = birthdate.split('-');
    return `${day}-${month}-${year}`;
  };

  // Get avatar background color based on employee ID
  const getAvatarColor = (id) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#ABEBC6'
    ];
    return colors[id % colors.length];
  };

  if (loading) {
    return (
      <div className="birthday-carousel-container">
        <div className="loading">Loading birthday list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="birthday-carousel-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (birthdays.length === 0) {
    return (
      <div className="birthday-carousel-container">
        <div className="no-birthdays">No birthdays this month</div>
      </div>
    );
  }

  // Get two cards to display (current and next)
  const card1 = birthdays[currentIndex];
  const card2 = birthdays[(currentIndex + 1) % birthdays.length];
  const displayCards = birthdays.length > 1 ? [card1, card2] : [card1];

  return (
    <div className="birthday-carousel-container">
      <div className="birthday-header-section">
        <h3>🎂 Birthday List for Current Month</h3>
        <span className="employees-count">{birthdays.length} employees</span>
      </div>
      
      <div className="birthday-carousel">
        <div className="birthday-cards-container">
          {displayCards.map((card, index) => (
            <div key={index} className="birthday-card compact">
              <div className="birthday-card-top">
                <div className="birthday-avatar">🎂</div>
                <h4 className="birthday-card-name">{card.display_name || card.employee_name || 'Unknown Employee'}</h4>
              </div>

              <div className="birthday-details compact-details">
                <div className="birthday-value-box">{card.empno || 'N/A'}</div>
                <div className="birthday-value-box">{card.designation || 'N/A'}</div>
                <div className="birthday-value-box">{formatBirthDate(card.birthdate)}</div>
              </div>

              <div className="birthday-info-footer compact-footer">
                <span>{card.age ? `${card.age} y.o.` : 'Age N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BirthdayCarousel;
