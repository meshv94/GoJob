import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { FaEnvelopeOpenText, FaUsers, FaKey, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
// import './DashboardPage.css'; // external custom CSS

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [smtpData, setSmtpData] = useState({
    smtpUser: '',
    smtpPass: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);


  const history = useHistory();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [emails, groups] = await Promise.all([
          axios.get('http://localhost:5000/emails'),
          axios.get('http://localhost:5000/groups'),
        ]);
        setStats({
          emails: Array.isArray(emails.data.emails) ? emails.data.emails.length : 0,
          groups: Array.isArray(groups.data.groups) ? groups.data.groups.length : (
            Array.isArray(groups.data) ? groups.data.length : 0
          ),
        });
      } catch {
        setStats({ emails: 0, groups: 0 });
      }
    };
    fetchStats();
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auth/profile');
        setUser(res.data.user || res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (user) {
      setSmtpData(f => ({ ...f, smtpUser: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setSmtpData({ ...smtpData, [e.target.name]: e.target.value });
  };

  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/auth/smtp', smtpData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: res.data.message || 'SMTP credentials saved!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save credentials' });
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return <div className="text-center my-5"><Spinner animation="border" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="dashboard-container"
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Dashboard</h3>
      </div>

      <Row>
        <Col md={4}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="mb-3 shadow border-0" style={{ borderRadius: 18 }}>
              <Card.Body className="text-center">
                <FaEnvelopeOpenText size={48} className="text-primary mb-2" />
                <Card.Title className="fw-bold">Sent Emails</Card.Title>
                <Card.Text className="stat-number">{stats.emails}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={4}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="mb-3 shadow border-0" style={{ borderRadius: 18 }}>
              <Card.Body className="text-center">
                <FaUsers size={48} className="text-success mb-2" />
                <Card.Title className="fw-bold">Groups</Card.Title>
                <Card.Text className="stat-number">{stats.groups}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* SMTP Setup Section */}
      {
        !user.hasSMTP && (
          <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="smtp-section mt-5"
      >
        <Card className="shadow-lg border-0 smtp-card">
          <Card.Body>
            <h4 className="fw-bold mb-3"><FaKey className="me-2 text-warning" /> Setup SMTP Credentials</h4>
            <p className="text-muted">
              To send emails from your own account, you need to configure SMTP settings.  
              <br /><strong>For Gmail:</strong> Enable 2FA → Go to Security → App Passwords → Generate 16-digit password.
            </p>

            {message && <Alert variant={message.type}>{message.text}</Alert>}

            <Form onSubmit={handleSaveSMTP}>
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
                    <Form.Control
                      type="password"
                      name="smtpPass"
                      value={smtpData.smtpPass}
                      onChange={handleChange}
                      placeholder="Enter App Password"
                      required
                    />
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
                <Button type="submit" className="btn-modern" disabled={loading}>
                  {loading ? <Spinner animation="border" size="sm" /> : <><FaSave className="me-2" /> Save Settings</>}
                </Button>
              </motion.div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
        )
      }
    </motion.div>
  );
}

export default DashboardPage;
