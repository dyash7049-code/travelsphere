import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2.5 mb-4">
              <img src="/logo.png" alt="TravelSphere" className="w-8 h-8 rounded-lg shadow-sm" />
              <div className="flex items-baseline">
                <span className="text-xl font-black text-white">Travel</span>
                <span className="text-xl font-black text-orange-400">Sphere</span>
              </div>
            </div>
            <p className="text-sm">Your trusted platform for booking flights, buses, trains, and amazing holiday packages.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-primary transition">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-primary transition">Contact Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search/flights" className="hover:text-brand-primary transition">Flight Booking</Link></li>
              <li><Link to="/search/buses" className="hover:text-brand-primary transition">Bus Booking</Link></li>
              <li><Link to="/search/trains" className="hover:text-brand-primary transition">Train Booking</Link></li>
              <li><Link to="/packages" className="hover:text-brand-primary transition">Holiday Packages</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm mb-4">Subscribe to get the latest travel deals.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold animate-fade-in-up">
                <CheckCircle size={18} />
                <span>Subscribed successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="px-4 py-2 w-full rounded-l-md text-black focus:outline-none"
                  required
                />
                <button type="submit" className="bg-brand-secondary text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition">Subscribe</button>
              </form>
            )}
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TravelSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
