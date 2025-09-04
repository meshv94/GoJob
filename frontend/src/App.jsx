import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
// Import your new pages here
import EmailsPage from './pages/EmailsPage';
import GroupsPage from './pages/GroupsPage';
// import TemplatesPage from './pages/TemplatesPage';
// import FilesPage from './pages/FilesPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Persist dark mode preference
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.className = darkMode ? 'bg-dark text-light' : '';
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <div className={`d-flex ${darkMode ? 'bg-dark text-light' : ''}`}>
          <Sidebar onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex-grow-1 p-4">
            <PrivateRoute path="/dashboard" component={DashboardPage} />
            <PrivateRoute path="/emails" component={EmailsPage} />
            <PrivateRoute path="/groups" component={GroupsPage} />
            {/* <PrivateRoute path="/templates" component={TemplatesPage} /> */}
            {/* <PrivateRoute path="/files" component={FilesPage} /> */}
            <PrivateRoute path="/settings" render={props => (
              <SettingsPage {...props} darkMode={darkMode} setDarkMode={setDarkMode} />
            )} />
          </div>
        </div>
      </Switch>
    </Router>
  );
}

export default App;