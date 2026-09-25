'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  CheckCircle,
  Send,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Calendar,
  Users,
  GraduationCap,
  DoorOpen,
  Trash2,
  FlaskConical,
  BookOpen,
  Filter
} from 'lucide-react';
import { api, fetchCurrentUser, getUserRole } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import Modal from '../../../components/Modal';
import { Timetable, Day, ConflictResult, TimetableEntry, UserProfile } from '../../../types';

const DAYS: Day[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

export default function TimetableViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [timetable, setTimetable] = useState<Timetable | null>(null);
  const [viewer, setViewer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering & View state
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'division' | 'faculty'>('division');

  // Modal / Action states
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ success: boolean; conflicts: ConflictResult[] } | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    fetchCurrentUser().then(setViewer);
    if (!id) return;
    setLoading(true);
    api<Timetable>(`/timetables/${id}`)
      .then((data) => {
        setTimetable(data);
      })
      .catch((err) => setError(err.message || 'Failed to load timetable'))
      .finally(() => setLoading(false));
  }, [id]);

  // Extract unique divisions and faculty
  const divisions = useMemo(() => {
    if (!timetable?.entries) return [];
    const map = new Map<number, string>();
    timetable.entries.forEach((e) => {
      if (e.division) map.set(e.division.id, e.division.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [timetable]);

  const faculties = useMemo(() => {
    if (!timetable?.entries) return [];
    const map = new Map<number, string>();
    timetable.entries.forEach((e) => {
      if (e.faculty) map.set(e.faculty.id, e.faculty.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [timetable]);

  // Extract distinct periods
  const periods = useMemo(() => {
    if (!timetable?.entries) return [];
    const map = new Map<number, { periodNumber: number; startTime: string; endTime: string }>();
    timetable.entries.forEach((e) => {
      if (e.timeSlot) {
        map.set(e.timeSlot.periodNumber, {
          periodNumber: e.timeSlot.periodNumber,
          startTime: e.timeSlot.startTime,
          endTime: e.timeSlot.endTime,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.periodNumber - b.periodNumber);
  }, [timetable]);

  // Filter entries based on selection
  const filteredEntries = useMemo(() => {
    if (!timetable?.entries) return [];
    return timetable.entries.filter((entry) => {
      if (viewer?.role === 'FACULTY') {
        return entry.faculty?.id === viewer.facultyId;
      }
      if (viewer?.role === 'STUDENT') {
        return entry.division?.id === viewer.divisionId;
      }
      if (viewMode === 'division' && selectedDivision !== 'ALL') {
        return String(entry.division?.id) === selectedDivision;
      }
      if (viewMode === 'faculty' && selectedFaculty !== 'ALL') {
        return String(entry.faculty?.id) === selectedFaculty;
      }
      return true;
    });
  }, [timetable, viewMode, selectedDivision, selectedFaculty]);

  // Find entry in grid cell
  function getCellEntries(day: Day, periodNumber: number): TimetableEntry[] {
    return filteredEntries.filter(
      (e) => e.timeSlot?.day === day && e.timeSlot?.periodNumber === periodNumber
    );
  }

  async function handleValidate() {
    if (!timetable) return;
    setValidating(true);
    try {
      const res = await api<{ success: boolean; conflicts: ConflictResult[] }>(
        `/timetables/${timetable.id}/validate`,
        { method: 'POST' }
      );
      setValidationResult(res);
      setShowValidationModal(true);
    } catch (err: any) {
      alert('Validation check failed: ' + err.message);
    } finally {
      setValidating(false);
    }
  }

  async function handlePublish() {
    if (!timetable) return;
    setPublishing(true);
    try {
      const updated = await api<Timetable>(`/timetables/${timetable.id}/publish`, {
        method: 'POST',
      });
      setTimetable(updated);
      setShowPublishModal(false);
    } catch (err: any) {
      alert('Failed to publish: ' + err.message);
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!timetable) return;
    setDeleting(true);
    try {
      await api(`/timetables/${timetable.id}`, { method: 'DELETE' });
      router.push('/timetable/versions');
    } catch (err: any) {
      alert('Failed to delete timetable: ' + err.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading timetable grid…</p>
      </div>
    );
  }

  if (error || !timetable) {
    return (
      <div className="card-premium p-8 text-center max-w-md mx-auto">
        <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Schedule Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">{error || 'This timetable does not exist.'}</p>
        <Link href="/timetable/versions" className="btn-primary text-xs">
          View All Versions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-enter">

      {/* Top Header Card */}
      <div className="card-premium p-6 sm:p-8 bg-white no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/timetable/versions"
                className="text-xs font-semibold text-slate-400 hover:text-green-700 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Versions
              </Link>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-mono text-slate-400">ID #{timetable.id}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {timetable.department?.name || 'Department Schedule'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold">
                {timetable.department?.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 text-xs font-mono font-bold border border-green-200">
                v{timetable.version}
              </span>
              <StatusBadge status={timetable.status} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                Semester {timetable.semester} ({timetable.academicYear})
              </span>
              <span>•</span>
              <span>{timetable.entries?.length || 0} scheduled periods</span>
              {timetable.publishedAt && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">
                    Published {new Date(timetable.publishedAt).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-xs py-2 px-3"
              title="Print timetable"
            >
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleValidate}
              disabled={validating}
              className="btn-secondary text-xs py-2 px-3"
            >
              <ShieldCheck size={15} className="text-green-700" />
              <span>{validating ? 'Auditing…' : 'Validate'}</span>
            </button>

            {isAdmin && timetable.status === 'DRAFT' && (
              <>
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="btn-primary text-xs py-2 px-4 shadow-sm"
                >
                  <Send size={14} />
                  <span>Publish Schedule</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Draft"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>

        </div>

        {/* View Switcher & Filters */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Mode Switch: By Division vs By Faculty */}
          {role === 'ADMIN' && <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('division')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'division'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Users size={14} />
              <span>Division View</span>
            </button>
            <button
              onClick={() => setViewMode('faculty')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${viewMode === 'faculty'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <GraduationCap size={14} />
              <span>Faculty View</span>
            </button>
          </div>}

          {/* Dynamic Filter Dropdowns */}
          {role === 'ADMIN' && <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Filter size={14} />
              <span>Filter:</span>
            </div>

            {viewMode === 'division' ? (
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="form-input text-xs py-1.5 px-3 w-48 font-medium"
              >
                <option value="ALL">All Divisions ({divisions.length})</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    Division {d.name}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedFaculty}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="form-input text-xs py-1.5 px-3 w-56 font-medium"
              >
                <option value="ALL">All Faculty ({faculties.length})</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </div>}

        </div>
      </div>

      {/* Printable Heading (Only visible in Print) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {timetable.department?.name} ({timetable.department?.code})
        </h1>
        <p className="text-sm text-slate-600">
          Semester {timetable.semester} · Academic Year {timetable.academicYear} · Version {timetable.version} ({timetable.status})
        </p>
      </div>

      {/* Timetable Grid Card */}
      <div className="card-premium overflow-hidden bg-white timetable-print-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-200">
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-500 w-32 border-r border-gray-100">
                  Period / Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-700 min-w-[200px]"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((p) => (
                <tr key={p.periodNumber} className="hover:bg-slate-50/30 transition-colors">

                  {/* Period Time Column */}
                  <td className="py-3 px-4 bg-slate-50/40 border-r border-gray-100 align-top">
                    <div className="text-xs font-bold text-slate-800">
                      Period {p.periodNumber}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      {p.startTime} – {p.endTime}
                    </div>
                  </td>

                  {/* Day Columns */}
                  {DAYS.map((day) => {
                    const cellEntries = getCellEntries(day, p.periodNumber);
                    return (
                      <td key={day} className="p-2.5 align-top min-h-[90px]">
                        {cellEntries.length === 0 ? (
                          <div className="h-full min-h-[70px] rounded-lg border border-dashed border-gray-100 flex items-center justify-center text-slate-300 text-xs hover:border-gray-200 transition-colors">
                            —
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {cellEntries.map((e) => {
                              const isLab = e.subject?.type === 'LAB';
                              return (
                                <div
                                  key={e.id}
                                  className={`p-3 rounded-xl border transition-all text-xs ${isLab
                                      ? 'bg-teal-50/60 border-teal-200 text-teal-950 shadow-2xs'
                                      : 'bg-green-50/50 border-green-200/90 text-green-950 shadow-2xs'
                                    }`}
                                >
                                  {/* Subject Code & Type */}
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-mono font-bold text-[11px] text-slate-700">
                                      {e.subject?.code}
                                    </span>
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${isLab ? 'bg-teal-100 text-teal-800' : 'bg-green-100 text-green-800'
                                        }`}
                                    >
                                      {isLab ? <FlaskConical size={10} /> : <BookOpen size={10} />}
                                      {e.subject?.type}
                                    </span>
                                  </div>

                                  {/* Subject Title */}
                                  <div className="font-bold text-slate-900 text-xs mb-1.5 leading-snug">
                                    {e.subject?.name}
                                  </div>

                                  {/* Details: Faculty & Room */}
                                  <div className="space-y-1 text-[11px] text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                      <GraduationCap size={13} className="text-slate-400 shrink-0" />
                                      <span className="truncate">{e.faculty?.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <DoorOpen size={13} className="text-slate-400 shrink-0" />
                                        <span>{e.room?.name}</span>
                                      </div>
                                      {e.division && (
                                        <span className="font-semibold text-slate-700 bg-white/80 px-1.5 py-0.5 rounded text-[10px] border border-gray-200">
                                          {e.division.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Results Modal */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Hard Constraints Audit"
        subtitle="Independent deterministic verification pass"
      >
        {validationResult && (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${validationResult.success
                  ? 'bg-green-50 border-green-200 text-green-900'
                  : 'bg-red-50 border-red-200 text-red-900'
                }`}
            >
              {validationResult.success ? (
                <CheckCircle size={22} className="text-green-700 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={22} className="text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {validationResult.success
                    ? 'All Hard Constraints Passed!'
                    : `${validationResult.conflicts.length} Constraint Violations Detected`}
                </h4>
                <p className="text-xs mt-1 text-slate-600">
                  {validationResult.success
                    ? 'No faculty overlap, room double-booking, or student capacity overages detected.'
                    : 'The schedule has conflicts that should be resolved before publishing.'}
                </p>
              </div>
            </div>

            {validationResult.conflicts?.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {validationResult.conflicts.map((c, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="font-bold text-red-700">{c.type}</div>
                    <div className="text-slate-600 mt-0.5">{c.message}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowValidationModal(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish Timetable Schedule"
        subtitle={`Department of ${timetable.department?.name}`}
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Publishing this version (v{timetable.version}) will make it active for all faculty and students in Semester {timetable.semester}.
          </p>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <strong>Note:</strong> Any previously published version for this academic year will be automatically marked as <strong>ARCHIVED</strong>.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowPublishModal(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary text-xs"
            >
              {publishing ? 'Publishing…' : 'Confirm & Publish'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Draft Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Draft Timetable"
      >
        <div className="space-y-4 text-xs text-slate-600">
          <p>
            Are you sure you want to delete this draft timetable (Version {timetable.version})? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
            >
              {deleting ? 'Deleting…' : 'Delete Timetable'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
