'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, 
  Users2, 
  GraduationCap, 
  BookOpen, 
  DoorOpen, 
  Clock, 
  Briefcase, 
  CalendarCheck 
} from 'lucide-react';

const tabs = [
  { href: '/departments', label: 'Departments', icon: Building2 },
  { href: '/divisions', label: 'Divisions', icon: Users2 },
  { href: '/faculty', label: 'Faculty', icon: GraduationCap },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/rooms', label: 'Rooms', icon: DoorOpen },
  { href: '/teaching-assignments', label: 'Assignments', icon: Briefcase },
  { href: '/faculty-availability', label: 'Availability', icon: CalendarCheck },
  { href: '/time-slots', label: 'Time Slots', icon: Clock },
];

export default function MasterDataNav() {
  const pathname = usePathname();

  return (
    <div className="mb-6 border-b border-gray-200">
      <div className="flex items-center gap-1 overflow-x-auto pb-px scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-green-600 text-green-800 bg-green-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-green-700' : 'text-slate-400'} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
