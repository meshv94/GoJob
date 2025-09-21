import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { FaEnvelopeOpenText, FaEnvelope, FaRegClock, FaUsers, FaKey, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
// import './DashboardPage.css'; // external custom CSS

function DashboardPage({ setHasSmtp }) {
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sent, drafts, scheduled, groups] = await Promise.all([
          axios.get('https://gojob-backend-p7y0.onrender.com/emails?status=sent'),
          axios.get('https://gojob-backend-p7y0.onrender.com/emails?status=draft'),
          axios.get('https://gojob-backend-p7y0.onrender.com/emails?status=scheduled'),
          axios.get('https://gojob-backend-p7y0.onrender.com/groups'),
        ]);
        setStats({
          sent: Array.isArray(sent.data.emails) ? sent.data.emails.length : 0,
          drafts: Array.isArray(drafts.data.emails) ? drafts.data.emails.length : 0,
          scheduled: Array.isArray(scheduled.data.emails) ? scheduled.data.emails.length : 0,
          groups: Array.isArray(groups.data.groups) ? groups.data.groups.length : (
            Array.isArray(groups.data) ? groups.data.length : 0
          ),
        });
      } catch {
        setStats({ sent: 0, drafts: 0, scheduled: 0, groups: 0 });
      }
    };
    fetchStats();
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('https://gojob-backend-p7y0.onrender.com/auth/profile');
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
      setHasSmtp(user.hasSMTP);
    }
  }, [user, setHasSmtp]);

  const handleChange = (e) => {
    // Trim whitespace for smtpPass
    const { name, value } = e.target;
    setSmtpData({
      ...smtpData,
      [name]: name === 'smtpPass' ? value.replace(/\s+/g, '') : value
    });
  };

  const handleSaveSMTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('https://gojob-backend-p7y0.onrender.com/auth/smtp', smtpData, {
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
        <Col md={3}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="mb-3 shadow border-0" style={{ borderRadius: 18 }}>
              <Card.Body className="text-center">
                <FaEnvelopeOpenText size={48} className="text-primary mb-2" />
                <Card.Title className="fw-bold">Sent Emails</Card.Title>
                <Card.Text className="stat-number">{stats.sent}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="mb-3 shadow border-0" style={{ borderRadius: 18 }}>
              <Card.Body className="text-center">
                <FaEnvelope size={48} className="text-info mb-2" />
                <Card.Title className="fw-bold">Draft Emails</Card.Title>
                <Card.Text className="stat-number">{stats.drafts}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="mb-3 shadow border-0" style={{ borderRadius: 18 }}>
              <Card.Body className="text-center">
                <FaRegClock size={48} className="text-warning mb-2" />
                <Card.Title className="fw-bold">Scheduled Emails</Card.Title>
                <Card.Text className="stat-number">{stats.scheduled}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col md={3}>
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
        user && !user.hasSMTP && (
          <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="smtp-section mt-5"
      >
        <Card
        className="border-0 shadow-lg smtp-card"
        style={{
          borderRadius: "1.5rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0eafc 100%)",
          boxShadow: "0 8px 32px rgba(44,62,80,0.10)"
        }}
      >
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div
              style={{
                background: "linear-gradient(90deg,#f59e42 0%,#f43f5e 100%)",
                borderRadius: "50%",
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(244,63,94,0.12)",
                marginRight: 18
              }}
            >
              <FaKey size={25} className="text-white" />
            </div>
            <h4 className="fw-bold mb-0" style={{ fontSize: 24, letterSpacing: 1 }}>
              Setup SMTP Credentials
            </h4>
          </div>
          <p className="text-muted mb-4" style={{ fontSize: 17 }}>
            To send emails from your own account, you need to configure SMTP settings.<br />
            <strong>How to get your Gmail SMTP password:</strong>
            <ol className="mt-2" style={{ paddingLeft: 18 }}>
              <li>Open <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer">Google Account Security</a>.</li>
              <li>Turn on <b>2-Step Verification</b> if not already enabled.</li>
              <li>Scroll down and click <b>App Passwords</b> (you may need to sign in again).</li>
              <li>Under <b>Select app</b>, choose <b>Mail</b>. Under <b>Select device</b>, choose <b>Other</b> and enter a name (e.g. "Gojob").</li>
              <li>Click <b>Generate</b>. Copy the 16-character password shown.</li>
              <li>Paste this password into the <b>SMTP Password</b> field below.</li>
            </ol>
            <span className="text-danger">Note: This password is not your Google account password. It is a special app password for sending emails securely.</span>
          </p>

          {message && <Alert variant={message.type}>{message.text}</Alert>}

          <Form onSubmit={handleSaveSMTP}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person-circle me-2"></i> Email (SMTP User)
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="smtpUser"
                    value={smtpData.smtpUser}
                    onChange={handleChange}
                    placeholder="youremail@gmail.com"
                    required
                    readOnly
                    disabled
                    className="rounded-pill shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-key me-2"></i> SMTP Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="smtpPass"
                    value={smtpData.smtpPass}
                    onChange={handleChange}
                    placeholder="Enter SMTP Password"
                    required
                    className="rounded-pill shadow-sm"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-hdd-network me-2"></i> SMTP Host
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="smtpHost"
                    value={smtpData.smtpHost}
                    onChange={handleChange}
                    placeholder="smtp.gmail.com"
                    className="rounded-pill shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-plug me-2"></i> SMTP Port
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="smtpPort"
                    value={smtpData.smtpPort}
                    onChange={handleChange}
                    placeholder="587"
                    className="rounded-pill shadow-sm"
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
