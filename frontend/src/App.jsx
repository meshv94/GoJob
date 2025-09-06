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
import { CircleLoader } from 'react-spinners';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [hasSmtp, setHasSmtp] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [globalError, setGlobalError] = useState(false);

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
        setHasSmtp(data.data.user.hasSMTP);
      } catch (error) {
        setGlobalError(true); // <-- set error if backend fails
        console.error('Error fetching profile:', error);
      }
      setProfileLoading(false); // <-- set loading to false after fetch
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
    setProfileLoading(false);
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

  if (globalError) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <h2 className="text-danger mb-3">🚨 Something went wrong</h2>
        <p>We couldn't connect to the backend server.<br />Please try again later.</p>
        <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  return (
    <Router>
      {profileLoading ? (
        <div className="d-flex justify-content-center my-4">
            <CircleLoader color="#007bff" size={150} />
        </div>
      ) : (
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
      )}

      {/* Modern SMTP Warning Modal */}
      <Modal
        show={showWarning}
        centered
        size="md"
        className="smtp-warning-modal"
      >
        <Modal.Header
          className="border-0 text-white"
          style={{
            background: "linear-gradient(90deg, #f59e42 0%, #f43f5e 100%)"
          }}
        >
          <Modal.Title className="fw-bold d-flex align-items-center">
            <span style={{ fontSize: 32, marginRight: 12 }}>⚠️</span>
            SMTP Required
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="px-4 py-4"
          style={{
            background: "linear-gradient(135deg, #fff7ed 0%, #ffe4e6 100%)",
            borderBottomLeftRadius: "1rem",
            borderBottomRightRadius: "1rem"
          }}
        >
          <div className="d-flex flex-column align-items-center">
            <div
              className="mb-3"
              style={{
                background: "#fff",
                borderRadius: "50%",
                width: 70,
                height: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(244,63,94,0.12)"
              }}
            >
              <span style={{ fontSize: 36 }}>🔒</span>
            </div>
            <h4 className="fw-bold mb-2 text-danger text-center">SMTP Setup Needed</h4>
            <p className="text-center text-muted mb-3" style={{ fontSize: 17 }}>
              To use email features, please add your <b>SMTP details</b> in <span className="text-danger">Settings</span>.
              <br />
              This helps us send emails securely from your account.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Button
                variant="danger"
                className="rounded-pill px-4 shadow-sm"
                onClick={() => {
                  setShowWarning(false);
                  window.location.href = '/dashboard';
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Router>
  );
}

export default App;
