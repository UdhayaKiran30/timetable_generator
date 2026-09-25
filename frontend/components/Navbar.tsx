'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  LayoutDashboard,
  Sparkles,
  History,
  Database,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import StatusBadge from './StatusBadge';
import { fetchCurrentUser } from '../lib/api';
import { Role, UserProfile } from '../types';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
  const [role, setRole] = useState<Role | null>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    setDataDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Only fetch if not on login page
    if (pathname !== '/login') {
      fetchCurrentUser().then(u => {
        if (u) {
          setUser(u);
          setRole(u.role);
        }
      });
    }
  }, [pathname]);

  if (pathname === '/login') {
    return null;
  }

  const isMasterDataActive = [
    '/departments',
    '/divisions',
    '/faculty',
    '/subjects',
    '/rooms',
    '/time-slots',
    '/teaching-assignments',
    '/faculty-availability'
  ].some(route => pathname.startsWith(route));

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/timetable/versions', label: 'Timetables', icon: History },
  ];

  if (role === 'ADMIN') {
    navLinks.splice(1, 0, { href: '/timetable/generate', label: 'Generate', icon: Sparkles });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-600 to-green-700 flex items-center justify-center text-white shadow-sm shadow-green-600/30 group-hover:scale-105 transition-transform duration-200">
                <CalendarDays size={20} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Edu<span className="text-green-700">Merge</span>
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-green-700 -mt-1">
                  Timetable OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                        ? 'bg-green-50 text-green-800 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <Icon size={16} className={isActive ? 'text-green-700' : 'text-slate-400'} />
                    {item.label}
                  </Link>
                );
              })}

              {/* Master Data Dropdown */}
              {role === 'ADMIN' && <div className="relative">
                <button
                  type="button"
                  onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                  onBlur={() => setTimeout(() => setDataDropdownOpen(false), 200)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${isMasterDataActive
                      ? 'bg-green-50 text-green-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Database size={16} className={isMasterDataActive ? 'text-green-700' : 'text-slate-400'} />
                  <span>Academic Data</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${dataDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dataDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-56 rounded-xl bg-white border border-gray-100 shadow-xl py-2 z-50 animate-enter">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Campus Resources
                    </div>
                    <Link href="/departments" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Departments
                    </Link>
                    <Link href="/divisions" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Divisions & Sections
                    </Link>
                    <Link href="/faculty" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Faculty Members
                    </Link>
                    <Link href="/subjects" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Subjects & Labs
                    </Link>
                    <Link href="/rooms" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Classrooms & Labs
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Scheduling Rules
                    </div>
                    <Link href="/teaching-assignments" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Teaching Assignments
                    </Link>
                    <Link href="/faculty-availability" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Faculty Availability
                    </Link>
                    <Link href="/time-slots" className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-800">
                      Daily Time Slots
                    </Link>
                  </div>
                )}
              </div>}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold text-xs border border-green-200">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-semibold text-slate-800">{user.displayName || user.username}</div>
                  <div className="mt-0.5">
                    <StatusBadge status={user.role} type="role" size="sm" />
                  </div>
                </div>
              </div>
            ) : null}

            <LogoutButton />

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-enter">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{user.displayName || user.username}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-green-50 text-green-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Icon size={18} className={isActive ? 'text-green-700' : 'text-slate-400'} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {role === 'ADMIN' && <div className="pt-2 border-t border-gray-100">
            <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Academic Resources
            </div>
            <div className="grid grid-cols-2 gap-1 text-sm mt-1">
              <Link href="/departments" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Departments</Link>
              <Link href="/divisions" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Divisions</Link>
              <Link href="/faculty" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Faculty</Link>
              <Link href="/subjects" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Subjects</Link>
              <Link href="/rooms" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Rooms</Link>
              <Link href="/time-slots" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Slots</Link>
              <Link href="/teaching-assignments" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Assignments</Link>
              <Link href="/faculty-availability" className="p-2 rounded-md text-slate-700 hover:bg-slate-50">Availability</Link>
            </div>
          </div>}
        </div>
      )}
    </header>
  );
}
