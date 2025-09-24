import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function UserManagement({ className = "" }) {
  const { users, currentUser, addUser, updateUser, removeUser, loginAs, hasRole } = useAuth();
  const [form, setForm] = useState({ id: "", name: "", role: "viewer" });
  const [editId, setEditId] = useState(null);

  const canManage = hasRole("admin");
  const sortedUsers = useMemo(() => [...users].sort((a, b) => a.id.localeCompare(b.id)), [users]);

  const handleAdd = () => {
    if (!form.id || !form.name) return;
    addUser({ id: form.id, name: form.name, role: form.role });
    setForm({ id: "", name: "", role: "viewer" });
  };

  const handleSave = () => {
    if (!editId) return;
    updateUser(editId, form);
    setEditId(null);
    setForm({ id: "", name: "", role: "viewer" });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">User Management</h3>
        <div className="text-sm text-gray-600">Logged in as: <span className="font-semibold">{currentUser?.name} ({currentUser?.role})</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="px-2 py-2">User ID</th>
                <th className="px-2 py-2">Name</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-2 py-2 font-mono text-xs">{u.id}</td>
                  <td className="px-2 py-2">{u.name}</td>
                  <td className="px-2 py-2 capitalize">{u.role}</td>
                  <td className="px-2 py-2 space-x-2">
                    <button className="text-xs px-2 py-1 rounded border" onClick={() => loginAs(u.id)}>Login</button>
                    {canManage && (
                      <>
                        <button className="text-xs px-2 py-1 rounded border" onClick={() => { setEditId(u.id); setForm({ id: u.id, name: u.name, role: u.role }); }}>Edit</button>
                        <button className="text-xs px-2 py-1 rounded border text-red-600" onClick={() => removeUser(u.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="rounded-xl border p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">{editId ? 'Edit User' : 'Add User'}</div>
            <div className="flex flex-col gap-2">
              <input disabled={!!editId} className="border rounded px-2 py-1 text-sm" placeholder="user id" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <select className="border rounded px-2 py-1 text-sm" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
              </select>
              {editId ? (
                <button disabled={!canManage} className="px-3 py-1 text-sm rounded bg-green-600 text-white" onClick={handleSave}>Save</button>
              ) : (
                <button disabled={!canManage} className="px-3 py-1 text-sm rounded bg-green-600 text-white" onClick={handleAdd}>Add</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


