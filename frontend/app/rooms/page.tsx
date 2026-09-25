'use client';
import React, { useEffect, useState } from 'react';
import { DoorOpen, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { api, getUserRole } from '../../lib/api';
import MasterDataNav from '../../components/MasterDataNav';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { Room, RoomType } from '../../types';

export default function RoomsPage() {
  const [items, setItems] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(60);
  const [type, setType] = useState<RoomType>('CLASSROOM');
  const [saving, setSaving] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await api<Room[]>('/rooms');
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
    setCapacity(60);
    setType('CLASSROOM');
    setIsModalOpen(true);
  }

  function openEdit(r: Room) {
    setEditingId(r.id);
    setName(r.name);
    setCapacity(r.capacity);
    setType(r.type);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        capacity: Number(capacity),
        type,
      };

      if (editingId) {
        await api(`/rooms/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await api('/rooms', { method: 'POST', body: JSON.stringify(payload) });
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
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await api(`/rooms/${id}`, { method: 'DELETE' });
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  const filtered = items.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Classrooms & Laboratories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure campus rooms, seating capacities, and dedicated lab infrastructure.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreate} className="btn-primary text-xs py-2 px-3.5 shadow-sm">
            <Plus size={15} />
            <span>Add Room</span>
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
            placeholder="Search rooms by name or type…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">{filtered.length} rooms</span>
      </div>

      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading rooms…</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="No Rooms Configured"
            description="Add lecture halls and computer labs to schedule division classes."
            actionText={isAdmin ? 'Add Room' : undefined}
            onAction={isAdmin ? openCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Room Identifier</th>
                  <th className="py-3 px-4">Seating Capacity</th>
                  <th className="py-3 px-4">Room Type</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400">#{r.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{r.name}</td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {r.capacity} seats
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.type} type="room" />
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
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
        title={editingId ? 'Edit Room' : 'Add Room'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Room Name / Number</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Room 101 or DB Lab"
              className="form-input text-xs"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Seating Capacity</label>
              <input
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="form-input text-xs"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Room Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as RoomType)}
                className="form-input text-xs"
              >
                <option value="CLASSROOM">Classroom</option>
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
              {saving ? 'Saving…' : editingId ? 'Update Room' : 'Create Room'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
