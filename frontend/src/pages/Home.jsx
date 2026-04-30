import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SearchWidget from '../components/SearchWidget';
import PromoPopup from '../components/PromoPopup';
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../api';
import { Shield, Clock, Headphones, Star, ChevronDown, MapPin, Plane, TrendingUp } from 'lucide-react';

export default function Home() {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/api/packages`)
      .then(res => setFeaturedPackages(res.data))
      .catch(err => console.error(err));
  }, []);

  // Intersection observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [featuredPackages]);

  const heroImages = [
    '/hero_nature_landscape.png',
    '/beach_paradise.png',
    '/aurora_mountains.png',
  ];

  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 6 + 2,
    delay: `${Math.random() * 8}s`,
    duration: `${Math.random() * 4 + 6}s`,
  }));

  const whyUsItems = [
    { icon: <Shield size={28} />, title: 'Secure Booking', desc: 'SSL encrypted payments with 100% refund guarantee', color: 'from-blue-500 to-cyan-400' },
    { icon: <Clock size={28} />, title: 'Instant Confirmation', desc: 'Get booking confirmations within seconds', color: 'from-purple-500 to-pink-400' },
    { icon: <Headphones size={28} />, title: '24/7 Support', desc: 'Round-the-clock assistance for all your queries', color: 'from-orange-500 to-amber-400' },
    { icon: <Star size={28} />, title: 'Best Prices', desc: 'Lowest fares guaranteed with exclusive deals', color: 'from-emerald-500 to-teal-400' },
  ];

  const stats = [
    { value: '10M+', label: 'Happy Travellers' },
    { value: '500+', label: 'Destinations' },
    { value: '99%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'Customer Support' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <PromoPopup />
      
      {/* ===== HERO SECTION WITH SLIDESHOW ===== */}
      <div className="relative h-[600px] md:h-[650px] overflow-hidden">
        {/* Slideshow images */}
        {heroImages.map((img, i) => (
          <div
            key={i}
            className={`absolute inset-0 hero-slide-${i + 1}`}
          >
            <img
              src={img}
              alt={`Travel destination ${i + 1}`}
              className="w-full h-full object-cover animate-ken-burns"
            />
          </div>
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10"></div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {particles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-white/40 animate-float-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4">
          <div className="animate-fade-in-up">
            <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/70 mb-4 text-center font-medium">
              ✈ Your Journey Begins Here
            </p>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4 text-center animate-fade-in-up delay-200 animate-gradient-text drop-shadow-2xl leading-tight">
            Discover Paradise
          </h1>
          <p className="text-lg md:text-2xl text-white/80 mb-8 text-center max-w-2xl animate-fade-in-up delay-400 font-light">
            Book Flights, Trains, Hotels & Holiday Packages — all at unbeatable prices.
          </p>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-scroll-indicator">
            <div className="flex flex-col items-center text-white/60 cursor-pointer hover:text-white/90 transition">
              <span className="text-xs uppercase tracking-widest mb-2">Explore</span>
              <ChevronDown size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEARCH WIDGET ===== */}
      <SearchWidget />

      {/* ===== STATS BAR ===== */}
      <div
        id="stats-section"
        ref={el => (sectionRefs.current['stats-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full"
      >
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${visibleSections['stats-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm animate-count-bounce cursor-default"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== EXCLUSIVE OFFERS ===== */}
      <div
        id="offers-section"
        ref={el => (sectionRefs.current['offers-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className={visibleSections['offers-section'] ? 'animate-fade-in-up' : 'opacity-0'}>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-brand-secondary" size={24} />
            <h2 className="text-3xl font-bold text-gray-900">Exclusive Offers</h2>
          </div>
          <p className="text-gray-500 mb-8">Grab these limited-time deals before they expire!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { img: '/flight_offer_img_1776883115852.png', tag: 'Flights', tagColor: 'text-red-500', title: 'Up to 20% Off on Domestic Flights', desc: 'Use code: FLY20. Valid till 30th Nov.', link: '/search/flights' },
            { img: '/bus_offer_img_1776883221234.png', tag: 'Buses', tagColor: 'text-blue-500', title: 'Flat ₹500 Off on AC Buses', desc: 'Use code: BUS500. Limited time offer.', link: '/search/buses' },
            { img: '/goa_img_1776883403196.png', tag: 'Holidays', tagColor: 'text-green-500', title: 'Buy 1 Get 1 Free on Goa Packages', desc: 'Book now and get a companion free.', link: '/packages' },
          ].map((offer, i) => (
            <div
              key={i}
              onClick={() => navigate(offer.link)}
              className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-row offer-card-shine hover-tilt cursor-pointer ${visibleSections['offers-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 0.15}s` }}
            >
              <img src={offer.img} alt="offer" className="w-1/3 object-cover" />
              <div className="p-4 w-2/3">
                <span className={`text-xs font-bold ${offer.tagColor} uppercase`}>{offer.tag}</span>
                <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
                <p className="text-sm text-gray-500">{offer.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== WHY TRAVELSPHERE ===== */}
      <div
        id="why-section"
        ref={el => (sectionRefs.current['why-section'] = el)}
        className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${visibleSections['why-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Why TravelSphere?</h2>
            <p className="text-blue-200/70 max-w-xl mx-auto">Trusted by millions of travellers across India for seamless, secure, and affordable travel booking.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsItems.map((item, i) => (
              <div
                key={i}
                className={`icon-hover-spin bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 cursor-default ${visibleSections['why-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 0.15}s` }}
              >
                <div className={`icon-inner w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-blue-200/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FEATURED PACKAGES ===== */}
      <div
        id="packages-section"
        ref={el => (sectionRefs.current['packages-section'] = el)}
        className="bg-white py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-end mb-8 ${visibleSections['packages-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl font-bold text-gray-900">Popular Destination Packages For You</h2>
            <div className="hidden md:flex space-x-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Swipe to explore →</span>
            </div>
          </div>
          
          <div className="flex overflow-x-auto space-x-6 pb-8 pt-2 snap-x hide-scrollbar">
            {featuredPackages.map((pkg, i) => (
              <div
                key={pkg._id}
                className={`w-[320px] md:w-[400px] h-[480px] flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg group cursor-pointer hover-tilt bg-white border border-gray-100 flex flex-col ${visibleSections['packages-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 0.12}s` }}
              >
                <div className="relative h-64 overflow-hidden flex-shrink-0">
                  <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    {pkg.duration}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{pkg.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{pkg.description}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider block">Starting from</span>
                      <span className="text-2xl font-bold text-brand-primary">₹{pkg.price}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/booking?type=packages&name=${encodeURIComponent(pkg.title)}&source=${encodeURIComponent(pkg.destination)}&destination=${encodeURIComponent(pkg.destination)}&date=${new Date().toISOString().split('T')[0]}&price=${pkg.price}&duration=${encodeURIComponent(pkg.duration)}&image=${encodeURIComponent(pkg.image || '')}`); }}
                      className="bg-brand-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition shadow-sm"
                    >
                      Explore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== RECOMMENDED DESTINATIONS ===== */}
      <div
        id="recommended-section"
        ref={el => (sectionRefs.current['recommended-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className={`flex justify-between items-end mb-8 ${visibleSections['recommended-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Recommended For You</h2>
            <p className="text-gray-500">Based on trending searches and top destinations.</p>
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Swipe to explore →</span>
            <Link to="/planner" className="bg-blue-50 text-brand-primary px-6 py-2 rounded-full font-bold hover:bg-blue-100 transition">
              Use AI Trip Planner ✨
            </Link>
          </div>
        </div>
        
        <div className="flex overflow-x-auto space-x-6 pb-8 pt-2 snap-x hide-scrollbar">
          {[
            { id: 1, title: 'Delhi', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80', desc: 'Explore the historical monuments and vibrant street food of the capital.', price: 4500 },
            { id: 2, title: 'Mumbai', image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&q=80', desc: 'Experience the fast-paced life and coastal beauty of the financial capital.', price: 6500 },
            { id: 3, title: 'Goa', image: '/goa_img_1776883403196.png', desc: 'Relax on the pristine beaches and enjoy the vibrant nightlife.', price: 8000 },
            { id: 4, title: 'Manali', image: '/manali_img_1776883445264.png', desc: 'Enjoy the snow-capped peaks and adventure sports in Solang Valley.', price: 5500 },
            { id: 5, title: 'Munnar', image: '/munnar_tea_estates_1776885800214.png', desc: 'Wander through lush green tea plantations and misty mountains.', price: 6000 },
            { id: 6, title: 'Sikkim', image: '/sikkim_mountains_1776885816997.png', desc: 'Experience breathtaking views of Kanchenjunga and vibrant monasteries.', price: 7500 },
          ].map((city, i) => (
            <div
              key={city.id}
              className={`w-[320px] md:w-[400px] h-[480px] flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-lg group cursor-pointer hover-tilt bg-white border border-gray-100 flex flex-col ${visibleSections['recommended-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 0.12}s` }}
            >
              <div className="relative h-64 overflow-hidden flex-shrink-0">
                <img src={city.image} alt={city.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{city.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{city.desc}</p>
                <div className="flex justify-between items-center mt-auto">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider block">Starting from</span>
                    <span className="text-2xl font-bold text-brand-primary">₹{city.price}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/search/flights?source=&destination=${encodeURIComponent(city.title)}&date=${new Date().toISOString().split('T')[0]}`); }}
                    className="bg-brand-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition shadow-sm"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link to="/planner" className="inline-block bg-blue-50 text-brand-primary px-6 py-3 rounded-full font-bold hover:bg-blue-100 transition w-full">
            Use AI Trip Planner ✨
          </Link>
        </div>
      </div>

      {/* ===== POPULAR FLIGHT ROUTES ===== */}
      <div
        id="routes-section"
        ref={el => (sectionRefs.current['routes-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className={`bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm ${visibleSections['routes-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center gap-3 mb-6">
            <Plane className="text-brand-primary" size={22} />
            <h2 className="text-2xl font-bold text-gray-900">Popular Flight Routes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
            {[
              { dest: 'Delhi', from: ['Mumbai', 'Pune', 'Bangalore', 'Goa'] },
              { dest: 'Mumbai', from: ['Delhi', 'Ahmedabad', 'Bangalore', 'Chennai'] },
              { dest: 'Bangalore', from: ['Mumbai', 'Kolkata', 'Delhi', 'Pune'] },
              { dest: 'Goa', from: ['Mumbai', 'Pune', 'Delhi', 'Indore'] },
              { dest: 'Jaipur', from: ['Mumbai', 'Ahmedabad', 'Pune', 'Bangalore'] },
              { dest: 'Kolkata', from: ['Mumbai', 'Hyderabad', 'Delhi', 'Bangalore'] },
              { dest: 'Pune', from: ['Delhi', 'Kolkata', 'Nagpur', 'Bangalore'] },
              { dest: 'Hyderabad', from: ['Mumbai', 'Delhi', 'Kolkata', 'Bangalore'] },
              { dest: 'Chennai', from: ['Mumbai', 'Hyderabad', 'Delhi', 'Coimbatore'] },
              { dest: 'Ahmedabad', from: ['Delhi', 'Mumbai', 'Bangalore', 'Pune'] },
              { dest: 'Patna', from: ['Delhi', 'Bangalore', 'Mumbai', 'Kolkata'] },
              { dest: 'Lucknow', from: ['Delhi', 'Mumbai', 'Bangalore', 'Pune'] },
            ].map((route, idx) => (
              <div key={idx} className="flex items-start gap-2.5 group">
                <span className="text-brand-primary mt-0.5">✈</span>
                <div>
                  <Link 
                    to={`/search/flights?source=${route.from[0]}&destination=${route.dest}&date=${new Date().toISOString().split('T')[0]}`}
                    className="font-bold text-gray-900 hover:text-brand-primary transition"
                  >
                    {route.dest} Flights
                  </Link>
                  <div className="text-sm text-gray-500">
                    From:{' '}
                    {route.from.map((city, i) => (
                      <span key={city}>
                        <Link 
                          to={`/search/flights?source=${city}&destination=${route.dest}&date=${new Date().toISOString().split('T')[0]}`}
                          className="text-brand-primary hover:underline cursor-pointer"
                        >
                          {city}
                        </Link>
                        {i < route.from.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== NATURE CTA BANNER ===== */}
      <div
        id="cta-section"
        ref={el => (sectionRefs.current['cta-section'] = el)}
        className="relative h-[350px] overflow-hidden"
      >
        <img src="/aurora_mountains.png" alt="Northern lights" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/60"></div>
        <div className={`relative z-10 flex flex-col items-center justify-center h-full text-white px-4 ${visibleSections['cta-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-center">Ready for Your Next Adventure?</h2>
          <p className="text-lg text-white/80 mb-8 text-center max-w-xl">Let our AI-powered trip planner create the perfect itinerary for you.</p>
          <Link
            to="/planner"
            className="bg-white text-blue-900 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50 transition-all animate-pulse-glow"
          >
            Plan My Trip ✨
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
