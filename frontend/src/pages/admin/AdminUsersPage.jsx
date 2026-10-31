import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Lock, 
  Unlock, 
  Mail, 
  GraduationCap 
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal } from '../../components/common/Modal.jsx';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Suspend modal
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers({
        search: search.trim() || undefined,
        role: roleFilter || undefined
      });
      setUsers(res.users || []);
    } catch {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const openSuspendModal = (u) => {
    setSelectedUser(u);
    setSuspensionReason(u.suspensionReason || '');
    setSuspendModalOpen(true);
  };

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    const newSuspendedState = !selectedUser.isSuspended;
    try {
      await api.suspendUser(selectedUser.id, newSuspendedState, suspensionReason);
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, isSuspended: newSuspendedState, suspensionReason } : u));
      toast.success(`User ${newSuspendedState ? 'suspended' : 're-activated'}`);
      setSuspendModalOpen(false);
    } catch {
      toast.error('Action failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>User Directory &amp; Roles</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
          Monitor student scholars, grant permissions, and review account standing
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Search User</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Name, email, student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Role</label>
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Filter Users
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '36px', height: '36px' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <Users size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
          <h3>No users match the search</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Scholar</th>
                <th>Academic Affiliation</th>
                <th>Role</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar-sm">
                        {u.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {u.fullName}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                          {u.email} {u.studentNumber ? `• ID: ${u.studentNumber}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {u.programName || 'Computer Science'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {u.universityName || 'UDOM'}
                    </div>
                  </td>
                  <td>
                    <span className={u.role === 'admin' ? 'badge badge-primary' : 'badge badge-secondary'}>
                      {u.role === 'admin' ? <ShieldCheck size={12} /> : <GraduationCap size={12} />}
                      <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                    </span>
                  </td>
                  <td>
                    {u.isSuspended ? (
                      <span className="badge badge-danger">
                        <Lock size={12} /> Suspended
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <UserCheck size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => openSuspendModal(u)}
                      className={u.isSuspended ? 'btn btn-secondary btn-sm' : 'btn btn-ghost btn-sm'}
                      style={{ color: u.isSuspended ? 'inherit' : 'var(--accent-rose)' }}
                    >
                      {u.isSuspended ? (
                        <><Unlock size={14} /> Reactivate</>
                      ) : (
                        <><Lock size={14} /> Suspend</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspend Modal */}
      <Modal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        title={selectedUser?.isSuspended ? 'Reactivate User Account' : 'Suspend User Account'}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          {selectedUser?.isSuspended ? (
            <>Are you sure you want to lift the suspension for <strong>{selectedUser?.fullName}</strong>?</>
          ) : (
            <>Suspension will prevent <strong>{selectedUser?.fullName}</strong> from uploading or downloading academic resources.</>
          )}
        </p>

        {!selectedUser?.isSuspended && (
          <div className="form-group">
            <label className="form-label">Suspension Reason</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Uploading copyrighted books or violating academic conduct rules..."
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={() => setSuspendModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleToggleSuspend}
            disabled={processing}
            className={selectedUser?.isSuspended ? 'btn btn-primary' : 'btn btn-danger'}
          >
            {processing ? 'Processing...' : selectedUser?.isSuspended ? 'Reactivate Account' : 'Confirm Suspension'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
