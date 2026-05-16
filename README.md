# HRDesk Frontend

React-based frontend for HRDesk Human Resource Management System.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

Application will open at `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          - Login page
│   ├── Dashboard.jsx      - Main dashboard
│   ├── Navbar.jsx         - Navigation bar
│   └── ...
├── pages/
│   ├── Employees.jsx      - Employee management
│   ├── Attendance.jsx     - Attendance tracking
│   └── ...
├── services/
│   └── api.js             - API client
├── App.jsx                - Main app component
├── index.jsx              - Entry point
└── App.css               - Global styles
```

## Login Form

The login form includes:
- Username field
- Password field
- Year selector (current year: 2026)
- Financial Year selector (e.g., 2026-2027)

## Features

- User authentication with JWT tokens
- Employee management
- Attendance tracking
- Allowance management
- Dashboard with HR statistics
- Responsive UI design

## API Connection

Configure API endpoint in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Building for Production

```bash
npm run build
```

Optimized build will be in the `build/` directory.
