import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export default function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 3 seconds on the homepage
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-75 relative">
        <button 
          onClick={() => setIsOpen(false)} 
          className="absolute top-4 right-4 bg-white/50 hover:bg-white rounded-full p-1 transition z-10"
        >
          <X size={20} className="text-gray-800" />
        </button>
        
        <div className="bg-gradient-to-br from-brand-primary to-blue-800 p-8 text-center text-white">
          <Gift size={48} className="mx-auto mb-4 text-yellow-300 animate-bounce" />
          <h2 className="text-3xl font-extrabold mb-2">Special Offer!</h2>
          <p className="text-blue-100 text-lg mb-6">Get 20% off your first flight booking.</p>
          
          <div className="bg-white/20 border border-white/40 p-4 rounded-xl backdrop-blur-md">
            <span className="block text-sm uppercase tracking-wider mb-1 opacity-80">Use Promo Code</span>
            <span className="text-2xl font-mono font-bold tracking-widest text-yellow-300">TRAVEL20</span>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full bg-brand-secondary text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Claim Offer Now
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-800 transition"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
