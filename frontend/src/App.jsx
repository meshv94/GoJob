import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, useHistory } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import EmailsPage from './pages/EmailsPage';
import GroupsPage from './pages/GroupsPage';
import SettingsPage from './pages/SettingsPage';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [hasSmtp, setHasSmtp] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    document.body.className = darkMode ? 'bg-dark text-light' : '';
  }, [darkMode]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await axios.get('http://localhost:5000/auth/profile');
        // console.log("getting", data.data.user.hasSMTP)
        setHasSmtp(data.data.user.hasSMTP);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  //Logs 
  useEffect(()=>{
    console.log("hasSmtp", hasSmtp);
    console.log("showWarning", showWarning)
  }, [hasSmtp]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Wrapper to protect SMTP-dependent routes
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <PrivateRoute
      {...rest}
      render={(props) => {
        if (hasSmtp) {
          return <Component {...props} />;
        } else {
          // Trigger modal safely
          if (!showWarning) setShowWarning(true);
          return null; // block the component
        }
      }}
    />
  );

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <div className={`d-flex ${darkMode ? 'bg-dark text-light' : ''}`}>
          <Sidebar onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex-grow-1 p-4">
            <PrivateRoute path="/dashboard" component={DashboardPage} />
            <ProtectedRoute path="/emails" component={EmailsPage} />
            <ProtectedRoute path="/groups" component={GroupsPage} />
            <PrivateRoute
              path="/settings"
              render={(props) => (
                <SettingsPage {...props} darkMode={darkMode} setDarkMode={setDarkMode} />
              )}
            />
          </div>
        </div>
      </Switch>

      {/* Warning Modal */}
      <Modal show={showWarning} onHide={() => setShowWarning(false)} centered size="lg">
        <Modal.Header >
          <Modal.Title>⚠️ SMTP Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You need to add your SMTP details in <b>Settings</b> to use this feature.
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={() => setShowWarning(false)}>
            Close
          </Button> */}
          <Button
            variant="primary"
            onClick={() => {
              setShowWarning(false);
              window.location.href = '/dashboard';
            }}
          >
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>
    </Router>
  );
}

export default App;
