import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Plane, Train, Bus, Building, Package, Shield, Clock, ChevronRight, User, Mail, Phone, Calendar, MapPin, AlertCircle, CheckCircle, Users, CreditCard } from 'lucide-react';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract booking data from URL params
  const bookingType = searchParams.get('type') || 'flights';
  const itemName = searchParams.get('name') || '';
  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const price = parseInt(searchParams.get('price') || '0');
  const departure = searchParams.get('departure') || '';
  const arrival = searchParams.get('arrival') || '';
  const duration = searchParams.get('duration') || '';
  const image = searchParams.get('image') || '';

  const [step, setStep] = useState(1); // 1 = Review, 2 = Traveller Details
  const [travellers, setTravellers] = useState([
    { firstName: '', lastName: '', email: '', phone: '', age: '', gender: 'male' }
  ]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [gstEnabled, setGstEnabled] = useState(false);
  const [errors, setErrors] = useState({});
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  // Load user info
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.name) {
      const parts = user.name.split(' ');
      setTravellers([{
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: '',
        age: '',
        gender: 'male'
      }]);
      setContactEmail(user.email || '');
    }
  }, []);

  const typeIcon = {
    flights: <Plane size={20} />,
    trains: <Train size={20} />,
    buses: <Bus size={20} />,
    hotels: <Building size={20} />,
    packages: <Package size={20} />,
  };

  const typeLabel = {
    flights: 'Flight',
    trains: 'Train',
    buses: 'Bus',
    hotels: 'Hotel',
    packages: 'Holiday Package',
  };

  // Pricing calculations
  const baseFare = price;
  const taxes = Math.round(baseFare * 0.12);
  const convenienceFee = 99;
  const totalBeforeDiscount = baseFare + taxes + convenienceFee;
  const totalPrice = totalBeforeDiscount - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'TRAVEL20') {
      const disc = Math.round(baseFare * 0.2);
      setDiscount(disc);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === 'FLY20') {
      const disc = Math.round(baseFare * 0.2);
      setDiscount(disc);
      setCouponApplied(true);
    } else if (couponCode.toUpperCase() === 'BUS500') {
      setDiscount(500);
      setCouponApplied(true);
    } else {
      setErrors(prev => ({ ...prev, coupon: 'Invalid coupon code' }));
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const addTraveller = () => {
    setTravellers(prev => [...prev, { firstName: '', lastName: '', email: '', phone: '', age: '', gender: 'male' }]);
  };

  const updateTraveller = (index, field, value) => {
    setTravellers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeTraveller = (index) => {
    if (travellers.length > 1) {
      setTravellers(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    travellers.forEach((t, i) => {
      if (!t.firstName.trim()) newErrors[`firstName_${i}`] = 'First name is required';
      if (!t.lastName.trim()) newErrors[`lastName_${i}`] = 'Last name is required';
      if (!t.age || t.age < 1) newErrors[`age_${i}`] = 'Valid age is required';
    });
    if (!contactEmail.trim() || !contactEmail.includes('@')) newErrors.contactEmail = 'Valid email is required';
    if (!contactPhone.trim() || contactPhone.length < 10) newErrors.contactPhone = 'Valid phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      const bookingData = {
        type: bookingType,
        itemName,
        source,
        destination,
        date,
        price: totalPrice,
        baseFare,
        taxes,
        convenienceFee,
        discount,
        travellers,
        contactEmail,
        contactPhone,
        departure,
        arrival,
        duration,
        image,
      };
      // Store booking data in sessionStorage for payment page
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
      navigate('/payment');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-4">
            {['Review Itinerary', 'Traveller Details', 'Payment'].map((label, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center space-x-2 ${i + 1 <= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i + 1 < step ? 'bg-green-500 text-white' :
                    i + 1 === step ? 'bg-blue-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {i + 1 < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span className="text-sm font-semibold hidden md:inline">{label}</span>
                </div>
                {i < 2 && <ChevronRight size={16} className="text-gray-300 mx-3" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Main Content */}
          <div className="flex-1 space-y-5">
            
            {/* Trip Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-white">
                  {typeIcon[bookingType]}
                  <div>
                    <span className="text-sm font-medium opacity-80">{typeLabel[bookingType]} Booking</span>
                    <h2 className="text-lg font-bold">{itemName}</h2>
                  </div>
                </div>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : ''}
                </span>
              </div>
              <div className="px-6 py-4">
                {bookingType !== 'hotels' && bookingType !== 'packages' ? (
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">{departure || '--:--'}</p>
                      <p className="text-sm text-gray-500 font-medium">{source}</p>
                    </div>
                    <div className="flex flex-col items-center flex-1 px-6">
                      <span className="text-xs text-gray-400 font-medium">{duration}</span>
                      <div className="w-full h-px bg-gray-300 my-2 relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-xs text-green-600 font-semibold">Non Stop</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">{arrival || '--:--'}</p>
                      <p className="text-sm text-gray-500 font-medium">{destination}</p>
                    </div>
                  </div>
                ) : bookingType === 'hotels' ? (
                  <div className="flex items-center gap-4">
                    {image && <img src={image} alt={itemName} className="w-24 h-24 rounded-xl object-cover" />}
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {source}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Calendar size={14} /> Check-in: {date}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">Free Cancellation Available</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {image && <img src={decodeURIComponent(image)} alt={itemName} className="w-24 h-24 rounded-xl object-cover" />}
                    <div>
                      <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} /> {destination || source}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><Clock size={14} /> {duration}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">All inclusive package</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Important Information</p>
                <ul className="space-y-1 text-xs">
                  <li>• Please ensure traveller names match government ID proof</li>
                  <li>• Booking confirmation will be sent to the contact email</li>
                  <li>• Free cancellation available up to 24 hours before departure</li>
                </ul>
              </div>
            </div>

            {/* Traveller Details Form */}
            {step >= 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users size={20} className="text-blue-500" />
                    Traveller Details
                  </h3>
                  <button
                    onClick={addTraveller}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                  >
                    + Add Traveller
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  {travellers.map((traveller, idx) => (
                    <div key={idx} className="space-y-4">
                      {idx > 0 && <hr className="border-gray-100" />}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Traveller {idx + 1}</span>
                        {idx > 0 && (
                          <button onClick={() => removeTraveller(idx)} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">First Name *</label>
                          <input
                            type="text"
                            value={traveller.firstName}
                            onChange={e => updateTraveller(idx, 'firstName', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border ${errors[`firstName_${idx}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm`}
                            placeholder="Enter first name"
                          />
                          {errors[`firstName_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`firstName_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={traveller.lastName}
                            onChange={e => updateTraveller(idx, 'lastName', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border ${errors[`lastName_${idx}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm`}
                            placeholder="Enter last name"
                          />
                          {errors[`lastName_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`lastName_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Age *</label>
                          <input
                            type="number"
                            value={traveller.age}
                            onChange={e => updateTraveller(idx, 'age', e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-xl border ${errors[`age_${idx}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm`}
                            placeholder="Age"
                            min="1"
                            max="120"
                          />
                          {errors[`age_${idx}`] && <p className="text-xs text-red-500 mt-1">{errors[`age_${idx}`]}</p>}
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 block mb-1">Gender</label>
                          <select
                            value={traveller.gender}
                            onChange={e => updateTraveller(idx, 'gender', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm bg-white"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Contact Information */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Mail size={16} className="text-blue-500" /> Contact Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={contactEmail}
                          onChange={e => setContactEmail(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border ${errors.contactEmail ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm`}
                          placeholder="email@example.com"
                        />
                        {errors.contactEmail && <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1">Phone Number *</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">+91</span>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-r-xl border ${errors.contactPhone ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm`}
                            placeholder="9876543210"
                            maxLength={10}
                          />
                        </div>
                        {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* GST Details Toggle */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={gstEnabled} onChange={e => setGstEnabled(e.target.checked)} className="w-4 h-4 text-blue-500 rounded" />
                      <span className="text-sm font-medium text-gray-700">I have a GST number (optional)</span>
                    </label>
                    {gstEnabled && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="GST Number" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                        <input type="text" placeholder="Company Name" className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Fare Breakdown Sidebar */}
          <div className="w-full lg:w-[340px] space-y-4">
            {/* Fare Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-20">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-500" /> Fare Summary
                </h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare ({travellers.length} traveller{travellers.length > 1 ? 's' : ''})</span>
                  <span className="font-semibold text-gray-900">₹{baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-semibold text-gray-900">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Convenience Fee</span>
                  <span className="font-semibold text-gray-900">₹{convenienceFee}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">Coupon Discount</span>
                    <span className="font-semibold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <hr className="border-gray-100" />
                <div className="flex justify-between text-lg font-black">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-600">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="px-5 pb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Have a Coupon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value); setErrors(prev => ({ ...prev, coupon: '' })); }}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500"
                      disabled={couponApplied}
                    />
                    {couponApplied ? (
                      <button onClick={() => { setCouponApplied(false); setDiscount(0); setCouponCode(''); }} className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">Remove</button>
                    ) : (
                      <button onClick={handleApplyCoupon} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition">Apply</button>
                    )}
                  </div>
                  {errors.coupon && <p className="text-xs text-red-500 mt-1">{errors.coupon}</p>}
                  {couponApplied && <p className="text-xs text-green-600 mt-1 font-semibold">✓ Coupon applied! You saved ₹{discount.toLocaleString('en-IN')}</p>}
                </div>
              </div>

              {/* Proceed Button */}
              <div className="px-5 pb-5">
                <button
                  onClick={handleProceedToPayment}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base"
                >
                  Proceed to Payment <ChevronRight size={18} />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1"><Shield size={12} /> Secure</div>
                  <div className="flex items-center gap-1"><Clock size={12} /> Instant Confirmation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
