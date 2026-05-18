import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { LogOut, FileText, Copy } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === `/home/${path}`;

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800 p-6">
      {/* Logo / Branding */}
      <div className="mb-10">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-sky-400" />
          <span className="text-lg font-semibold text-sky-400">ClearAI</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">EDI Dashboard</p>
      </div>

      {/* Navigation Menu */}
      <nav className="mb-auto space-y-2">
        <Link to="/home/generate-edi">
          <button
            className={cn(
              'w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
              isActive('generate-edi')
                ? 'bg-sky-500/15 text-sky-400'
                : 'text-slate-400 hover:bg-sky-100',
            )}
          >
            Generate EDI
          </button>
        </Link>

        <Link to="/home/decode-edi">
          <button
            className={cn(
              'w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
              isActive('decode-edi')
                ? 'bg-sky-500/15 text-sky-400'
                : 'text-slate-400 hover:bg-sky-100',
            )}
          >
            Decode EDI
          </button>
        </Link>
      </nav>

      {/* Sign Out */}
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="w-full justify-start gap-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </aside>
  );
}
