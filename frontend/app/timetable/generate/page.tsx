'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Layers,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';
import { api } from '../../../lib/api';
import { Department, GenerateResponse } from '../../../types';

export default function GeneratePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [semester, setSemester] = useState<number>(6);
  const [academicYear, setAcademicYear] = useState<string>('2026-2027');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api<{ role: string }>('/auth/me')
      .then((user) => {
        if (user.role !== 'ADMIN') {
          router.replace('/dashboard');
        }
      })
      .catch(() => router.replace('/login'));

    api<Department[]>('/departments')
      .then((data) => {
        setDepartments(data || []);
        if (data && data.length > 0) {
          setDepartmentId(String(data[0].id));
        }
      })
      .catch((err) => setError('Could not load departments: ' + err.message));
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!departmentId) return;

    setIsGenerating(true);
    setResult(null);
    setError('');

    // Simulate pleasant step feedback for UX
    setGenerationStep('Analyzing curriculum & teaching assignments…');
    await new Promise((r) => setTimeout(r, 400));
    setGenerationStep('Solving schedule graph with Backtracking Engine…');
    await new Promise((r) => setTimeout(r, 400));
    setGenerationStep('Executing independent conflict validation…');

    try {
      const response = await api<GenerateResponse>('/timetables/generate', {
        method: 'POST',
        body: JSON.stringify({
          departmentId: Number(departmentId),
          semester: Number(semester),
          academicYear,
        }),
      });

      setResult(response);
      if (!response.success && response.message) {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate timetable');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  }

  const selectedDept = departments.find((d) => String(d.id) === departmentId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-enter">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 text-xs font-semibold mb-3">
          <Sparkles size={14} className="text-green-600" />
          Deterministic CSP Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Generate Department Timetable
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Automates division schedules, contiguous lab slots, faculty availability, and room capacities with mathematical zero-overlap certainty.
        </p>
      </div>

      {/* Main Generator Form Card */}
      <div className="card-premium p-6 sm:p-8 bg-white">
        <form onSubmit={handleGenerate} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Department */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Building2 size={15} className="text-green-700" />
                Department
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="form-input font-medium"
                required
              >
                <option value="" disabled>Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Divisions in this department will be processed together.
              </p>
            </div>

            {/* Semester */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers size={15} className="text-green-700" />
                Academic Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(Number(e.target.value))}
                className="form-input font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Filter curricula and division cohorts.
              </p>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar size={15} className="text-green-700" />
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="form-input font-medium"
                placeholder="2026-2027"
                required
              />
              <p className="text-[11px] text-slate-400">
                Version lineage is tracked per academic year.
              </p>
            </div>

          </div>

          {/* Quick Context Pill */}
          {selectedDept && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-700" />
                <span>
                  Ready to schedule <strong>{selectedDept.name}</strong> for <strong>Semester {semester}</strong>.
                </span>
              </div>
              <Link
                href="/teaching-assignments"
                className="text-green-700 hover:text-green-800 font-semibold flex items-center gap-1"
              >
                Review assignments <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-gray-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              Typically completes in &lt; 2 seconds
            </div>

            <button
              type="submit"
              disabled={isGenerating || !departmentId}
              className="btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-md shadow-green-700/20"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{generationStep || 'Generating Schedule…'}</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Run Timetable Generator</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Generation Results View */}
      {result && result.success && result.timetable && (
        <div className="card-premium p-6 sm:p-8 bg-linear-to-b from-white to-green-50/50 border-green-200 shadow-md animate-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Timetable Generated Successfully!
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 font-mono text-xs font-bold">
                    v{result.timetable.version}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {selectedDept?.name} · Semester {result.timetable.semester} ({result.timetable.academicYear})
                </p>
              </div>
            </div>

            <Link
              href={`/timetable/${result.timetable.id}`}
              className="btn-primary self-start sm:self-center px-6 py-2.5 text-sm"
            >
              <span>Open Timetable Grid</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Status</span>
              <div className="text-sm font-bold text-amber-600 mt-1">DRAFT</div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Hard Constraints</span>
              <div className="text-sm font-bold text-green-700 mt-1">100% PASSED</div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Periods Scheduled</span>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {result.timetable.entries?.length || 0} Slots
              </div>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-gray-100 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Independent Audit</span>
              <div className="text-sm font-bold text-green-700 mt-1">0 Conflicts</div>
            </div>
          </div>
        </div>
      )}

      {/* Failure / Conflict Diagnostics */}
      {((result && !result.success) || error) && (
        <div className="card-premium p-6 sm:p-8 bg-red-50/50 border-red-200 animate-enter">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-red-900">
                Generation Could Not Complete
              </h3>
              <p className="text-xs text-red-700 mt-1">
                {error || result?.message || 'The constraint solver encountered unsolvable scheduling bottlenecks.'}
              </p>
            </div>
          </div>

          {result?.conflicts && result.conflicts.length > 0 && (
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-800">
                Identified Conflicts ({result.conflicts.length}):
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {result.conflicts.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-white border border-red-200 text-xs">
                    <div className="flex items-center justify-between font-semibold text-red-800 mb-1">
                      <span>{c.type}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px]">
                        {c.severity}
                      </span>
                    </div>
                    <p className="text-slate-600">{c.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-red-200/60 flex items-center gap-3">
            <Link href="/teaching-assignments" className="btn-secondary text-xs py-2 px-3 bg-white">
              Edit Teaching Assignments
            </Link>
            <Link href="/faculty-availability" className="btn-secondary text-xs py-2 px-3 bg-white">
              Adjust Faculty Availability
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
