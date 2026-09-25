'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  
  return (
    <button 
      className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" 
      title="Logout" 
      onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/login');
      }}
    >
      <LogOut size={20} />
    </button>
  );
}
