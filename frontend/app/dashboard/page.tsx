'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users2,
  GraduationCap,
  BookOpen,
  DoorOpen,
  Sparkles,
  History,
  CalendarCheck,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  AlertCircle
} from 'lucide-react';
import { api, fetchCurrentUser } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { Timetable, UserProfile } from '../../types';

export default function Dashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [recentTimetables, setRecentTimetables] = useState<Timetable[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashData, ttList, currentUser] = await Promise.all([
          api<Record<string, number>>('/dashboard'),
          api<Timetable[]>('/timetables').catch(() => []),
          fetchCurrentUser(),
        ]);
        setStats(dashData || {});
        setRecentTimetables(ttList.slice(0, 5));
        setUser(currentUser);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const statItems = [
    { key: 'departments', label: 'Departments', icon: Building2, count: stats.departments ?? 0, href: '/departments' },
    { key: 'divisions', label: 'Divisions', icon: Users2, count: stats.divisions ?? 0, href: '/divisions' },
    { key: 'faculty', label: 'Faculty', icon: GraduationCap, count: stats.faculty ?? 0, href: '/faculty' },
    { key: 'subjects', label: 'Subjects & Labs', icon: BookOpen, count: stats.subjects ?? 0, href: '/subjects' },
    { key: 'rooms', label: 'Rooms & Labs', icon: DoorOpen, count: stats.rooms ?? 0, href: '/rooms' },
  ];

  return (
    <div className="space-y-8 animate-enter">

      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-green-900 via-green-800 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-green-950/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-green-200 text-xs font-medium backdrop-blur-md mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Academic Semester 2026–2027 Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}
          </h1>
          <p className="text-green-100/80 text-sm sm:text-base mt-2 leading-relaxed">
            Automate conflict-free timetables across departments with our constraint-satisfaction engine and real-time room verification.
          </p>
        </div>

        <div className="z-10 flex flex-wrap gap-3">
          {isAdmin && <Link
            href="/timetable/generate"
            className="inline-flex items-center gap-2 bg-white text-green-900 hover:bg-green-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 text-sm"
          >
            <Sparkles size={18} className="text-green-600" />
            Generate Timetable
          </Link>}
          <Link
            href="/timetable/versions"
            className="inline-flex items-center gap-2 bg-green-800/80 hover:bg-green-700/80 text-white font-medium px-4 py-3 rounded-xl border border-green-600/40 text-sm transition-all"
          >
            <History size={16} />
            View Schedules
          </Link>
        </div>
      </div>

      {/* Resource Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Campus Infrastructure Overview
          </h2>
          <span className="text-xs text-slate-500 font-medium">Synced with Database</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {(isAdmin ? statItems : statItems.filter((item) => item.key === 'divisions')).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className="card-premium p-5 group flex flex-col justify-between hover:border-green-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <Icon size={16} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {loading ? '—' : item.count}
                  </div>
                  <div className="text-[11px] text-green-700 font-medium flex items-center gap-1 mt-1">
                    Manage resource <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Section: Recent Timetables & Engine Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2 spans): Recent Timetables */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Generated Timetables</h2>
              <p className="text-xs text-slate-500 mt-0.5">Draft, published, and archived versions</p>
            </div>
            <Link
              href="/timetable/versions"
              className="text-xs font-semibold text-green-700 hover:text-green-800 flex items-center gap-1"
            >
              All schedules <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading schedules…</div>
          ) : recentTimetables.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No Timetables Generated Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select your department, semester, and academic year to run our AI constraint solver.
              </p>
              {isAdmin && <Link href="/timetable/generate" className="btn-primary text-xs mt-4 inline-flex">
                Create First Timetable
              </Link>}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentTimetables.map((tt) => (
                <div
                  key={tt.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-xl px-2.5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex flex-col items-center justify-center text-green-800 shrink-0">
                      <span className="text-[10px] font-bold uppercase">SEM</span>
                      <span className="text-xs font-extrabold leading-none">{tt.semester}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {tt.department?.name || 'Department'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">v{tt.version}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Year {tt.academicYear} · {tt.entries?.length || 0} scheduled periods
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge status={tt.status} />
                    <Link
                      href={`/timetable/${tt.id}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      View Grid
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 span): Engine Validation & Quick Links */}
        <div className="space-y-6">
          <div className="card-premium p-6 bg-linear-to-b from-white to-green-50/30">
            <div className="flex items-center gap-2.5 text-green-800 font-bold text-sm mb-3">
              <ShieldCheck size={20} className="text-green-700" />
              Constraint Solver Guarantees
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              EduMerge executes a deterministic backtracking algorithm with independent validation passes:
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                <span><strong>No Faculty Overlaps:</strong> A professor can never be double-booked across divisions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                <span><strong>Contiguous Lab Periods:</strong> Laboratory sessions are scheduled in continuous back-to-back slots.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                <span><strong>Daily Fatigue Limits:</strong> Theory subjects are distributed across distinct days.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-green-600 mt-0.5 shrink-0" />
                <span><strong>Room Capacity Matching:</strong> Student enrollment is strictly checked against room limits.</span>
              </li>
            </ul>
          </div>

          <div className="card-premium p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Configuration</h3>
            <div className="space-y-2 text-xs">
              <Link
                href="/teaching-assignments"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
              >
                <span className="font-medium text-slate-700">Configure Teaching Assignments</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                href="/faculty-availability"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
              >
                <span className="font-medium text-slate-700">Set Faculty Availability</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
              <Link
                href="/rooms"
                className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-colors"
              >
                <span className="font-medium text-slate-700">Audit Classroom Capacities</span>
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
