import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Modal, Tabs, Tab, InputGroup } from 'react-bootstrap';
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
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data.emails) ? res.data.emails : [];
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
    fetchEmails();
    fetchDrafts();
  }, []);

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, from: user.email }));
    }
  }, [user]);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get('http://localhost:5000/groups');
        setGroups(Array.isArray(res.data) ? res.data : res.data.groups || []);
      } catch (err) {
        setGroups([]);
      }
    };
    fetchGroups();
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

  // Send draft
  const handleSendDraft = async (id) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/${id}/send`);
      toast.success('Draft sent!');
      fetchEmails();
      fetchDrafts();
    } catch (err) {
      toast.error('Failed to send draft');
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
                      <td>
                        {Array.isArray(email.to)
                          ? email.to.map(t => t.email).join(', ')
                          : email.to}
                      </td>
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
                  )))
                }
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
                      <td>
                        {Array.isArray(draft.to)
                          ? draft.to.map(t => t.email).join(', ')
                          : draft.to}
                      </td>
                      <td>{draft.subject}</td>
                      <td>{draft.status}</td>
                      <td>{draft.createdAt ? new Date(draft.createdAt).toLocaleString() : ''}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleSendDraft(draft._id)}
                        >
                          Send
                        </Button>
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
      <Modal show={showSendModal} onHide={() => setShowSendModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <span role="img" aria-label="draft">✉️</span> Create Email Draft
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveDraft}>
          <Modal.Body style={{ background: "#f8fafc" }}>
            <div className="mb-3">
              <Form.Label className="fw-bold">Select Group</Form.Label>
              <Form.Control
                as="select"
                onChange={e => {
                  const groupId = e.target.value;
                  if (!groupId) return;
                  const group = groups.find(g => g._id === groupId);
                  if (group && group.emails && group.emails.length > 0) {
                    setForm({
                      ...form,
                      to: group.emails.map(m => ({ email: m.email })),
                    });
                  }
                }}
                defaultValue=""
              >
                <option value="">-- Select Group --</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </Form.Control>
            </div>
            <hr />
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">From</Form.Label>
              <Form.Control
                type="email"
                value={form.from}
                readOnly
                disabled
                style={{ background: "#e9ecef", fontWeight: 500 }}
              />
            </Form.Group>
            <Form.Label className="fw-bold">To</Form.Label>
            {form.to.map((recipient, idx) => (
              <InputGroup className="mb-2" key={idx}>
                <Form.Control
                  type="email"
                  placeholder="Recipient email"
                  value={recipient.email}
                  onChange={e => handleToChange(idx, e.target.value)}
                  required
                />
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    const updated = form.to.filter((_, i) => i !== idx);
                    setForm({ ...form, to: updated.length ? updated : [{ email: '' }] });
                  }}
                  disabled={form.to.length === 1}
                  title="Remove recipient"
                >
                  &times;
                </Button>
              </InputGroup>
            ))}
            <Button
              size="sm"
              variant="outline-primary"
              className="mb-3"
              onClick={handleAddTo}
              title="Add another recipient"
            >
              + Add Recipient
            </Button>
            <hr />
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">CC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.cc.join(',')}
                onChange={e => setForm({ ...form, cc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">BCC</Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.bcc.join(',')}
                onChange={e => setForm({ ...form, bcc: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Subject</Form.Label>
              <Form.Control
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Content (HTML allowed)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Email content"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
              />
            </Form.Group>
            {/* Attachments UI can go here */}
          </Modal.Body>
          <Modal.Footer style={{ background: "#f8fafc" }}>
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
              <p>
                <strong>To:</strong>{" "}
                {Array.isArray(selectedEmail.to)
                  ? selectedEmail.to.map(t => t.email).join(", ")
                  : selectedEmail.to}
              </p>
              <p><strong>Subject:</strong> {selectedEmail.subject}</p>
              <p><strong>Status:</strong> {selectedEmail.status}</p>
              <p><strong>Body:</strong></p>
              <div
                className="border rounded p-2 mb-2"
                style={{ background: "#f8f9fa" }}
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />
              <p>
                <strong>Sent At:</strong>{" "}
                {selectedEmail.createdAt
                  ? new Date(selectedEmail.createdAt).toLocaleString()
                  : ""}
              </p>
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