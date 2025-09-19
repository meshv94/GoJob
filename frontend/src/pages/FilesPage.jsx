import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Card, Button, Table, Spinner, Alert, Modal, Badge } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiTrash2, FiFile, FiImage, FiFileText } from "react-icons/fi";

const API_URL = "http://192.168.1.6:5000/files";

function FilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch files
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setFiles(res.data.files || []);
    } catch (err) {
      setError("Failed to fetch files.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Dropzone setup
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchFiles();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 5 * 1024 * 1024,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png"],
      "application/pdf": [".pdf"],
      "text/csv": [".csv"],
    },
  });

  // Delete file
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchFiles();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      setError("Delete failed.");
    }
    setLoading(false);
  };

  // Icon by mimetype
  const getIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return <FiImage className="text-info" />;
    if (mimetype === "application/pdf") return <FiFileText className="text-danger" />;
    if (mimetype === "text/csv") return <FiFile className="text-success" />;
    return <FiFile />;
  };

  return (
    <div className="py-4" id="my-container">
      <Card className="mb-4 shadow-lg border-0" style={{ borderRadius: 22 }}>
        <Card.Body>
          <h4 className="fw-bold mb-3">
            <FiUpload className="me-2 text-primary" />
            Upload Attachment
          </h4>
          <div
            {...getRootProps()}
            className={`dropzone p-4 mb-3 rounded border border-2 ${isDragActive ? "bg-primary text-white" : "bg-light"}`}
            style={{ cursor: "pointer", transition: "background 0.2s" }}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="fw-bold">Drop the file here ...</p>
            ) : (
              <p>
                Drag & drop a file here, or click to select.<br />
                <small className="text-muted">Allowed: JPG, JPEG, PNG, PDF, CSV (max 5MB)</small>
              </p>
            )}
          </div>
          {uploading && <Spinner animation="border" size="sm" className="me-2" />}
          {error && <Alert variant="danger">{error}</Alert>}
        </Card.Body>
      </Card>

      <Card className="shadow-lg border-0" style={{ borderRadius: 22 }}>
        <Card.Body>
          <h5 className="fw-bold mb-3">Your Attachments</h5>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : files.length === 0 ? (
            <Alert variant="info">No attachments uploaded yet.</Alert>
          ) : (
            <Table hover responsive className="align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td>{getIcon(file.mimetype)}</td>
                    <td>
                      <span className="fw-semibold">{file.originalName}</span>
                      <Badge bg="secondary" className="ms-2">{file.mimetype.split("/")[1]}</Badge>
                    </td>
                    <td>{(file.size / 1024).toFixed(2)} KB</td>
                    <td>{new Date(file.createdAt).toLocaleString()}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="rounded-pill shadow-sm"
                        onClick={() => { setShowDeleteModal(true); setDeleteId(file._id); }}
                        title="Delete"
                      >
                        <FiTrash2 /> Delete
                      </Button>
                      {file.path ? (
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="rounded-pill ms-2 shadow-sm"
                          href={
                            file.path
                              ? `http://192.168.1.6:5000/uploads/${file.path}`
                              : "#"
                          }
                          target="_blank"
                          title="Download/View"
                          disabled={!file.path}
                        >
                          <FiFile /> View
                        </Button>
                      ) : (
                        <span className="text-muted">No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Attachment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this file? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default FilesPage;