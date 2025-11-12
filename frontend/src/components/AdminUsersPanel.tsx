import React, { useEffect, useState } from 'react';
import { Key, Copy, Check } from 'lucide-react';
import api from '../services/api';

interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  domain: 'CENTER' | 'HEALTHCARE' | 'EMS';
  isSubUser?: boolean;
  parentUserId?: string | null;
  parent?: { id: string; name: string; email: string } | null;
  orgAdmin?: boolean;
}

const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = 'gray' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${color}-100 text-${color}-800 mr-2`}>{label}</span>
);

const AdminUsersPanel: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeSub, setIncludeSub] = useState(true);
  const [onlySub, setOnlySub] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CENTER' | 'HEALTHCARE' | 'EMS'>('ALL');
  const [resetPasswordModal, setResetPasswordModal] = useState<{ user: AdminUserItem; tempPassword: string } | null>(null);
  const [resetLoading, setResetLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const params: any = {};
      if (onlySub) params.onlySubUsers = 'true'; else if (includeSub) params.includeSubUsers = 'true';
      const res = await api.get('/api/auth/users', { params });
      if (res.data?.success) setUsers(res.data.users || []); else setError(res.data?.error || 'Failed to load users');
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // Guard: wait for token + ADMIN role to avoid 403 on first paint
    try {
      const token = localStorage.getItem('token');
      const raw = localStorage.getItem('user');
      const u = raw ? JSON.parse(raw) : null;
      if (!token || u?.userType !== 'ADMIN') return;
    } catch {}
    load();
  }, [includeSub, onlySub]);

  const filtered = users.filter(u => (filter === 'ALL' ? true : u.domain === filter));

  const updateUser = async (u: AdminUserItem, changes: Partial<AdminUserItem>) => {
    try {
      const res = await api.patch(`/api/auth/admin/users/${u.domain}/${u.id}`, {
        userType: changes.userType,
        isActive: changes.isActive,
        orgAdmin: changes.orgAdmin
      });
      if (res.data?.success) {
        await load();
      } else {
        setError(res.data?.error || 'Update failed');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Update failed');
    }
  };

  const resetPassword = async (user: AdminUserItem) => {
    if (!confirm(`Reset password for ${user.name} (${user.email})? They will need to change it on next login.`)) {
      return;
    }

    setResetLoading(user.id);
    try {
      const res = await api.post(`/api/auth/admin/users/${user.domain}/${user.id}/reset-password`);
      if (res.data?.success) {
        setResetPasswordModal({
          user,
          tempPassword: res.data.data.tempPassword
        });
        setCopied(false);
      } else {
        setError(res.data?.error || 'Failed to reset password');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to reset password');
    } finally {
      setResetLoading(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Admin • Users</h2>
        <div className="flex items-center space-x-3">
          <label className="text-sm text-gray-700 flex items-center space-x-1">
            <input type="checkbox" checked={includeSub && !onlySub} onChange={(e) => { setOnlySub(false); setIncludeSub(e.target.checked); }} />
            <span>Include Sub-Users</span>
          </label>
          <label className="text-sm text-gray-700 flex items-center space-x-1">
            <input type="checkbox" checked={onlySub} onChange={(e) => { setOnlySub(e.target.checked); if (e.target.checked) setIncludeSub(false); }} />
            <span>Only Sub-Users</span>
          </label>
          <select value={filter} onChange={e => setFilter(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
            <option value="ALL">All Domains</option>
            <option value="CENTER">Center</option>
            <option value="HEALTHCARE">Healthcare</option>
            <option value="EMS">EMS</option>
          </select>
          <button onClick={load} className="px-3 py-1.5 text-sm rounded border">Refresh</button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">{error}</div>}
      {loading && <div className="p-3">Loading...</div>}

      {!loading && (
        <div className="bg-white rounded-md border divide-y">
          <div className="p-4 text-sm text-gray-700">{filtered.length} users</div>
          {filtered.map(u => (
            <div key={`${u.domain}:${u.id}`} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {u.name} <span className="text-gray-500">{u.email}</span>
                </div>
                <div className="text-xs text-gray-500">Created: {new Date(u.createdAt).toLocaleString()}</div>
                {u.parent && (
                  <div className="text-xs text-gray-500">Parent: {u.parent.name} ({u.parent.email})</div>
                )}
              </div>
              <div className="flex items-center">
                <Badge label={u.domain} color={u.domain === 'HEALTHCARE' ? 'green' : u.domain === 'EMS' ? 'orange' : 'blue'} />
                {u.domain === 'CENTER' ? (
                  <select
                    value={u.userType}
                    onChange={(e) => updateUser(u, { userType: e.target.value })}
                    className="border rounded px-2 py-1 text-xs mr-2"
                    title="Change role"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="USER">USER</option>
                  </select>
                ) : (
                  <Badge label={u.userType} color="gray" />
                )}
                {u.isSubUser && <Badge label="Sub-User" color="purple" />}
                {['HEALTHCARE','EMS'].includes(u.domain) && (
                  <label className="ml-2 text-xs text-gray-700 flex items-center space-x-1" title="Org Admin">
                    <input type="checkbox" checked={!!u.orgAdmin} onChange={(e) => updateUser(u, { orgAdmin: e.target.checked })} />
                    <span>Org Admin</span>
                  </label>
                )}
                <button
                  onClick={() => resetPassword(u)}
                  disabled={resetLoading === u.id}
                  className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 flex items-center space-x-1"
                  title="Reset password (generates temporary password)"
                >
                  <Key className="h-3 w-3" />
                  <span>{resetLoading === u.id ? 'Resetting...' : 'Reset Password'}</span>
                </button>
                <button
                  onClick={() => updateUser(u, { isActive: !u.isActive })}
                  className={`ml-2 px-2 py-1 text-xs rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  title="Toggle active"
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Password Reset for {resetPasswordModal.user.name}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              A temporary password has been generated. The user will be required to change it on their next login.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporary Password (copy this - it will only be shown once)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={resetPasswordModal.tempPassword}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(resetPasswordModal.tempPassword)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-1"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span className="text-sm">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This password is shown only once. Make sure to copy it before closing this dialog.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setResetPasswordModal(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPanel;


