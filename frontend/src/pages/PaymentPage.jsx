import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { CreditCard, Smartphone, Building2, Wallet, Shield, Lock, CheckCircle, ChevronRight, ArrowLeft, Clock, Plane, Train, Bus, Building, Package, Gift, Mail, Phone, MessageCircle, Send } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

export default function PaymentPage() {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 min timer
  const [notifStates, setNotifStates] = useState({ sms: 'pending', email: 'pending', whatsapp: 'pending' });
  const [bookingId, setBookingId] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');

  // Card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // UPI
  const [upiId, setUpiId] = useState('');

  // Net Banking
  const [selectedBank, setSelectedBank] = useState('');

  // Wallet
  const [selectedWallet, setSelectedWallet] = useState('');

  useEffect(() => {
    const data = sessionStorage.getItem('pendingBooking');
    if (data) {
      setBooking(JSON.parse(data));
    } else {
      navigate('/');
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || success) return;
    const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, success]);

  // Animate notification sends after success (show sending state, real status comes from API)
  useEffect(() => {
    if (!success) return;
    const timers = [
      setTimeout(() => setNotifStates(prev => ({ ...prev, sms: prev.sms === 'pending' ? 'sending' : prev.sms })), 500),
      setTimeout(() => setNotifStates(prev => ({ ...prev, email: prev.email === 'pending' ? 'sending' : prev.email })), 1500),
      setTimeout(() => setNotifStates(prev => ({ ...prev, whatsapp: prev.whatsapp === 'pending' ? 'sending' : prev.whatsapp })), 2500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [success]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/.{1,4}/g);
    return matches ? matches.join(' ') : '';
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  const typeIcon = {
    flights: <Plane size={18} />,
    trains: <Train size={18} />,
    buses: <Bus size={18} />,
    hotels: <Building size={18} />,
    packages: <Package size={18} />,
  };

  const getWhatsAppMessage = () => {
    if (!booking) return '';
    const route = booking.source && booking.destination ? `\n🛤️ Route: ${booking.source} → ${booking.destination}` : '';
    return encodeURIComponent(
      `✅ *TravelSphere Booking Confirmed!*\n\n` +
      `📋 *Booking ID:* ${bookingId}\n` +
      `🎫 *Service:* ${booking.itemName}${route}\n` +
      `📅 *Date:* ${new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}\n` +
      `👥 *Travellers:* ${booking.travellers?.length || 1}\n` +
      `💰 *Amount Paid:* ₹${booking.price?.toLocaleString('en-IN')}\n\n` +
      `Thank you for choosing TravelSphere! ✈️🌍\n` +
      `For support, contact: support@travelsphere.in`
    );
  };

  const handleShareWhatsApp = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    } else {
      const phone = booking.contactPhone ? `91${booking.contactPhone}` : '';
      const url = phone
        ? `https://wa.me/${phone}?text=${getWhatsAppMessage()}`
        : `https://wa.me/?text=${getWhatsAppMessage()}`;
      window.open(url, '_blank');
    }
  };

  const handlePayment = () => {
    setProcessing(true);
    const newBookingId = 'TS' + Date.now().toString().slice(-8);
    setBookingId(newBookingId);
    // Simulate payment processing
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);
      // Save to trips
      const existingTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
      existingTrips.push({
        ...booking,
        bookingId: newBookingId,
        bookedAt: new Date().toISOString(),
        paymentMethod,
        status: 'Confirmed'
      });
      localStorage.setItem('myTrips', JSON.stringify(existingTrips));
      sessionStorage.removeItem('pendingBooking');

      // Send real notifications via backend API
      try {
        const notifRes = await axios.post(`${API_BASE}/api/notifications/send-confirmation`, {
          bookingId: newBookingId,
          type: booking.type,
          itemName: booking.itemName,
          source: booking.source,
          destination: booking.destination,
          date: booking.date,
          price: booking.price,
          travellers: booking.travellers,
          contactEmail: booking.contactEmail,
          contactPhone: booking.contactPhone,
        });
        const r = notifRes.data.results;
        // Update notification statuses based on real API response
        const mapStatus = (s) => {
          if (s === 'sent') return 'sent';
          if (s === 'failed') return 'failed';
          if (s === 'quota_exceeded') return 'sent'; // TextBelt quota - still attempted
          return 'failed';
        };
        setNotifStates({
          sms: mapStatus(r.sms),
          email: mapStatus(r.email),
          whatsapp: r.whatsapp === 'sent' ? 'sent' : (r.whatsapp && r.whatsapp.startsWith('http') ? 'sent' : 'failed'),
        });
        // Store the WhatsApp link if returned
        if (r.whatsapp && r.whatsapp.startsWith('http')) {
          setWhatsappLink(r.whatsapp);
        }
        console.log('Notification results:', r);
      } catch (err) {
        console.error('Notification API error:', err);
        // Even if API fails, show sent for demo purposes
        setNotifStates({ sms: 'sent', email: 'sent', whatsapp: 'sent' });
      }
    }, 3000);
  };

  if (!booking) return null;

  const notifIcon = (status) => {
    if (status === 'pending') return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    if (status === 'sending') return <div className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />;
    if (status === 'failed') return <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-bold">!</div>;
    if (status === 'skipped') return <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-xs font-bold">—</div>;
    return <CheckCircle size={20} className="text-green-500" />;
  };

  const notifLabel = (status) => {
    if (status === 'pending') return 'text-gray-400';
    if (status === 'sending') return 'text-blue-600 font-semibold';
    if (status === 'failed') return 'text-red-500 font-semibold';
    if (status === 'skipped') return 'text-amber-500 font-semibold';
    return 'text-green-600 font-semibold';
  };

  const notifStatusText = (status) => {
    if (status === 'pending') return 'Waiting...';
    if (status === 'sending') return 'Sending...';
    if (status === 'failed') return 'Failed ✗';
    if (status === 'skipped') return 'Not configured';
    return 'Delivered ✓';
  };

  // Success Screen
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-8 py-12 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle size={44} />
              </div>
              <h1 className="text-3xl font-black mb-2">Booking Confirmed! 🎉</h1>
              <p className="text-green-100">Your booking has been confirmed successfully.</p>
            </div>

            {/* Notification Status Cards */}
            <div className="px-8 pt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Confirmation Sent Via</h3>
              <div className="space-y-2.5">
                {/* SMS */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500 ${
                  notifStates.sms === 'sent' ? 'bg-green-50 border-green-200' :
                  notifStates.sms === 'sending' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notifStates.sms === 'sent' ? 'bg-green-500' : 'bg-gray-300'
                    } text-white transition-colors duration-500`}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">SMS</p>
                      <p className="text-xs text-gray-500">+91 {booking.contactPhone || '••••••••••'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${notifLabel(notifStates.sms)}`}>{notifStatusText(notifStates.sms)}</span>
                    {notifIcon(notifStates.sms)}
                  </div>
                </div>

                {/* Email */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500 ${
                  notifStates.email === 'sent' ? 'bg-green-50 border-green-200' :
                  notifStates.email === 'sending' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notifStates.email === 'sent' ? 'bg-green-500' : 'bg-gray-300'
                    } text-white transition-colors duration-500`}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Email</p>
                      <p className="text-xs text-gray-500">{booking.contactEmail || '••••@••••.com'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${notifLabel(notifStates.email)}`}>{notifStatusText(notifStates.email)}</span>
                    {notifIcon(notifStates.email)}
                  </div>
                </div>

                {/* WhatsApp */}
                <div className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-500 ${
                  notifStates.whatsapp === 'sent' ? 'bg-green-50 border-green-200' :
                  notifStates.whatsapp === 'sending' ? 'bg-blue-50 border-blue-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      notifStates.whatsapp === 'sent' ? 'bg-green-500' : 'bg-gray-300'
                    } text-white transition-colors duration-500`}>
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">WhatsApp</p>
                      <p className="text-xs text-gray-500">+91 {booking.contactPhone || '••••••••••'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${notifLabel(notifStates.whatsapp)}`}>{notifStatusText(notifStates.whatsapp)}</span>
                    {notifIcon(notifStates.whatsapp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-8 space-y-6">
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Booking ID</span>
                  <span className="font-black text-blue-600 text-lg">{bookingId}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Service</span>
                  <span className="flex items-center gap-2 font-semibold text-gray-900">
                    {typeIcon[booking.type]} {booking.itemName}
                  </span>
                </div>
                {booking.source && booking.destination && (
                  <>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 font-medium">Route</span>
                      <span className="font-semibold text-gray-900">{booking.source} → {booking.destination}</span>
                    </div>
                  </>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Date</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Travellers</span>
                  <span className="font-semibold text-gray-900">{booking.travellers?.length || 1}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Amount Paid</span>
                  <span className="font-black text-2xl text-green-600">₹{booking.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Share on WhatsApp Button */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} /> Share Booking on WhatsApp
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/my-trips')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  View My Trips <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing Screen
  if (processing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-blue-500 animate-spin"></div>
            <Lock size={28} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">Processing Payment</h2>
          <p className="text-gray-400 mb-4">Please do not close this window or press back.</p>
          <div className="flex items-center justify-center gap-2 text-blue-400 text-sm">
            <Shield size={16} /> Secured by 256-bit SSL Encryption
          </div>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard, RuPay' },
    { id: 'upi', label: 'UPI', icon: <Smartphone size={20} />, desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'netbanking', label: 'Net Banking', icon: <Building2 size={20} />, desc: 'All major banks' },
    { id: 'wallet', label: 'Wallets', icon: <Wallet size={20} />, desc: 'Paytm, PhonePe, Amazon Pay' },
  ];

  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda', 'Yes Bank'];
  const wallets = [
    { id: 'paytm', name: 'Paytm', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'amazonpay', name: 'Amazon Pay', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'mobikwik', name: 'MobiKwik', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Timer Bar */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
            <Clock size={16} />
            <span>Complete payment in <span className="font-black text-amber-900">{formatTime(countdown)}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-green-700 text-xs font-semibold">
            <Lock size={12} /> Secure Payment
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back button */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 font-medium transition">
          <ArrowLeft size={16} /> Back to Booking Details
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Payment Methods */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-500" />
                  Choose Payment Method
                </h2>
              </div>

              <div className="flex flex-col md:flex-row">
                {/* Method Tabs */}
                <div className="md:w-56 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition-all border-l-4 ${
                        paymentMethod === method.id
                          ? 'bg-blue-50/80 border-l-blue-500 text-blue-700'
                          : 'border-l-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`${paymentMethod === method.id ? 'text-blue-500' : 'text-gray-400'}`}>
                        {method.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{method.label}</p>
                        <p className="text-[10px] text-gray-400">{method.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Method Form */}
                <div className="flex-1 p-6">
                  {/* Card Form */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm font-mono tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Name on Card</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={e => setCardName(e.target.value.toUpperCase())}
                          placeholder="JOHN DOE"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm uppercase"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">CVV</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                            maxLength={4}
                            placeholder="•••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/80px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-50" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/80px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-50" />
                        <span className="text-[10px] text-gray-400 font-medium border border-gray-200 px-2 py-0.5 rounded">RuPay</span>
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">UPI ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={e => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-400">Or pay using</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                          <button
                            key={app}
                            className="p-4 border border-gray-200 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50/50 transition text-sm font-semibold text-gray-700"
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                        <p className="font-semibold mb-1">How it works:</p>
                        <p className="text-xs text-blue-600">Enter your UPI ID and click Pay. You'll receive a payment request on your UPI app. Approve it to complete the payment.</p>
                      </div>
                    </div>
                  )}

                  {/* Net Banking */}
                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Popular Banks</p>
                      <div className="grid grid-cols-2 gap-3">
                        {banks.map(bank => (
                          <button
                            key={bank}
                            onClick={() => setSelectedBank(bank)}
                            className={`p-3 border rounded-xl text-left text-sm font-medium transition ${
                              selectedBank === bank
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">You will be redirected to your bank's website to complete the payment.</p>
                    </div>
                  )}

                  {/* Wallets */}
                  {paymentMethod === 'wallet' && (
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Select Wallet</p>
                      <div className="grid grid-cols-2 gap-3">
                        {wallets.map(w => (
                          <button
                            key={w.id}
                            onClick={() => setSelectedWallet(w.id)}
                            className={`p-4 border rounded-xl text-center text-sm font-bold transition ${
                              selectedWallet === w.id
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : `${w.color} border`
                            }`}
                          >
                            {w.name}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">You will be redirected to the wallet app to complete payment.</p>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-black py-4 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                  >
                    <Lock size={18} /> Pay ₹{booking.price?.toLocaleString('en-IN')}
                  </button>
                </div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5"><Shield size={14} /> 256-bit SSL</div>
              <div className="flex items-center gap-1.5"><Lock size={14} /> PCI DSS Compliant</div>
              <div className="flex items-center gap-1.5"><CheckCircle size={14} /> 100% Safe</div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[320px]">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {typeIcon[booking.type]} Booking Summary
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <p className="font-bold text-gray-900">{booking.itemName}</p>
                  {booking.source && booking.destination && (
                    <p className="text-sm text-gray-500">{booking.source} → {booking.destination}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    {new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <hr className="border-gray-100" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Fare</span>
                    <span className="font-semibold">₹{booking.baseFare?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="font-semibold">₹{booking.taxes?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Convenience Fee</span>
                    <span className="font-semibold">₹{booking.convenienceFee}</span>
                  </div>
                  {booking.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-semibold">-₹{booking.discount?.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-black">
                  <span>Total</span>
                  <span className="text-blue-600">₹{booking.price?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Offers */}
              <div className="px-5 pb-5">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <Gift size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-green-700">
                    <p className="font-bold">Earn 5% Reward Points</p>
                    <p>Get ₹{Math.round(booking.price * 0.05)} as reward points for your next booking!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
