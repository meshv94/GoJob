import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Row, Col, Spinner, InputGroup, Container } from 'react-bootstrap';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserCircle, FaMoon, FaSun, FaEnvelope, FaCheckCircle, FaExclamationCircle, FaUserEdit, FaKey, FaSave } from 'react-icons/fa';
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_URL = `${API_BASE_URL}/auth`;

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
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpData, setSmtpData] = useState({
    smtpUser: '',
    smtpPass: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/profile`);
        setUser(res.data.user || res.data);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchSMTP = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/smtp`);
        if (res.data?.smtp) {
          setSmtpData({
            smtpUser: res.data.smtp.user || '',
            smtpPass: res.data.smtp.pass || '',
            smtpHost: res.data.smtp.host || 'smtp.gmail.com',
            smtpPort: res.data.smtp.port || 587,
          });
        }
      } catch (err) {
        setSmtpData(null);
      }
      setLoading(false);
    };
    fetchSMTP();
  }, []);

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

  const handleUpdateSMTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/smtp`, smtpData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update credentials' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSmtpData({ ...smtpData, [e.target.name]: e.target.value });
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
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)'
      }}
    >
      <div id='my-container'>
        <h3 className="mb-4 fw-bold d-flex align-items-center" style={{ fontSize: '2rem', letterSpacing: '1px' }}>
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
              <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: 22, background: darkMode ? "#232526" : "#fff" }}>
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: darkMode ? '#343a40' : '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        marginRight: 20,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      {user ? getInitials(user.name, user.email) : <FaUserCircle />}
                    </div>
                    <div>
                      <div className="text-muted d-flex align-items-center" style={{ fontSize: 16 }}>
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
              <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: 22, background: darkMode ? "#232526" : "#fff" }}>
                <Card.Body>
                  <Card.Title className="mb-3 d-flex align-items-center" style={{ fontSize: 18 }}>
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
                    style={{ borderRadius: 14, fontWeight: 500, fontSize: 16 }}
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
              <Card className="shadow-lg border-0" style={{ borderRadius: 22, background: darkMode ? "#232526" : "#fff" }}>
                <Card.Body>
                  <Card.Title className="mb-3 d-flex align-items-center" style={{ fontSize: 18 }}>
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
                      style={{ borderRadius: 14, fontWeight: 500, fontSize: 16 }}
                    >
                      {pwLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
        {/* SMTP Setup Section */}
        {user && user.hasSMTP && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="smtp-section mt-5"
          >
            <Card className="shadow-lg border-0 smtp-card" style={{ borderRadius: 22, background: darkMode ? "#232526" : "#fff" }}>
              <Card.Body>
                <h4 className="fw-bold mb-3 d-flex align-items-center" style={{ fontSize: 20 }}>
                  <FaKey className="me-2 text-warning" /> Update SMTP Credentials
                </h4>
                <p className="text-muted">
                  To send emails from your own account, you need to configure SMTP settings.<br />
                  <strong>For Gmail:</strong> Enable 2FA → Go to Security → App Passwords → Generate 16-digit password.
                </p>
                {message && <Alert variant={message.type}>{message.text}</Alert>}
                <Form onSubmit={handleUpdateSMTP}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email (SMTP User)</Form.Label>
                        <Form.Control
                          type="email"
                          name="smtpUser"
                          value={smtpData.smtpUser}
                          onChange={handleChange}
                          placeholder="youremail@gmail.com"
                          required
                          readOnly
                          disabled
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Password</Form.Label>
                        <InputGroup>
                          <div style={{ position: "relative", width: "100%" }}>
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              name="smtpPass"
                              value={smtpData.smtpPass}
                              onChange={handleChange}
                              placeholder="Enter App Password"
                              required
                              style={{ paddingRight: "2.5rem" }}
                            />
                            <span
                              onClick={() => setShowPassword(!showPassword)}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                color: "#6c757d",
                              }}
                            >
                              {showPassword ? <EyeSlashFill size={18} /> : <EyeFill size={18} />}
                            </span>
                          </div>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Host</Form.Label>
                        <Form.Control
                          type="text"
                          name="smtpHost"
                          value={smtpData.smtpHost}
                          onChange={handleChange}
                          placeholder="smtp.gmail.com"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SMTP Port</Form.Label>
                        <Form.Control
                          type="number"
                          name="smtpPort"
                          value={smtpData.smtpPort}
                          onChange={handleChange}
                          placeholder="587"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button type="submit" className="btn-modern" disabled={loading}
                      style={{
                        borderRadius: 14,
                        fontWeight: 500,
                        fontSize: 16,
                        background: "linear-gradient(90deg,#007bff 0%,#00c6ff 100%)",
                        border: "none"
                      }}>
                      {loading ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> Update SMTP</>}
                    </Button>
                  </motion.div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default SettingsPage;