import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Spinner, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';

const API_URL = 'https://gojob-backend-p7y0.onrender.com/groups';

function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    emails: [{ email: '', name: '', tag: '' }],
    minEmails: 1,
    maxEmails: 100,
    tags: [],
    description: ''
  });
  const [editId, setEditId] = useState(null);

  // Fetch groups
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setGroups(Array.isArray(res.data) ? res.data : res.data.groups || []);
    } catch (err) {
      toast.error('Failed to fetch groups');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Add or Edit group
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        emails: form.emails.filter(e => e.email), // remove empty
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
      };
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, payload);
        toast.success('Group updated!');
      } else {
        await axios.post(API_URL, payload);
        toast.success('Group created!');
      }
      setShowModal(false);
      setForm({
        name: '',
        emails: [{ email: '', name: '', tag: '' }],
        minEmails: 1,
        maxEmails: 100,
        tags: [],
        description: ''
      });
      setEditId(null);
      fetchGroups();
    } catch (err) {
      toast.error('Failed to save group');
    }
    setLoading(false);
  };

  // Handle edit
  const handleEdit = (group) => {
    setForm({
      name: group.name,
      emails: group.emails && group.emails.length > 0 ? group.emails : [{ email: '', name: '', tag: '' }],
      minEmails: group.minEmails || 1,
      maxEmails: group.maxEmails || 100,
      tags: group.tags || [],
      description: group.description || ''
    });
    setEditId(group._id);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      toast.success('Group deleted!');
      fetchGroups();
    } catch (err) {
      toast.error('Failed to delete group');
    }
    setLoading(false);
  };

  // Handle emails array in form
  const handleEmailChange = (idx, field, value) => {
    const updated = [...form.emails];
    updated[idx][field] = value;
    setForm({ ...form, emails: updated });
  };
  const handleAddEmail = () => {
    setForm({ ...form, emails: [...form.emails, { email: '', name: '', tag: '' }] });
  };
  const handleRemoveEmail = (idx) => {
    const updated = form.emails.filter((_, i) => i !== idx);
    setForm({ ...form, emails: updated.length ? updated : [{ email: '', name: '', tag: '' }] });
  };

  return (
    <div>
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Groups</h3>
        <Button onClick={() => { setShowModal(true); setForm({
          name: '',
          emails: [{ email: '', name: '', tag: '' }],
          minEmails: 1,
          maxEmails: 100,
          tags: [],
          description: ''
        }); setEditId(null); }}>
          Create Group
        </Button>
      </div>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Members</th>
              <th>Description</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No groups found.</td>
              </tr>
            ) : (
              groups.map(group => (
                <tr key={group._id}>
                  <td>{group.name}</td>
                  <td>
                    {group.emails && group.emails.length > 0
                      ? group.emails.map(m => m.email).join(', ')
                      : 'No members'}
                  </td>
                  <td>{group.description || '-'}</td>
                  <td>{group.tags && group.tags.length > 0 ? group.tags.join(', ') : '-'}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(group)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(group._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Add/Edit Group Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? 'Edit Group' : 'Create Group'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Label>Members</Form.Label>
            {form.emails.map((member, idx) => (
              <div key={idx} className="d-flex mb-2 gap-2">
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={member.email}
                  onChange={e => handleEmailChange(idx, 'email', e.target.value)}
                  required
                />
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={member.name}
                  onChange={e => handleEmailChange(idx, 'name', e.target.value)}
                />
                <Form.Control
                  type="text"
                  placeholder="Tag"
                  value={member.tag}
                  onChange={e => handleEmailChange(idx, 'tag', e.target.value)}
                />
                <Button variant="danger" size="sm" onClick={() => handleRemoveEmail(idx)} disabled={form.emails.length === 1}>×</Button>
              </div>
            ))}
            <Button size="sm" variant="secondary" className="mb-3" onClick={handleAddEmail}>
              Add Member
            </Button>
            <Form.Group className="mb-3">
              <Form.Label>Min Emails</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.minEmails}
                onChange={e => setForm({ ...form, minEmails: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Max Emails</Form.Label>
              <Form.Control
                type="number"
                min={form.minEmails}
                value={form.maxEmails}
                onChange={e => setForm({ ...form, maxEmails: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags (comma separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="tag1, tag2"
                value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags}
                onChange={e => setForm({ ...form, tags: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : (editId ? 'Update' : 'Create')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default GroupsPage;