'use client';
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  History,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Calendar,
  Building2,
  Clock,
  ShieldCheck,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { api, getUserRole } from '../../../lib/api';
import StatusBadge from '../../../components/StatusBadge';
import EmptyState from '../../../components/EmptyState';
import { Timetable, Department } from '../../../types';

export default function VersionsPage() {
  const router = useRouter();
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const role = getUserRole();
  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    async function loadData() {
      try {
        const [ttList, deptList] = await Promise.all([
          api<Timetable[]>('/timetables').catch(() => []),
          api<Department[]>('/departments').catch(() => []),
        ]);
        setTimetables(ttList || []);
        setDepartments(deptList || []);
      } catch (err) {
        console.error('Failed to load timetables', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredTimetables = useMemo(() => {
    return timetables.filter((tt) => {
      const deptName = tt.department?.name || '';
      const deptCode = tt.department?.code || '';
      const matchesSearch =
        deptName.toLowerCase().includes(search.toLowerCase()) ||
        deptCode.toLowerCase().includes(search.toLowerCase()) ||
        tt.academicYear.toLowerCase().includes(search.toLowerCase());

      const matchesDept = selectedDept === 'ALL' || String(tt.department?.id) === selectedDept;
      const matchesStatus = selectedStatus === 'ALL' || tt.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [timetables, search, selectedDept, selectedStatus]);

  return (
    <div className="space-y-6 animate-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold mb-2">
            <History size={13} className="text-green-600" />
            Audit & Version Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Timetable Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Browse published institutional schedules, review draft iterations, and audit historical archives.
          </p>
        </div>

        {isAdmin && <Link
          href="/timetable/generate"
          className="btn-primary text-xs self-start sm:self-center py-2.5 px-4 shadow-sm"
        >
          <Sparkles size={15} />
          <span>New Timetable</span>
        </Link>}
      </div>

      {/* Filter Bar */}
      <div className="card-premium p-4 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by department or year…"
            className="form-input text-xs pl-9 pr-3 py-2 w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="form-input text-xs py-2 px-3 font-medium"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.code} - {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input text-xs py-2 px-3 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Timetable Table Card */}
      <div className="card-premium overflow-hidden bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading version directory…
          </div>
        ) : filteredTimetables.length === 0 ? (
          <EmptyState
            icon={History}
            title="No Timetables Found"
            description="No timetable versions match your active filters. Try adjusting search criteria or create a new schedule."
            actionText={isAdmin ? 'Generate Timetable' : undefined}
            onAction={isAdmin ? () => router.push('/timetable/generate') : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Department / Scope</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Academic Year</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Scheduled Slots</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTimetables.map((tt) => (
                  <tr key={tt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">
                        {tt.department?.name || 'Department'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Code: {tt.department?.code}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      Semester {tt.semester}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {tt.academicYear}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono font-bold text-[11px]">
                        v{tt.version}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {tt.entries?.length || 0} periods
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={tt.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/timetable/${tt.id}`}
                        className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
                      >
                        <Eye size={13} className="text-slate-400" />
                        <span>View Grid</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
