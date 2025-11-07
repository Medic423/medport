import React, { useEffect, useState } from 'react';
import api from '../services/api';

const HealthcareSubUsersPanel: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [temp, setTemp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOrgAdmin, setIsOrgAdmin] = useState<boolean>(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/api/healthcare/sub-users');
      if (res.data?.success) setItems(res.data.data || []);
    } catch (e: any) { setError(e?.response?.data?.error || 'Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        setIsOrgAdmin(!!u?.orgAdmin);
      }
    } catch {}
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setTemp(null);
    try {
      console.log('HC_SUBUSERS:create click', { email, name });
      const res = await api.post('/api/healthcare/sub-users', { email, name });
      if (res.data?.success) {
        console.log('HC_SUBUSERS:create success', res.data);
        setTemp(res.data.data?.tempPassword || null);
        setEmail(''); setName('');
        await load();
      } else setError(res.data?.error || 'Create failed');
    } catch (e: any) { setError(e?.response?.data?.error || 'Create failed'); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      console.log('HC_SUBUSERS:toggleActive click', { id, isActive });
      await api.patch(`/api/healthcare/sub-users/${id}`, { isActive: !isActive });
      await load();
    } catch (e) { console.warn('HC_SUBUSERS:toggleActive error', e); }
  };

  const resetTemp = async (id: string) => {
    setTemp(null);
    try {
      console.log('HC_SUBUSERS:resetTemp click', { id });
      const r = await api.post(`/api/healthcare/sub-users/${id}/reset-temp-password`);
      if (r.data?.success) {
        console.log('HC_SUBUSERS:resetTemp success', r.data);
        setTemp(r.data.data?.tempPassword || null);
      }
    } catch (e) { console.warn('HC_SUBUSERS:resetTemp error', e); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Healthcare Users</h2>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">Team Members</div>
        {isOrgAdmin && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Org Admin</span>}
      </div>
      {!isOrgAdmin && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
          Read-only access. Contact an Org Admin to add, deactivate, or reset team members.
        </div>
      )}
      <form onSubmit={create} className="bg-white p-4 rounded-md border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required disabled={!isOrgAdmin} />
          <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required disabled={!isOrgAdmin} />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2" disabled={!isOrgAdmin} title={!isOrgAdmin ? 'Org Admin required' : ''}>Add Sub-User</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {temp && <div className="text-green-700 text-sm">Temporary password: <span className="font-mono">{temp}</span> (copy now)</div>}
      </form>
      <div className="bg-white rounded-md border">
        <div className="p-4 border-b font-medium">Sub-Users ({items.length})</div>
        <div className="divide-y">
          {loading ? <div className="p-4">Loading...</div> : items.map(u => (
            <div key={u.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{u.name} <span className="text-gray-500">{u.email}</span></div>
                <div className="text-xs text-gray-500">{u.isActive ? 'Active' : 'Inactive'}</div>
              </div>
              <div className="space-x-2">
                <button onClick={() => toggleActive(u.id, u.isActive)} className="px-3 py-1 rounded border" disabled={!isOrgAdmin} title={!isOrgAdmin ? 'Org Admin required' : ''}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => resetTemp(u.id)} className="px-3 py-1 rounded bg-indigo-600 text-white" disabled={!isOrgAdmin} title={!isOrgAdmin ? 'Org Admin required' : ''}>Reset Temp Password</button>
              </div>
            </div>
          ))}
          {(!loading && items.length === 0) && <div className="p-4 text-sm text-gray-500">No sub-users yet.</div>}
        </div>
      </div>

      {temp && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center" onClick={() => setTemp(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Temporary Password</h3>
            <p className="mb-4 text-sm text-gray-700">Provide this one-time password to the sub-user. They will be forced to change it on first login.</p>
            <div className="p-3 bg-gray-100 rounded font-mono text-center select-all">{temp}</div>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="px-4 py-2 rounded border" onClick={() => setTemp(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthcareSubUsersPanel;


