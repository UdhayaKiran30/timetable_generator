'use client';
import React, { useEffect, useState } from 'react';
import { Clock, Plus, Search, Trash2, Calendar } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { TimeSlot, Day } from '../../types';

const DAYS: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function TimeSlotsPage() {
  const [items, setItems] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [day, setDay] = useState<Day>('MONDAY');
  const [periodNumber, setPeriodNumber] = useState(1);
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('10:00:00');
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api<TimeSlot[]>('/time-slots');
      setItems(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setDay('MONDAY');
    setPeriodNumber(1);
    setStartTime('09:00:00');
    setEndTime('10:00:00');
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        day,
        periodNumber: Number(periodNumber),
        startTime,
        endTime,
      };

      await api('/time-slots', { method: 'POST', body: JSON.stringify(payload) });
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to remove this time slot?')) return;
    try {
      await api(`/time-slots/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (s) => selectedDay === 'ALL' || s.day === selectedDay
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Time Slots
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure daily period timings, session lengths, and academic calendar hours.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Slot</span>
          </button>
        )}
      </div>

      <MasterDataNav />

      <div className="card-premium p-4 bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter by Day:</span>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="form-input text-xs py-1.5 px-3 font-medium w-40"
          >
            <option value="ALL">All Days</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} slots</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading time slots…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Time Slots Found"
            description="Create daily periods (e.g. 09:00 - 10:00) to populate the timetable schedule."
            actionText={isAdmin ? 'Add Slot' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Day of Week</th>
                  <th className="py-3 px-4">Period Index</th>
                  <th className="py-3 px-4">Start Time</th>
                  <th className="py-3 px-4">End Time</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{s.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {s.day}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-800 font-mono font-bold text-xs border border-green-200">
                        Period {s.periodNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {s.startTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {s.endTime}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete Slot"
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
        title="Add Daily Time Slot"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
                max={12}
                value={periodNumber}
                onChange={(e) => setPeriodNumber(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00:00"
                className="form-input text-xs font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">End Time</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="10:00:00"
                className="form-input text-xs font-mono"
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
              {saving ? 'Saving…' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
