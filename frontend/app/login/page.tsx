'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { CalendarDays, User, Lock, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      if (response.displayName) {
        localStorage.setItem('displayName', response.displayName);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
      setLoading(false);
    }
  }

  function fillDemo(u: string, p: string) {
    setUsername(u);
    setPassword(p);
    setError('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf9] relative overflow-hidden p-4">
      {/* Decorative ambient gradients */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-green-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center z-10 my-8">
        
        {/* Left Side: Product Showcase */}
        <div className="hidden md:flex flex-col space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-green-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-green-600/30">
              <CalendarDays size={26} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
                Edu<span className="text-green-700">Merge</span>
              </span>
              <span className="block text-[11px] uppercase font-bold tracking-widest text-green-700 -mt-1">
                Timetable OS
              </span>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Intelligent Timetable Generation for Modern Colleges.
          </h2>

          <p className="text-slate-600 text-base leading-relaxed">
            Eliminate scheduling bottlenecks. Automate division cohorts, contiguous laboratory periods, and faculty availability with zero-overlap mathematical precision.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[3]" />
              </div>
              <span>Deterministic CSP Backtracking with zero faculty clashes</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[3]" />
              </div>
              <span>Enforced contiguous laboratory blocks & classroom capacities</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                <Check size={14} className="stroke-[3]" />
              </div>
              <span>Role-based portal for Administrators, Faculty & Students</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-green-800 bg-green-50 border border-green-200/80 px-3.5 py-1.5 rounded-full w-fit">
            <Sparkles size={14} className="text-green-600" />
            Spring Boot 3.5 + Next.js 15 Engine
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="card-premium p-8 sm:p-10 bg-white w-full max-w-md mx-auto relative border-t-4 border-t-green-600 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="md:hidden flex justify-center mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-xs">
                <CalendarDays size={22} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Sign In</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access schedules and master data
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="form-input text-xs pl-10 py-2.5"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="form-input text-xs pl-10 py-2.5"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm font-bold shadow-md shadow-green-700/20 mt-2"
            >
              <span>{loading ? 'Authenticating…' : 'Sign In to Portal'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-5 border-t border-gray-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              Quick Demo Accounts (Tap to Autofill):
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin', 'admin123')}
                className={`p-2 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                  username === 'admin'
                    ? 'border-green-600 bg-green-50 text-green-900 font-bold'
                    : 'border-gray-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <div className="font-bold">Admin</div>
                <div className="text-[10px] text-slate-400">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('kumar', 'faculty123')}
                className={`p-2 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                  username === 'kumar'
                    ? 'border-green-600 bg-green-50 text-green-900 font-bold'
                    : 'border-gray-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <div className="font-bold">Faculty</div>
                <div className="text-[10px] text-slate-400">faculty123</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('student', 'student123')}
                className={`p-2 rounded-xl border text-center transition-all text-xs font-medium cursor-pointer ${
                  username === 'student'
                    ? 'border-green-600 bg-green-50 text-green-900 font-bold'
                    : 'border-gray-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <div className="font-bold">Student</div>
                <div className="text-[10px] text-slate-400">student123</div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
