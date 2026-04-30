import { Link, useNavigate } from 'react-router-dom';
import { Plane, Bus, Train, Package, UserCircle, Menu, LogOut, Briefcase, Building } from 'lucide-react';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <img src="/logo.png" alt="TravelSphere" className="w-9 h-9 rounded-lg shadow-sm group-hover:scale-110 transition-transform duration-300" />
            <div className="flex items-baseline">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 bg-clip-text text-transparent tracking-tight group-hover:from-cyan-500 group-hover:via-blue-500 group-hover:to-blue-700 transition-all duration-500">
                Travel
              </span>
              <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Sphere
              </span>
            </div>
          </Link>
            
          <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2">
            {/* Navigation links removed as requested */}
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/my-trips" className="text-gray-600 hover:text-brand-primary flex items-center font-medium">
                  <Briefcase size={18} className="mr-1" /> My Trips
                </Link>
                <div className="flex items-center text-brand-primary font-bold">
                  <UserCircle size={24} className="mr-2" />
                  Hi, {user.name.split(' ')[0]}
                </div>
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="hidden md:flex items-center px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-lg font-medium hover:bg-brand-primary/20 transition">
                <UserCircle size={20} className="mr-2" />
                Login / Signup
              </button>
            )}
            <button className="md:hidden text-gray-500">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
