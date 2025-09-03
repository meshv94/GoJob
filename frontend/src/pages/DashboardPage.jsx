import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { logout } from '../api/auth';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Replace with your actual stats endpoint or combine multiple API calls
        const [emails, groups] = await Promise.all([
          axios.get('http://localhost:5000/emails'),
          axios.get('http://localhost:5000/groups'),
        ]);
        setStats({
          emails: emails.data.length,
          groups: groups.data.length,
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
    } catch (e) {
      // Optionally handle error
    }
    localStorage.removeItem('token');
    history.push('/');
  };

  if (!stats) {
    return <div className="text-center my-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h3 className="mb-4">Dashboard</h3>
      <Row>
        <Col md={4}>
          <Card className="mb-3 shadow">
            <Card.Body>
              <Card.Title>Sent Emails</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{stats.emails}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3 shadow">
            <Card.Body>
              <Card.Title>Groups</Card.Title>
              <Card.Text style={{ fontSize: 32 }}>{stats.groups}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Add more stats as needed */}
      </Row>
    </div>
  );
}

export default DashboardPage;