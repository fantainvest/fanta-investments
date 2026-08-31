import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FantaLogo from './FantaLogo';
import CurrencySelector from './CurrencySelector';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <FantaLogo size={36} />
            <span className="text-xl font-black tracking-tight">
              <span className="text-fanta-500">Fanta</span>{' '}
              <span className="text-white font-normal text-base">Investments</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-fanta-400 transition-colors text-sm font-medium">Dashboard</Link>
                <Link to="/plans" className="text-gray-300 hover:text-fanta-400 transition-colors text-sm font-medium">Plans</Link>
                <Link to="/deposit" className="text-gray-300 hover:text-fanta-400 transition-colors text-sm font-medium">Deposit</Link>
                <Link to="/withdraw" className="text-gray-300 hover:text-fanta-400 transition-colors text-sm font-medium">Withdraw</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium flex items-center gap-1">
                    <Shield size={14} /> Admin
                  </Link>
                )}
                <CurrencySelector />
                <div className="flex items-center gap-3 border-l border-gray-700 pl-4">
                  <div className="w-8 h-8 rounded-full bg-fanta-600/20 flex items-center justify-center text-fanta-400 text-sm font-bold">
                    {user.firstName?.[0]}
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors" title="Log out">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-fanta-400 transition-colors text-sm font-medium">Log In</Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-400 hover:text-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Dashboard</Link>
                <Link to="/plans" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Plans</Link>
                <Link to="/deposit" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Deposit</Link>
                <Link to="/withdraw" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Withdraw</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-yellow-400 hover:bg-gray-800 rounded-lg">Admin</Link>
                )}
                <div className="px-3 py-2"><CurrencySelector /></div>
                <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                  <LogOut size={16} /> Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg">Log In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-fanta-400 hover:bg-gray-800 rounded-lg font-medium">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
