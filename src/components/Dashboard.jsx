import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import BirthdayCarousel from './BirthdayCarousel';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentDashboard, setCurrentDashboard] = useState('main');
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const year = localStorage.getItem('year') || new Date().getFullYear();
  const financialYear = localStorage.getItem('financial_year') || '2026-2027';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('year');
    localStorage.removeItem('financial_year');
    navigate('/login');
  };

  const dashboards = [
    { id: 'main', label: 'Main Dashboard', icon: '📊' },
    { id: 'time-office', label: 'Time Office', icon: '⏰' },
    { id: 'visitor', label: 'Visitor', icon: '👤' },
    { id: 'payroll', label: 'Payroll', icon: '💰' },
  ];

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-box">HR</div>
            <span className="logo-text">DESK</span>
          </div>
        </div>

        <nav className="header-nav">
          <button className="quick-menu-btn">☰ Quick Menu</button>
          <div className="dashboard-dropdown-container">
            <button
              className="dashboard-btn"
              onClick={() => setShowDashboardMenu(!showDashboardMenu)}
            >
              📊 Dashboard
            </button>
            {showDashboardMenu && (
              <div className="dashboard-dropdown">
                {dashboards.map(dash => (
                  <button
                    key={dash.id}
                    className={`dropdown-item ${currentDashboard === dash.id ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentDashboard(dash.id);
                      setShowDashboardMenu(false);
                    }}
                  >
                    {dash.icon} {dash.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="header-right">
          <button className="icon-btn" title="Notifications">🔔</button>
          <button className="icon-btn" title="Settings">⚙️</button>
          <button className="icon-btn" title="User Profile">👤</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar onToggle={(open) => setSidebarOpen(open)} />

      {/* Main Content */}
      <main className={`dashboard-content${sidebarOpen ? ' content-expanded' : ''}`}>
        {currentDashboard === 'main' && (
          <MainDashboard user={user} year={year} />
        )}
        {currentDashboard === 'time-office' && (
          <TimeOfficeDashboard user={user} year={year} />
        )}
        {currentDashboard === 'visitor' && (
          <VisitorDashboard user={user} year={year} />
        )}
        {currentDashboard === 'payroll' && (
          <PayrollDashboard user={user} year={year} />
        )}
      </main>
    </div>
  );
};

// Main Dashboard Component
const MainDashboard = ({ user, year }) => {
  const [companies, setCompanies] = React.useState([]);
  const [selectedCompany, setSelectedCompany] = React.useState('');
  const [selectedEmployee, setSelectedEmployee] = React.useState('');
  const [loadingCompanies, setLoadingCompanies] = React.useState(true);

  // Fetch companies on mount
  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await fetch('http://localhost:8000/company-service.php?action=getAll');
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCompanies(data.data);
      } else {
        console.error('Error fetching companies:', data.message);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header-section">
        <h1>Employee Management Dashboard</h1>
        <p>Welcome back, {user.fullname || user.username}!</p>
      </div>

      <div className="top-row">
        <div className="stats-wrapper">
          <div className="dashboard-grid">
            {/* Employee Details Card */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon">👥</div>
                <div className="card-info">
                  <div className="card-number">146</div>
                  <div className="card-label">Total Employee</div>
                </div>
              </div>
            </div>

            {/* Total Present Card */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon present">✓</div>
                <div className="card-info">
                  <div className="card-number">0</div>
                  <div className="card-label">Total Present</div>
                </div>
              </div>
            </div>

            {/* Absent/On Leave Card */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon absent">✕</div>
                <div className="card-info">
                  <div className="card-number">146</div>
                  <div className="card-label">Absent/Other Shift</div>
                </div>
              </div>
            </div>

            {/* Total On Leave Card */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon leave">⚠️</div>
                <div className="card-info">
                  <div className="card-number">0</div>
                  <div className="card-label">Total On Leave</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="birthday-wrapper">
          <BirthdayCarousel />
        </div>

        <div className="attendance-wrapper">
          <div className="attendance-card">
            <h3>📅 Attendance</h3>
            <div className="attendance-filters-vertical">
              <div className="filter-group">
                <label>Company:</label>
                <select 
                  value={selectedCompany} 
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  disabled={loadingCompanies}
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Employee:</label>
                <select 
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  disabled={!selectedCompany}
                >
                  <option value="">Select Employee</option>
                  {/* Employees would be populated based on selected company */}
                </select>
              </div>
            </div>
            <div className="date-range">
              <input type="date" defaultValue="2026-03-31" />
              <span>to</span>
              <input type="date" defaultValue="2026-04-29" />
              <button>Show</button>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        {/* Category Chart */}
        <div className="chart-card">
          <h3>📊 Categorywise Chart</h3>
          <p className="chart-title">Total Employee Category-wise Present & Absent/Leave</p>
          <div className="chart-placeholder">
            <div className="bar-chart">
              <div className="bar-item">
                <span className="bar-label">OPERATOR</span>
                <div className="bar-container">
                  <div className="bar" style={{ width: '65%' }}>65</div>
                </div>
              </div>
              <div className="bar-item">
                <span className="bar-label">STAFF</span>
                <div className="bar-container">
                  <div className="bar" style={{ width: '81%' }}>81</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Reminder */}
        <div className="reminder-card">
          <h3>📋 Daily Reminder</h3>
          <div className="reminder-item">
            <span className="reminder-icon">⚠️</span>
            <span className="reminder-text">PENDING MASTER ENTRY</span>
            <span className="reminder-badge">0</span>
          </div>
          <div className="reminder-item">
            <span className="reminder-icon">✓</span>
            <span className="reminder-text">COMPLETING 6 MONTH LIST</span>
            <span className="reminder-badge">0</span>
          </div>
          <div className="reminder-item">
            <span className="reminder-icon">❌</span>
            <span className="reminder-text">ABSENT FROM 3 DAYS</span>
            <span className="reminder-badge">0</span>
          </div>
          <div className="reminder-item">
            <span className="reminder-icon">⛔</span>
            <span className="reminder-text">ESI LIMIT EXCEEDED LIST</span>
            <span className="reminder-badge">0</span>
          </div>

          <div className="device-status">
            <h4>Device Status</h4>
            <div className="status-buttons">
              <button className="status-btn online">🟢 Online 0</button>
              <button className="status-btn offline">🔴 Offline 22</button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-card">
          <h3>Employee Attendance List</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee No.</th>
                  <th>Employee Name</th>
                  <th>Plant Name</th>
                  <th>Division Name</th>
                  <th>Department Name</th>
                  <th>Designation</th>
                  <th>Time In</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Tiger Nixon</td>
                  <td>System Architect</td>
                  <td>Edinburgh</td>
                  <td>61</td>
                  <td>2011-04-25</td>
                  <td>$320,800</td>
                  <td>$320,800</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

// Time Office Dashboard
const TimeOfficeDashboard = ({ user, year }) => {
  return (
    <div className="dashboard-page">
      <h2>⏰ Time Office Dashboard</h2>
      <div className="empty-state">
        <p>Time Office management features</p>
        <p className="year-info">Year: {year}</p>
      </div>
    </div>
  );
};

// Visitor Dashboard
const VisitorDashboard = ({ user, year }) => {
  return (
    <div className="dashboard-page">
      <h2>👤 Visitor Dashboard</h2>
      <div className="empty-state">
        <p>Visitor management features</p>
        <p className="year-info">Year: {year}</p>
      </div>
    </div>
  );
};

// Payroll Dashboard
const PayrollDashboard = ({ user, year }) => {
  return (
    <div className="dashboard-page">
      <h2>💰 Payroll Dashboard</h2>
      <div className="empty-state">
        <p>Payroll management features</p>
        <p className="year-info">Year: {year}</p>
      </div>
    </div>
  );
};

export default Dashboard;
