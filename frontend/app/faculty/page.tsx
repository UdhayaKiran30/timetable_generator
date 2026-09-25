'use client';
import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Search, Trash2, Edit2, Mail, Building2 } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Faculty, Department } from '../../types';

export default function FacultyPage() {
  const [items, setItems] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [deptId, setDeptId] = useState('');
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [fac, depts] = await Promise.all([
        api<Faculty[]>('/faculty'),
        api<Department[]>('/departments'),
      ]);
      setItems(fac || []);
      setDepartments(depts || []);
      if (depts && depts.length > 0 && !deptId) {
        setDeptId(String(depts[0].id));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setName('');
    setEmail('');
    if (departments.length > 0) setDeptId(String(departments[0].id));
    setIsModalOpen(true);
  }

  function openEdit(f: Faculty) {
    setEditingId(f.id);
    setName(f.name);
    setEmail(f.email);
    if (f.department) setDeptId(String(f.department.id));
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedDept = departments.find((d) => String(d.id) === deptId);
      const payload = {
        name,
        email,
        department: selectedDept ? { id: selectedDept.id } : null,
      };

      if (editingId) {
        await api(`/faculty/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/faculty', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api(`/faculty/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      (f.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic instructors, departmental appointments, and contact credentials.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      <MasterDataNav />

      <div className="card-premium p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name, email or department…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} faculty</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading faculty…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No Faculty Members"
            description="Add professors and lecturers to assign course loads and availability."
            actionText={isAdmin ? 'Add Faculty' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Faculty Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Department</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{f.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-xs">
                          {f.name.replace('Prof. ', '').charAt(0)}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{f.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {f.email}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {f.department?.name || '—'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(f)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Faculty' : 'Add Faculty Member'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Kumar"
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. kumar@edumerge.local"
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Department</label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
              className="form-input text-xs"
              required
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving…' : editingId ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
