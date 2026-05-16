import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    year: new Date().getFullYear(),
    financial_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Attempting login with username:', formData.username);
      
      const response = await authAPI.login({
        username: formData.username,
        password: formData.password,
      });

      console.log('Login response:', response);
      console.log('Response data:', response.data);

      const { token, user } = response.data;

      if (!token || !user) {
        setError('Invalid response from server. Missing token or user data.');
        console.error('Missing token or user in response:', { token, user });
        setLoading(false);
        return;
      }

      console.log('Token received:', token);
      console.log('User data:', user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('year', formData.year);
      localStorage.setItem('financial_year', formData.financial_year);

      // Store menu access array — key must match what Sidebar.jsx reads ("menuaccessarray")
      if (user.mnuaccess) {
        let menuAccessArray = [];
        if (typeof user.mnuaccess === 'string') {
          menuAccessArray = user.mnuaccess
            .split(',')
            .map(num => parseInt(num.trim()))
            .filter(num => !isNaN(num));
        } else if (Array.isArray(user.mnuaccess)) {
          menuAccessArray = user.mnuaccess.map(num => parseInt(num));
        }
        localStorage.setItem('menuaccessarray', JSON.stringify(menuAccessArray));
      }

      // Store the active dashboard number (1, 2, or 3) used for menu filtering
      const activeDashboard = user.dashboard || user.dashboard_access || '1';
      localStorage.setItem('dashboard', String(activeDashboard));

      console.log('Data stored in localStorage');

      onLoginSuccess?.(user);
      
      console.log('Navigating to dashboard...');
      navigate('/dashboard');
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const errorMsg = err.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-brand">
          <div className="logo">
            <div className="logo-icon">HR</div>
            <div className="logo-text">DESK</div>
          </div>
          <div className="brand-info">
            <h1>Welcome</h1>
            <p>Access your Human Resource Management System. Manage employees, track attendance, and streamline HR processes with our comprehensive solution.</p>
          </div>
        </div>

        <div className="login-form-wrapper">
          <h2>HRDesk Login</h2>
          <p className="form-subtitle">Enter your credentials to access your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="financial_year">Financial Year</label>
                <select
                  id="financial_year"
                  name="financial_year"
                  value={formData.financial_year}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {years.map(year => (
                    <option key={year} value={`${year}-${year + 1}`}>
                      {year}-{year + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Powered by System And Solution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
