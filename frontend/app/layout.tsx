import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'EduMerge Timetable OS - Automated Academic Scheduling',
  description: 'Intelligent conflict-free timetable generation for colleges and universities',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#f8faf9] text-slate-900 antialiased selection:bg-green-100 selection:text-green-800">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
