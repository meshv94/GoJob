import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Button } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { logout } from '../api/auth';
import { FaEnvelopeOpenText, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

function DashboardPage() {
  const [stats, setStats] = useState(null);
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
    localStorage.removeItem('token');
    history.push('/');
  };

  if (!stats) {
    return <div className="text-center my-5"><Spinner animation="border" /></div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
        padding: '2rem',
        borderRadius: 16
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Dashboard</h3>
        <Button
          variant="outline-danger"
          onClick={handleLogout}
          as={motion.button}
          whileHover={{ scale: 1.07 }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
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
                <Card.Text style={{ fontSize: 40, fontWeight: 700 }}>{stats.emails}</Card.Text>
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
                <Card.Text style={{ fontSize: 40, fontWeight: 700 }}>{stats.groups}</Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        {/* Add more stats as needed */}
      </Row>
    </motion.div>
  );
}

export default DashboardPage;