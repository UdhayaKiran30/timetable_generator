'use client';
import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Department } from '../../types';

export default function DepartmentsPage() {
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const data = await api<Department[]>('/departments');
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setName('');
    setCode('');
    setIsModalOpen(true);
  }

  function openEdit(d: Department) {
    setEditingId(d.id);
    setName(d.name);
    setCode(d.code);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api(`/departments/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ name, code }),
        });
      } else {
        await api('/departments', {
          method: 'POST',
          body: JSON.stringify({ name, code }),
        });
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api(`/departments/${id}`, { method: 'DELETE' });
      loadDepartments();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-enter">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Academic Master Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure campus organizational units, departments, and course faculties.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <MasterDataNav />

      {/* Search Bar */}
      <div className="card-premium p-4 bg-white flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments by name or code…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filtered.length} {filtered.length === 1 ? 'department' : 'departments'}
        </span>
      </div>

      {/* Table Card */}
      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading departments…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No Departments Found"
            description="Create your first academic department (e.g. Computer Science & Engineering)."
            actionText={isAdmin ? 'Add Department' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{d.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {d.name}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-800 font-mono font-bold text-xs border border-green-200">
                        {d.code}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Department Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Computer Science & Engineering"
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CSE"
              className="form-input text-xs font-mono uppercase"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs"
            >
              {saving ? 'Saving…' : editingId ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
