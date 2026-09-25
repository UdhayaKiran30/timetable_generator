'use client';
import React, { useEffect, useState } from 'react';
import { Users2, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { Division, Department } from '../../types';

export default function DivisionsPage() {
  const [items, setItems] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState(6);
  const [studentCount, setStudentCount] = useState(50);
  const [deptId, setDeptId] = useState('');
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [divs, depts] = await Promise.all([
        api<Division[]>('/divisions'),
        api<Department[]>('/departments'),
      ]);
      setItems(divs || []);
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
    setSemester(6);
    setStudentCount(50);
    if (departments.length > 0) setDeptId(String(departments[0].id));
    setIsModalOpen(true);
  }

  function openEdit(d: Division) {
    setEditingId(d.id);
    setName(d.name);
    setSemester(d.semester);
    setStudentCount(d.studentCount);
    if (d.department) setDeptId(String(d.department.id));
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedDept = departments.find((d) => String(d.id) === deptId);
      const payload = {
        name,
        semester: Number(semester),
        studentCount: Number(studentCount),
        department: selectedDept ? { id: selectedDept.id } : null,
      };

      if (editingId) {
        await api(`/divisions/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/divisions', { method: 'POST', body: JSON.stringify(payload) });
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
    if (!confirm('Are you sure you want to delete this division?')) return;
    try {
      await api(`/divisions/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.department?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Divisions & Sections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student cohorts, section counts, and academic semester associations.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Division</span>
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
            placeholder="Search divisions by name or department…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} divisions</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading divisions…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users2}
            title="No Divisions Found"
            description="Add division cohorts (e.g. CSE-A, ECE-B) to begin scheduling."
            actionText={isAdmin ? 'Add Division' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Division Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Student Enrollment</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{d.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{d.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {d.department?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs">
                        Sem {d.semester}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {d.studentCount} students
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
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
        title={editingId ? 'Edit Division' : 'Create Division'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Division Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CSE-A"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Semester</label>
              <input
                type="number"
                min={1}
                max={8}
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Count</label>
              <input
                type="number"
                min={1}
                value={studentCount}
                onChange={(e) => setStudentCount(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
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
              {saving ? 'Saving…' : editingId ? 'Update Division' : 'Create Division'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
