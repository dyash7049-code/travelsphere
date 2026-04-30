import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Globe, Users, Heart, Award, Zap, Target, TrendingUp } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export default function AboutUs() {
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

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
  }, []);

  const values = [
    { icon: <Shield size={28} />, title: 'Trust & Safety', desc: 'Every booking is protected with our secure payment gateway and 100% refund guarantee.', color: 'from-blue-500 to-cyan-400' },
    { icon: <Heart size={28} />, title: 'Customer First', desc: 'We put our customers at the heart of everything we do, ensuring seamless experiences.', color: 'from-pink-500 to-rose-400' },
    { icon: <Zap size={28} />, title: 'Innovation', desc: 'Leveraging AI and cutting-edge tech to make travel planning effortless and fun.', color: 'from-amber-500 to-orange-400' },
    { icon: <Globe size={28} />, title: 'Accessibility', desc: 'Making travel affordable and accessible to every Indian, from metros to villages.', color: 'from-emerald-500 to-teal-400' },
  ];

  const milestones = [
    { year: '2019', title: 'Founded', desc: 'TravelSphere was born with a mission to simplify travel booking in India.' },
    { year: '2020', title: 'First 100K Users', desc: 'Crossed 100,000 users within our first year despite global challenges.' },
    { year: '2022', title: 'AI Integration', desc: 'Launched AI-powered trip planner and smart chatbot assistant.' },
    { year: '2023', title: 'Hotel Partnerships', desc: 'Partnered with 50,000+ hotels across India for best-in-class stays.' },
    { year: '2024', title: '10M+ Travellers', desc: 'Reached 10 million happy travellers milestone with 99% satisfaction.' },
    { year: '2025', title: 'Going Global', desc: 'Expanding to international destinations across Southeast Asia and Europe.' },
  ];

  const team = [
    { name: 'Yash Desai', role: 'Founder & CEO', emoji: '👨‍💼' },
    { name: 'Aishwarya Shetty', role: 'CTO', emoji: '👩‍💻' },
    { name: 'Sujal Kakatkar', role: 'Head of Product', emoji: '👨‍🎨' },
    { name: 'Rohit Sakhalkar', role: 'Head of Operations', emoji: '👨‍🔧' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[350px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <span className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4 font-medium">Our Story</span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-center animate-gradient-text">About TravelSphere</h1>
          <p className="text-lg text-white/70 max-w-2xl text-center">Empowering millions of Indians to explore the world with seamless, affordable, and delightful travel experiences.</p>
        </div>
      </div>

      {/* Mission Section */}
      <div
        id="mission-section"
        ref={el => (sectionRefs.current['mission-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className={`grid md:grid-cols-2 gap-12 items-center ${visibleSections['mission-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-brand-primary" size={24} />
              <span className="text-sm font-bold uppercase tracking-widest text-brand-primary">Our Mission</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">Making Travel Simple, Affordable & Memorable</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              At TravelSphere, we believe every journey tells a story. Founded in 2019, we set out to revolutionize how India travels — from bustling metro cities to the serene villages of the countryside.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our platform brings together flights, trains, buses, hotels, and holiday packages under one roof, powered by AI technology that understands your preferences and finds the best deals for you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: '10M+', label: 'Happy Travellers', color: 'from-blue-500 to-cyan-400' },
              { value: '500+', label: 'Destinations', color: 'from-purple-500 to-pink-400' },
              { value: '50K+', label: 'Hotel Partners', color: 'from-orange-500 to-amber-400' },
              { value: '99%', label: 'Satisfaction Rate', color: 'from-emerald-500 to-teal-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center hover-tilt cursor-default">
                <div className={`text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div
        id="values-section"
        ref={el => (sectionRefs.current['values-section'] = el)}
        className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${visibleSections['values-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Core Values</h2>
            <p className="text-blue-200/70 max-w-xl mx-auto">The principles that guide everything we do at TravelSphere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, i) => (
              <div
                key={i}
                className={`icon-hover-spin bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300 cursor-default ${visibleSections['values-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
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

      {/* Timeline / Milestones */}
      <div
        id="timeline-section"
        ref={el => (sectionRefs.current['timeline-section'] = el)}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className={`text-center mb-12 ${visibleSections['timeline-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="text-brand-primary" size={24} />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Journey</h2>
          </div>
          <p className="text-gray-500">Key milestones that shaped TravelSphere.</p>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-emerald-500 hidden md:block"></div>
          {milestones.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row items-center mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} ${visibleSections['timeline-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 0.12}s` }}
            >
              <div className={`md:w-5/12 ${i % 2 === 0 ? 'md:text-right md:pr-10' : 'md:text-left md:pl-10'}`}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover-tilt">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">{m.year}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{m.title}</h3>
                  <p className="text-sm text-gray-500 mt-2">{m.desc}</p>
                </div>
              </div>
              <div className="hidden md:flex md:w-2/12 justify-center relative">
                <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-md z-10"></div>
              </div>
              <div className="md:w-5/12"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Section */}
      <div
        id="team-section"
        ref={el => (sectionRefs.current['team-section'] = el)}
        className="bg-white py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${visibleSections['team-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Users className="text-brand-primary" size={24} />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Leadership Team</h2>
            </div>
            <p className="text-gray-500">The passionate minds behind TravelSphere.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div
                key={i}
                className={`bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 hover-tilt cursor-default ${visibleSections['team-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${(i + 1) * 0.12}s` }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-4xl">
                  {member.emoji}
                </div>
                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg text-white/80 mb-8">Join 10 million+ travellers who trust TravelSphere for their adventures.</p>
          <a href="/" className="inline-block bg-white text-blue-600 font-bold px-10 py-4 rounded-full text-lg hover:bg-blue-50 transition-all animate-pulse-glow">
            Explore Now →
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
