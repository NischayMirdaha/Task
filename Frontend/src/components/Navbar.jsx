import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ScanText, Home, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };

    window.addEventListener('authChange', handleAuthChange);
    // Poll just in case
    const interval = setInterval(handleAuthChange, 1000);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20 shadow-sm backdrop-blur-md bg-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300">
                <ScanText size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Mirdaha<span className="text-indigo-600">Scan</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link 
              to="/" 
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/') ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
            >
              <Home size={18} />
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                to="/scan" 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive('/scan') ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
              >
                <ScanText size={18} />
                Scan Document
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-300"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Get Started</span>
                </Link>
              </>
            ) : (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
