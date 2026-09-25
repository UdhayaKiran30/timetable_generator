'use client';
import React, { useEffect, useState } from 'react';
import { Briefcase, Plus, Search, Trash2, Edit2, Users2, BookOpen, GraduationCap } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { TeachingAssignment, Division, Subject, Faculty } from '../../types';

export default function TeachingAssignmentsPage() {
  const [items, setItems] = useState<TeachingAssignment[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [divId, setDivId] = useState('');
  const [subId, setSubId] = useState('');
  const [facId, setFacId] = useState('');
  const [requiredPeriods, setRequiredPeriods] = useState(3);
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ass, divs, subs, facs] = await Promise.all([
        api<TeachingAssignment[]>('/teaching-assignments'),
        api<Division[]>('/divisions'),
        api<Subject[]>('/subjects'),
        api<Faculty[]>('/faculty'),
      ]);
      setItems(ass || []);
      setDivisions(divs || []);
      setSubjects(subs || []);
      setFaculties(facs || []);
      if (divs.length > 0 && !divId) setDivId(String(divs[0].id));
      if (subs.length > 0 && !subId) setSubId(String(subs[0].id));
      if (facs.length > 0 && !facId) setFacId(String(facs[0].id));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    if (divisions.length > 0) setDivId(String(divisions[0].id));
    if (subjects.length > 0) {
      setSubId(String(subjects[0].id));
      setRequiredPeriods(subjects[0].weeklyPeriods);
    }
    if (faculties.length > 0) setFacId(String(faculties[0].id));
    setIsModalOpen(true);
  }

  // Auto-set default periods based on selected subject
  function handleSubjectChange(id: string) {
    setSubId(id);
    const sub = subjects.find((s) => String(s.id) === id);
    if (sub) {
      setRequiredPeriods(sub.weeklyPeriods);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        division: { id: Number(divId) },
        subject: { id: Number(subId) },
        faculty: { id: Number(facId) },
        requiredPeriods: Number(requiredPeriods),
      };

      await api('/teaching-assignments', { method: 'POST', body: JSON.stringify(payload) });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api(`/teaching-assignments/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter((a) => {
    const divName = a.division?.name || '';
    const subName = a.subject?.name || '';
    const facName = a.faculty?.name || '';
    const query = search.toLowerCase();
    return divName.toLowerCase().includes(query) || subName.toLowerCase().includes(query) || facName.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Teaching Assignments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Map faculty members and curriculum subjects to student division cohorts.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>New Assignment</span>
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
            placeholder="Search by division, subject, or professor…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} assignments</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading teaching assignments…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Teaching Assignments"
            description="Assign professors to teach division subjects before running timetable generation."
            actionText={isAdmin ? 'New Assignment' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Division</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assigned Faculty</th>
                  <th className="py-3 px-4">Required Periods</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{a.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
                        {a.division?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.subject?.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{a.subject?.code} · {a.subject?.type}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {a.faculty?.name}
                    </td>
                    <td className="py-3 px-4 font-bold text-green-800">
                      {a.requiredPeriods} periods / week
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Assignment"
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
        title="Create Teaching Assignment"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Division</label>
            <select
              value={divId}
              onChange={(e) => setDivId(e.target.value)}
              className="form-input text-xs"
              required
            >
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (Semester {d.semester} - {d.studentCount} students)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Subject</label>
            <select
              value={subId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="form-input text-xs"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} - {s.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Faculty Member</label>
            <select
              value={facId}
              onChange={(e) => setFacId(e.target.value)}
              className="form-input text-xs"
              required
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Required Periods</label>
            <input
              type="number"
              min={1}
              max={10}
              value={requiredPeriods}
              onChange={(e) => setRequiredPeriods(Number(e.target.value))}
              className="form-input text-xs"
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
            <button type="submit" disabled={saving} className="btn-primary text-xs">
              {saving ? 'Saving…' : 'Save Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
