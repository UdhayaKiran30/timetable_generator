'use client';
import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Search, Trash2, Edit2, FlaskConical } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Subject, SubjectType } from '../../types';

export default function SubjectsPage() {
  const [items, setItems] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [weeklyPeriods, setWeeklyPeriods] = useState(3);
  const [type, setType] = useState<SubjectType>('THEORY');
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api<Subject[]>('/subjects');
      setItems(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setName('');
    setCode('');
    setWeeklyPeriods(3);
    setType('THEORY');
    setIsModalOpen(true);
  }

  function openEdit(s: Subject) {
    setEditingId(s.id);
    setName(s.name);
    setCode(s.code);
    setWeeklyPeriods(s.weeklyPeriods);
    setType(s.type);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        code,
        weeklyPeriods: Number(weeklyPeriods),
        type,
      };

      if (editingId) {
        await api(`/subjects/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/subjects', { method: 'POST', body: JSON.stringify(payload) });
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
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api(`/subjects/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Subjects & Laboratories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage course syllabus, weekly period requirements, and classroom/lab requirements.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Subject</span>
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
            placeholder="Search subjects by code or title…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} subjects</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading subjects…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Subjects Configured"
            description="Add course subjects and lab sessions to configure curriculum requirements."
            actionText={isAdmin ? 'Add Subject' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Course Code</th>
                  <th className="py-3 px-4">Weekly Load</th>
                  <th className="py-3 px-4">Type</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{s.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{s.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-800 font-semibold text-xs">
                        {s.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {s.weeklyPeriods} {s.weeklyPeriods === 1 ? 'period' : 'periods'} / week
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.type} type="subject" />
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
        title={editingId ? 'Edit Subject' : 'Add Subject'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Subject Title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Database Management Systems"
              className="form-input text-xs"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Course Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS602"
              className="form-input text-xs font-mono uppercase"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Weekly Periods</label>
              <input
                type="number"
                min={1}
                max={10}
                value={weeklyPeriods}
                onChange={(e) => setWeeklyPeriods(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Subject Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SubjectType)}
                className="form-input text-xs"
              >
                <option value="THEORY">Theory</option>
                <option value="LAB">Laboratory</option>
              </select>
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
              {saving ? 'Saving…' : editingId ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
