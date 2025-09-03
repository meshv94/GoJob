import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/emails';

function GroupsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [form, setForm] = useState({ to: '', subject: '', body: '' });

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setEmails(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch emails');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  // Send email
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL, form);
      toast.success('Email sent!');
      setShowSendModal(false);
      setForm({ to: '', subject: '', body: '' });
      fetchEmails();
    } catch (err) {
      toast.error('Failed to send email');
    }
    setLoading(false);
  };

  return (
    <div>
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Emails</h3>
        <Button onClick={() => setShowSendModal(true)}>Send Email</Button>
      </div>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>To</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Sent At</th>
            </tr>
          </thead>
          <tbody>
            {emails.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">No emails found.</td>
              </tr>
            ) : (
              emails.map(email => (
                <tr key={email._id}>
                  <td>{email.to}</td>
                  <td>{email.subject}</td>
                  <td>{email.status}</td>
                  <td>{email.createdAt ? new Date(email.createdAt).toLocaleString() : ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Send Email Modal */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Send Email</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSend}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>To</Form.Label>
              <Form.Control
                type="email"
                placeholder="Recipient email"
                value={form.to}
                onChange={e => setForm({ ...form, to: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Body</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Email body"
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : 'Send'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default GroupsPage;