'use client';
import React, { useEffect, useState } from 'react';
import { CalendarCheck, Plus, Search, Trash2, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { FacultyAvailability, Faculty, Day } from '../../types';

const DAYS: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function FacultyAvailabilityPage() {
  const [items, setItems] = useState<FacultyAvailability[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facId, setFacId] = useState('');
  const [day, setDay] = useState<Day>('MONDAY');
  const [periodNumber, setPeriodNumber] = useState(1);
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [avs, facs] = await Promise.all([
        api<FacultyAvailability[]>('/faculty-availability'),
        api<Faculty[]>('/faculty'),
      ]);
      setItems(avs || []);
      setFaculties(facs || []);
      if (facs.length > 0 && !facId) setFacId(String(facs[0].id));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    if (faculties.length > 0) setFacId(String(faculties[0].id));
    setDay('MONDAY');
    setPeriodNumber(1);
    setAvailable(true);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        faculty: { id: Number(facId) },
        day,
        periodNumber: Number(periodNumber),
        available,
      };

      await api('/faculty-availability', { method: 'POST', body: JSON.stringify(payload) });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to remove this availability record?')) return;
    try {
      await api(`/faculty-availability/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter((a) => {
    const facName = a.faculty?.name || '';
    const matchesSearch = facName.toLowerCase().includes(search.toLowerCase());
    const matchesDay = selectedDayFilter === 'ALL' || a.day === selectedDayFilter;
    return matchesSearch && matchesDay;
  });

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Faculty Availability
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Define faculty timeslot availability and off-period preferences for constraint solving.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Set Availability</span>
          </button>
        )}
      </div>

      <MasterDataNav />

      <div className="card-premium p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            className="form-input text-xs py-2 px-3 font-medium"
          >
            <option value="ALL">All Days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {filtered.length} records
          </span>
        </div>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading availability…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No Availability Restrictions"
            description="All faculty members are currently considered available for all slots unless specifically marked."
            actionText={isAdmin ? 'Set Availability' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Day of Week</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Status</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{a.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {a.faculty?.name}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {a.day}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      Period {a.periodNumber}
                    </td>
                    <td className="py-3 px-4">
                      {a.available ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 text-[11px] font-semibold border border-green-200">
                          <CheckCircle size={12} className="text-green-600" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-semibold border border-red-200">
                          <XCircle size={12} className="text-red-500" /> Unavailable / Busy
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Record"
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
        title="Set Faculty Availability"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Day of Week</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as Day)}
                className="form-input text-xs"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Period Number</label>
              <input
                type="number"
                min={1}
                max={8}
                value={periodNumber}
                onChange={(e) => setPeriodNumber(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Availability</label>
            <select
              value={available ? 'true' : 'false'}
              onChange={(e) => setAvailable(e.target.value === 'true')}
              className="form-input text-xs"
            >
              <option value="true">Available for Lectures</option>
              <option value="false">Unavailable / Leave / Meeting</option>
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
              {saving ? 'Saving…' : 'Save Preference'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
