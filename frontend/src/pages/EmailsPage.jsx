import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Modal, Tabs, Tab, InputGroup } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${API_BASE_URL}/emails`;
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function EmailsPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
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
  const [editDraftId, setEditDraftId] = useState(null);
  const [scheduleEmailId, setScheduleEmailId] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [scheduledEmails, setScheduledEmails] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?status=sent`);
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

  // Fetch scheduled emails
  const fetchScheduledEmails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?status=scheduled`);
      const data = Array.isArray(res.data.emails) ? res.data.emails : [];
      setScheduledEmails(data);
    } catch (err) {
      toast.error('Failed to fetch scheduled emails');
      setScheduledEmails([]);
    }
    setLoading(false);
  };

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/auth/profile`);
        setUser(res.data.user || res.data);
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
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
        const res = await axios.get(`${API_BASE_URL}/groups`);
        setGroups(Array.isArray(res.data) ? res.data : res.data.groups || []);
      } catch (err) {
        setGroups([]);
      }
    };
    fetchGroups();
  }, []);

  // Fetch files
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/files`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setFiles(res.data.files || []);
      } catch (err) {
        setFiles([]);
      }
    };
    fetchFiles();
  }, []);

  // Send email
  // const handleSend = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const htmlContent = generateStyledHtml(form.content);
  //     await axios.post(API_URL, { ...form, content: htmlContent, attachments: selectedAttachments });
  //     toast.success('Email sent!');
  //     setShowSendModal(false);
  //     setForm({ ...form, attachments: [] });
  //     setSelectedAttachments([]);
  //     fetchEmails();
  //   } catch (err) {
  //     toast.error('Failed to send email');
  //   }
  //   setLoading(false);
  // };

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
    setLoading(true);
    try {
      const htmlContent = generateStyledHtml(form.content);
      if (editDraftId) {
        // Update draft
        await axios.put(`${API_URL}/${editDraftId}`, { ...form, content: htmlContent, attachments: selectedAttachments, status: 'draft' });
        toast.success('Draft updated!');
      } else {
        // Create new draft
        console.log('Creating new draft:', { ...form, status: 'draft' });
        await axios.post(API_URL, { ...form, content: htmlContent, attachments: selectedAttachments, status: 'draft' });
        toast.success('Draft saved!');
      }
      setShowSendModal(false);
      setForm({
        from: user.email,
        to: [{ email: '' }],
        cc: [],
        bcc: [],
        subject: '',
        content: '',
        attachments: []
      });
      setSelectedAttachments([]);
      setEditDraftId(null);
      fetchDrafts();
    } catch (err) {
      toast.error('Failed to save draft');
    }
    setSavingDraft(false);
    setLoading(false);
  };

  // Edit as Draft
  const handleEditDraft = (draft) => {
    setForm({
      from: draft.from,
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject,
      content: draft.content,
      attachments: draft.attachments || []
    });
    setSelectedAttachments(draft.attachments || []);
    setEditDraftId(draft._id);
    setShowSendModal(true);
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
      handleFetchEmailsBasedOnTab(tab); // <-- Refresh based on current tab
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
      handleCloseModal(); // <-- Close the send modal here
      setShowDetailModal(false); // <-- Close the details modal here
      handleFetchEmailsBasedOnTab(tab); // <-- Refresh based on current tab
      setForm({
      from: user.email,
      to: [{ email: '' }],
      cc: [],
      bcc: [],
      subject: '',
      content: '',
      attachments: []
    });
    } catch (err) {
      toast.error('Failed to send draft');
    }
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowSendModal(false);
    setEditDraftId(null);
    setForm({
      from: user.email,
      to: [{ email: '' }],
      cc: [],
      bcc: [],
      subject: '',
      content: '',
      attachments: []
    });
  };

  const handleFetchEmailsBasedOnTab = (tab) => {
    if (tab === 'sent') fetchEmails();
    if (tab === 'drafts') fetchDrafts();
    if (tab === 'scheduled') fetchScheduledEmails();
  }

  useEffect(() => {
    handleFetchEmailsBasedOnTab(tab);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
  }, [tab]);

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
                          variant="success"
                          className="me-2"
                          onClick={() => handleViewDetails(email._id)}
                        >
                          Details
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(email._id)}
                        >
                          Delete
                        </Button> */}
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
                        {/* <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleSendDraft(draft._id)}
                        >
                          Send
                        </Button> */}
                        <Button
                          size="sm"
                          variant="success"
                          className="me-2"
                          onClick={() => handleViewDetails(draft._id)}
                        >
                          Details
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          className="me-2"
                          onClick={() => handleDelete(draft._id)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEditDraft(draft)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Tab>
        <Tab eventKey="scheduled" title="Scheduled Emails">
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
                  <th>Scheduled At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledEmails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center">No scheduled emails found.</td>
                  </tr>
                ) : (
                  scheduledEmails.map(email => (
                    <tr key={email._id}>
                      <td>
                        {Array.isArray(email.to)
                          ? email.to.map(t => t.email).join(', ')
                          : email.to}
                      </td>
                      <td>{email.subject}</td>
                      <td>{email.status}</td>
                      <td>
                        {email.scheduledAt
                          ? new Date(email.scheduledAt).toLocaleString()
                          : ''}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
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
      </Tabs>

      {/* Send Email Modal */}
      <Modal
        show={showSendModal}
        onHide={() => setShowSendModal(false)}
        centered
        size="lg"
        className="email-compose-modal"
      >
        {/* Gradient header with icon */}
        <Modal.Header
          closeButton
          className="border-0 text-white"
          style={{ background: "linear-gradient(90deg, #3b82f6, #2563eb)" }}
        >
          <Modal.Title className="fw-bold d-flex align-items-center">
            Create Email Draft
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSaveDraft}>
          <Modal.Body className="px-4 py-3 bg-light">
            {/* Select Group */}
            <div className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-people me-2"></i> Select Group
              </Form.Label>
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
                className="rounded-pill shadow-sm"
              >
                <option value="">-- Select Group --</option>
                {groups.map(group => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </Form.Control>
            </div>

            {/* From */}
            <Form.Group className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-person-circle me-2"></i> From
              </Form.Label>
              <Form.Control
                type="email"
                value={form.from}
                readOnly
                disabled
                className="shadow-sm"
                style={{ background: "#e9ecef", fontWeight: 500 }}
              />
            </Form.Group>

            {/* To */}
            <Form.Label className="fw-bold text-muted">
              <i className="bi bi-envelope me-2"></i> To
            </Form.Label>
            {form.to.map((recipient, idx) => (
              <InputGroup className="mb-2 animate-slideUp" key={idx}>
                <Form.Control
                  type="email"
                  placeholder="Recipient email"
                  value={recipient.email}
                  onChange={e => handleToChange(idx, e.target.value)}
                  required
                  className="shadow-sm"
                />
                <Button
                  variant="outline-danger"
                  onClick={() => {
                    const updated = form.to.filter((_, i) => i !== idx);
                    setForm({
                      ...form,
                      to: updated.length ? updated : [{ email: '' }],
                    });
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
              className="mb-3 rounded-pill shadow-sm"
              onClick={handleAddTo}
            >
              + Add Recipient
            </Button>

            {/* CC */}
            <Form.Group className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-people-fill me-2"></i> CC
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.cc.join(',')}
                onChange={e =>
                  setForm({
                    ...form,
                    cc: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })
                }
                className="shadow-sm"
              />
            </Form.Group>

            {/* BCC */}
            <Form.Group className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-eye-slash me-2"></i> BCC
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Comma separated emails"
                value={form.bcc.join(',')}
                onChange={e =>
                  setForm({
                    ...form,
                    bcc: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                  })
                }
                className="shadow-sm"
              />
            </Form.Group>

            {/* Subject */}
            <Form.Group className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-card-text me-2"></i> Subject
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                required
                className="shadow-sm"
              />
            </Form.Group>

            {/* Content */}
            <Form.Group className="mb-3 animate-fadeIn">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-file-text me-2"></i> Content
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Write your email content (HTML supported)"
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                className="shadow-sm"
              />
            </Form.Group>

            {/* Attachments */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold text-muted">
                <i className="bi bi-paperclip me-2"></i> Attach Files
              </Form.Label>
              <div className="border rounded p-2 bg-light" style={{ maxHeight: 180, overflowY: 'auto' }}>
                {files.length === 0 ? (
                  <span className="text-muted">No files uploaded.</span>
                ) : (
                  files.map(file => (
                    <Form.Check
                      key={file._id}
                      type="checkbox"
                      id={`attach-${file._id}`}
                      label={file.originalName}
                      checked={selectedAttachments.includes(file._id)}
                      onChange={e => {
                        setSelectedAttachments(prev =>
                          e.target.checked
                            ? [...prev, file._id]
                            : prev.filter(id => id !== file._id)
                        );
                      }}
                    />
                  )))
                }
              </div>
              {/* Show selected attachments with remove option */}
              {selectedAttachments.length > 0 && (
                <div className="mt-2">
                  <div className="fw-bold mb-1">Selected Attachments:</div>
                  {selectedAttachments.map(id => {
                    const file = files.find(f => f._id === id);
                    if (!file) return null;
                    return (
                      <span key={id} className="badge bg-secondary me-2">
                        {file.originalName}
                        <Button
                          size="sm"
                          variant="link"
                          className="text-danger ms-1 p-0"
                          onClick={() =>
                            setSelectedAttachments(prev => prev.filter(fid => fid !== id))
                          }
                          title="Remove"
                        >
                          &times;
                        </Button>
                      </span>
                    );
                  })}
                </div>
              )}
            </Form.Group>
          </Modal.Body>

          {/* Footer */}
          <Modal.Footer className="border-0 bg-light">
            <Button
              variant="outline-secondary"
              className="rounded-pill px-4 shadow-sm"
              onClick={() => setShowSendModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              type="submit"
              disabled={savingDraft}
              className="rounded-pill px-4 shadow-sm"
            >
              {savingDraft ? (
                <Spinner size="sm" animation="border" />
              ) : (
                "Save as Draft"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Email Details Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        centered
        size="lg"
        className="email-detail-modal"
      >
        <Modal.Header closeButton className="border-0 p-3" style={{ background: "linear-gradient(90deg, #3b82f6, #2563eb)" }}>
          <Modal.Title className="fw-bold text-white d-flex align-items-center">
            <i className="bi bi-envelope-fill me-2"></i> Email Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 py-3 bg-light">
          {selectedEmail ? (
            <div className="email-details">

              {/* To */}
              <div className="d-flex align-items-center mb-3 p-3 bg-white rounded shadow-sm">
                <i className="bi bi-people me-2 text-primary fs-5"></i>
                <div>
                  <small className="text-muted d-block">To</small>
                  <span className="fw-semibold">
                    {Array.isArray(selectedEmail.to)
                      ? selectedEmail.to.map(t => t.email).join(", ")
                      : selectedEmail.to}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <div className="d-flex align-items-center mb-3 p-3 bg-white rounded shadow-sm">
                <i className="bi bi-envelope-paper me-2 text-primary fs-5"></i>
                <div>
                  <small className="text-muted d-block">Subject</small>
                  <span className="fw-semibold">{selectedEmail.subject}</span>
                </div>
              </div>

              {/* Status + Date */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-white rounded shadow-sm">
                <div>
                  <span
                    className={`badge px-3 py-2 rounded-pill ${
                      selectedEmail.status === "sent"
                        ? "bg-success"
                        : selectedEmail.status === "failed"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {selectedEmail.status === "sent" ? "✔ Sent" : selectedEmail.status}
                  </span>
                </div>
                <div className="text-muted small">
                  <i className="bi bi-clock me-1"></i>
                  {selectedEmail.createdAt
                    ? new Date(selectedEmail.createdAt).toLocaleString()
                    : ""}
                </div>
              </div>

              {/* Message Content */}
              <h6 className="fw-bold mb-2">Message Content</h6>
              <div
                className="border rounded p-3 bg-white shadow-sm email-body"
                dangerouslySetInnerHTML={{ __html: selectedEmail.content }}
              />

              {/* Attachments */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold mb-2">Attachments</h6>
                  <div>
                    {selectedEmail.attachments.map(id => {
                      const file = files.find(f => f._id === id);
                      if (!file) return null;
                      return (
                        <a
                          key={id}
                          href={`${API_BASE_URL}/uploads/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="badge bg-info text-dark me-2"
                          style={{ textDecoration: 'none' }}
                        >
                          {file.originalName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex justify-content-center align-items-center py-4">
              <Spinner animation="border" />
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0 bg-light">
          { selectedEmail && selectedEmail.status !== 'sent' &&
            <>
                <Button
                  variant="success"
                  className="rounded-pill px-4 me-2 shadow-sm"
                  onClick={() => handleSendDraft(selectedEmail._id)}
                >
                  Send
                </Button>
              { selectedEmail.status !== 'scheduled' && 
                <Button
                  variant="secondary"
                  className="rounded-pill px-4 me-2 shadow-sm"
                  onClick={() => {
                    setScheduleEmailId(selectedEmail._id);
                    setShowScheduleModal(true);
                  }}
                >
                  Schedule
                </Button>
              }
            </>
          }
          <Button
            variant="dark"
            className="rounded-pill px-4"
            onClick={() => setShowDetailModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Schedule Email Modal */}
      <Modal
        show={showScheduleModal}
        onHide={() => setShowScheduleModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Schedule Email</Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={async e => {
            e.preventDefault();
            setScheduling(true);
            setLoading(true);
            try {
              await axios.post(`${API_URL}/${scheduleEmailId}/schedule`, { scheduledAt, timeZone });
              toast.success('Email scheduled!');
              setShowScheduleModal(false);
              setShowDetailModal(false);
              setScheduledAt('');
              setScheduleEmailId(null);
              handleFetchEmailsBasedOnTab(tab);
              setForm({ ...form, attachments: [] });
            } catch (err) {
              toast.error('Failed to schedule email');
            }
            setScheduling(false);
            setLoading(false);
          }}
        >
          <Modal.Body>
            <Form.Group>
              <Form.Label>Select Date & Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={scheduling}>
              {scheduling ? <Spinner size="sm" animation="border" /> : 'Schedule'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
}

function generateStyledHtml(text) {
  // Escape HTML special characters
  const escapeHtml = str =>
    str.replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");

  // Convert line breaks to <p> tags
  const paragraphs = escapeHtml(text)
    .split(/\n{2,}/) // Split by double line breaks for paragraphs
    .map(para => `<p style="margin:0 0 12px 0;font-size:1rem;line-height:1.7;font-family:'Segoe UI',Arial,sans-serif;color:#222;">${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  // Responsive styles with media queries
  const responsiveStyle = `
    <style>
      .email-responsive-container {
        background: #f8fafc;
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(44,62,80,0.08);
        font-family: 'Segoe UI', Arial, sans-serif;
        max-width: 700px;
        margin: auto;
      }
      @media (max-width: 900px) {
        .email-responsive-container {
          padding: 16px;
          max-width: 98vw;
        }
        .email-responsive-container p {
          font-size: 0.95rem;
        }
      }
      @media (max-width: 600px) {
        .email-responsive-container {
          padding: 8px;
          border-radius: 6px;
        }
        .email-responsive-container p {
          font-size: 0.92rem;
        }
      }
    </style>
  `;

  // Wrap with responsive container
  return `
    ${responsiveStyle}
    <div class="email-responsive-container">
      ${paragraphs}
    </div>
  `;
}

export default EmailsPage;