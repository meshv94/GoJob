import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Modal, Tabs, Tab } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const API_URL = 'http://localhost:5000/emails';

function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [form, setForm] = useState({
    from: '',
    to: [{ email: '' }],
    cc: [],
    bcc: [],
    subject: '',
    content: '',
    attachments: []
  });
  const [savingDraft, setSavingDraft] = useState(false);
  const [tab, setTab] = useState('sent');
  const [drafts, setDrafts] = useState([]);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.emails) ? res.emails :  [];
      setEmails(data);
    } catch (err) {
      toast.error('Failed to fetch emails');
      setEmails([]);
    }
    setLoading(false);
  };

  // Fetch drafts
  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?status=draft`);
      const data = Array.isArray(res.data) ? res.data : res.data.emails || [];
      setDrafts(data);
    } catch (err) {
      toast.error('Failed to fetch drafts');
      setDrafts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmails();
    fetchDrafts();
  }, []);

  // Send email
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL, form);
      toast.success('Email sent!');
      setShowSendModal(false);
      setForm({
        from: '',
        to: [{ email: '' }],
        cc: [],
        bcc: [],
        subject: '',
        content: '',
        attachments: []
      });
      fetchEmails();
    } catch (err) {
      toast.error('Failed to send email');
    }
    setLoading(false);
  };

  // Handle input changes for dynamic fields
  const handleToChange = (idx, value) => {
    const updated = [...form.to];
    updated[idx].email = value;
    setForm({ ...form, to: updated });
  };

  const handleAddTo = () => {
    setForm({ ...form, to: [...form.to, { email: '' }] });
  };

  // Save as Draft
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    setSavingDraft(true);
    try {
      await axios.post(API_URL, { ...form, status: 'draft' });
      toast.success('Draft saved!');
      setShowSendModal(false);
      setForm({
        from: '',
        to: [{ email: '' }],
        cc: [],
        bcc: [],
        subject: '',
        content: '',
        attachments: []
      });
      fetchDrafts();
    } catch (err) {
      toast.error('Failed to save draft');
    }
    setSavingDraft(false);
  };

  // View email details
  const handleViewDetails = async (id) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setSelectedEmail(res.data.email || res.data); // handle both {email: {...}} and {...}
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Failed to fetch email details');
    }
    setLoading(false);
  };

  // Delete email
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Email deleted!');
      fetchEmails();
    } catch (err) {
      toast.error('Failed to delete email');
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
      <Tabs activeKey={tab} onSelect={setTab} className="mb-3">
        <Tab eventKey="sent" title="Sent Emails">
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No emails found.</td>
                  </tr>
                ) : (
                  emails.map(email => (
                    <tr key={email._id}>
                      <td>{email.to}</td>
                      <td>{email.subject}</td>
                      <td>{email.status}</td>
                      <td>{email.createdAt ? new Date(email.createdAt).toLocaleString() : ''}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          className="me-2"
                          onClick={() => handleViewDetails(email._id)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(email._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="drafts" title="Drafts">
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
                  <th>Saved At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drafts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No drafts found.</td>
                  </tr>
                ) : (
                  drafts.map(draft => (
                    <tr key={draft._id}>
                      <td>{draft.to}</td>
                      <td>{draft.subject}</td>
                      <td>{draft.status}</td>
                      <td>{draft.createdAt ? new Date(draft.createdAt).toLocaleString() : ''}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="info"
                          className="me-2"
                          onClick={() => handleViewDetails(draft._id)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(draft._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* Send Email Modal */}
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Email Draft</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveDraft}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>From</Form.Label>
              <Form.Control
                type="email"
                placeholder="Sender email"
                value={form.from}
                onChange={e => setForm({ ...form, from: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Label>To</Form.Label>
            {form.to.map((recipient, idx) => (
              <Form.Group className="mb-2" key={idx}>
                <Form.Control
                  type="email"
                  placeholder="Recipient email"
                  value={recipient.email}
                  onChange={e => handleToChange(idx, e.target.value)}
                  required
                />
              </Form.Group>
            ))}
            <Button size="sm" variant="secondary" onClick={handleAddTo}>Add Recipient</Button>
            <Form.Group className="mb-3 mt-3">
              <Form.Label>CC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.cc.join(',')}
                onChange={e => setForm({ ...form, cc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>BCC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.bcc.join(',')}
                onChange={e => setForm({ ...form, bcc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
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
              <Form.Label>Content (HTML allowed)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Email content"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
              />
            </Form.Group>
            {/* Attachments can be handled here if needed */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={savingDraft}
            >
              {savingDraft ? <Spinner size="sm" animation="border" /> : 'Save as Draft'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Email Details Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Email Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmail ? (
            <div>
              <p><strong>To:</strong> {selectedEmail.to}</p>
              <p><strong>Subject:</strong> {selectedEmail.subject}</p>
              <p><strong>Status:</strong> {selectedEmail.status}</p>
              <p><strong>Body:</strong></p>
              <div className="border rounded p-2 mb-2" style={{ background: "#f8f9fa" }}>
                {selectedEmail.body}
              </div>
              <p><strong>Sent At:</strong> {selectedEmail.createdAt ? new Date(selectedEmail.createdAt).toLocaleString() : ''}</p>
            </div>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default EmailsPage;