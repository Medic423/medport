import React, { useEffect, useState } from 'react';
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
    </div>
  );
};

export default AdminUsersPanel;


