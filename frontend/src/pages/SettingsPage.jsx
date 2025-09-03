import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaMoon, FaSun, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaUserEdit, FaKey } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/auth';

function getInitials(name, email) {
  if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase();
  if (email) return email[0].toUpperCase();
  return '?';
}

function SettingsPage({ darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/profile`);
        setUser(res.data.user || res.data); // handle both {user: {...}} and {...}
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    setPwLoading(true);
    try {
      await axios.put(`${API_URL}/change-password`, pwForm);
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    }
    setPwLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e0eafc 100%)',
        padding: '2rem',
        borderRadius: 16
      }}
    >
      <h3 className="mb-4 fw-bold d-flex align-items-center">
        <FaUserEdit className="me-2 text-primary" /> Settings
      </h3>
      <Row>
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: 18 }}>
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: darkMode ? '#343a40' : '#e9ecef',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 32,
                      marginRight: 16,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    {user ? getInitials(user.name, user.email) : <FaUserCircle />}
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: 18 }}>
                      {/* {user ? user.name || 'No Name' : '...'} */}
                    </div>
                    <div className="text-muted d-flex align-items-center">
                      <FaEnvelope className="me-1" /> {user ? user.email : '...'}
                    </div>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : user ? (
                  <div>
                    <div className="mb-2 d-flex align-items-center">
                      {user.isVerified ? (
                        <span className="text-success d-flex align-items-center">
                          <FaCheckCircle className="me-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-warning d-flex align-items-center">
                          <FaExclamationCircle className="me-1" /> Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert variant="danger">Failed to load profile.</Alert>
                )}
              </Card.Body>
            </Card>
            <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: 18 }}>
              <Card.Body>
                <Card.Title className="mb-3 d-flex align-items-center">
                  {darkMode ? <FaSun className="me-2 text-warning" /> : <FaMoon className="me-2 text-primary" />}
                  Theme
                </Card.Title>
                <Button
                  variant={darkMode ? 'light' : 'dark'}
                  onClick={() => setDarkMode(!darkMode)}
                  as={motion.button}
                  whileHover={{ scale: 1.07, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2"
                  style={{ borderRadius: 12, fontWeight: 500 }}
                >
                  {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </Button>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={6}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
          >
            <Card className="shadow-lg border-0" style={{ borderRadius: 18 }}>
              <Card.Body>
                <Card.Title className="mb-3 d-flex align-items-center">
                  <FaKey className="me-2 text-primary" /> Change Password
                </Card.Title>
                <AnimatePresence>
                  {pwMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="success">{pwMsg}</Alert>
                    </motion.div>
                  )}
                  {pwError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert variant="danger">{pwError}</Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label>Old Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaKey />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                        required
                        placeholder="Enter old password"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <FaKey />
                      </InputGroup.Text>
                      <Form.Control
                        type="password"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                        required
                        placeholder="Enter new password"
                      />
                    </InputGroup>
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={pwLoading}
                    as={motion.button}
                    whileHover={{ scale: 1.07, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2"
                    style={{ borderRadius: 12, fontWeight: 500 }}
                  >
                    {pwLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
}

export default SettingsPage;