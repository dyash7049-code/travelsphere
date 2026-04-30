import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Briefcase, Calendar, MapPin, CheckCircle, Plane } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!user || !token) return;
    
    axios.get(`${API_BASE}/api/bookings/my-bookings`, {
      headers: { 'user-id': user.id } // Using mock auth header as per prototype backend
    })
    .then(res => {
      setTrips(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user, token]);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="bg-brand-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-2">
            <Briefcase size={32} />
            <h1 className="text-3xl font-bold">My Trips</h1>
          </div>
          <p className="text-gray-300 text-lg">Manage and view all your bookings in one place.</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane size={32} className="text-brand-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Looks empty here!</h2>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet.</p>
            <a href="/" className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition">
              Start Planning
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Upcoming & Past Bookings</h2>
            {trips.map(trip => (
              <div key={trip._id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-6">
                  <div className="bg-blue-50 text-brand-primary p-4 rounded-xl flex items-center justify-center h-fit">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{trip.bookingType}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Booking ID: {trip._id.slice(-6).toUpperCase()}</h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mt-2">
                      <span className="flex items-center"><MapPin size={16} className="mr-1"/> Itinerary Saved</span>
                      <span>{trip.passengers} Passenger(s)</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                  <span className="text-2xl font-bold text-gray-900">₹{trip.totalAmount}</span>
                  <span className="flex items-center text-green-600 font-bold text-sm mt-2 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle size={16} className="mr-1" /> {trip.status}
                  </span>
                  <span className="text-xs text-gray-400 mt-2">Booked on {new Date(trip.bookingDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
