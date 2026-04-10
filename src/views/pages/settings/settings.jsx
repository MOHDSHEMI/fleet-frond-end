import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

const Settings = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit modal state
  const [editModal, setEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'user' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Edit ──────────────────────────────────────────────
  const openEditModal = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name || '', email: user.email, role: user.role });
    setEditModal(true);
  };

  const handleEdit = async () => {
    setEditLoading(true);
    try {
      await api.patch(`/users/${editUser.id}`, editForm);
      setSuccess(`User ${editUser.email} updated successfully.`);
      setEditModal(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const openDeleteModal = (user) => {
    setDeleteUser(user);
    setDeleteModal(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/users/${deleteUser.id}`);
      setSuccess(`User ${deleteUser.email} deleted successfully.`);
      setDeleteModal(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <CRow className="justify-content-center">
        <CCol xs={12} md={10} lg={9}>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Settings - Registered Users</h4>
                <CButton color="primary" onClick={() => navigate('/register')}>
                  Add New User
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody>
              {error && <CAlert color="danger" dismissible onClose={() => setError('')}>{error}</CAlert>}
              {success && <CAlert color="success" dismissible onClose={() => setSuccess('')}>{success}</CAlert>}

              {loading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : (
                <CTable hover responsive bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>#</CTableHeaderCell>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>Email</CTableHeaderCell>
                      <CTableHeaderCell>Role</CTableHeaderCell>
                      <CTableHeaderCell>Registered Date</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {users.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="6" className="text-center py-4">
                          No registered users found.
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      users.map((user, index) => (
                        <CTableRow key={user.id}>
                          <CTableDataCell>{index + 1}</CTableDataCell>
                          <CTableDataCell>{user.name || '—'}</CTableDataCell>
                          <CTableDataCell>{user.email}</CTableDataCell>
                          <CTableDataCell>
                            <CBadge color={user.role === 'admin' ? 'danger' : 'info'}>
                              {user.role}
                            </CBadge>
                          </CTableDataCell>
                          <CTableDataCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => openEditModal(user)}
                            >
                              Edit
                            </CButton>
                            <CButton
                              color="danger"
                              size="sm"
                              onClick={() => openDeleteModal(user)}
                            >
                              Delete
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ── Edit Modal ── */}
      <CModal visible={editModal} onClose={() => setEditModal(false)}>
        <CModalHeader>
          <CModalTitle>Edit User</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CInputGroup className="mb-3">
              <CInputGroupText>Name</CInputGroupText>
              <CFormInput
                placeholder="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Email</CInputGroupText>
              <CFormInput
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </CInputGroup>
            <CInputGroup className="mb-3">
              <CInputGroupText>Role</CInputGroupText>
              <CFormSelect
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </CFormSelect>
            </CInputGroup>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditModal(false)}>
            Cancel
          </CButton>
          <CButton color="warning" onClick={handleEdit} disabled={editLoading}>
            {editLoading ? <CSpinner size="sm" /> : 'Save Changes'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ── Delete Confirm Modal ── */}
      <CModal visible={deleteModal} onClose={() => setDeleteModal(false)}>
        <CModalHeader>
          <CModalTitle>Confirm Delete</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Are you sure you want to delete <strong>{deleteUser?.email}</strong>? This action cannot be undone.
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </CButton>
          <CButton color="danger" onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? <CSpinner size="sm" /> : 'Yes, Delete'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default Settings;