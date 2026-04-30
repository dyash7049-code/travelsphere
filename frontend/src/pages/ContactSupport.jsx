import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ContactSupport() {
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    { icon: <Phone size={24} />, title: 'Call Us', detail: '+91 1800-123-4567', subtitle: 'Toll-free, 24/7', color: 'from-blue-500 to-cyan-400' },
    { icon: <Mail size={24} />, title: 'Email Us', detail: 'support@travelsphere.in', subtitle: 'We reply within 2 hours', color: 'from-purple-500 to-pink-400' },
    { icon: <MessageCircle size={24} />, title: 'Live Chat', detail: 'Chat with our AI assistant', subtitle: 'Instant support', color: 'from-emerald-500 to-teal-400' },
    { icon: <MapPin size={24} />, title: 'Visit Us', detail: 'Sector 62, Noida, UP', subtitle: 'Mon-Fri, 9am-6pm', color: 'from-orange-500 to-amber-400' },
  ];

  const faqs = [
    { q: 'How do I cancel my booking?', a: 'Go to My Trips, select the booking, and click "Cancel". Refund will be processed within 5-7 business days.' },
    { q: 'Can I modify my travel dates?', a: 'Yes! Navigate to My Trips, click on your booking, and select "Modify". Date change fees may apply depending on the service provider.' },
    { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm, PhonePe, and Google Pay.' },
    { q: 'How do I get a refund?', a: 'Refunds are automatically processed upon cancellation. The amount depends on the cancellation policy of the specific booking.' },
    { q: 'Is my payment information secure?', a: 'Absolutely! We use 256-bit SSL encryption and are PCI DSS compliant. Your financial data is never stored on our servers.' },
    { q: 'How do I contact customer support?', a: 'You can reach us via phone (24/7), email, live chat, or visit our office. Our AI chatbot is also available on every page!' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <span className="text-sm uppercase tracking-[0.3em] text-white/60 mb-4 font-medium">Help & Support</span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 text-center animate-gradient-text">Contact Support</h1>
          <p className="text-lg text-white/70 max-w-2xl text-center">We're here to help 24/7. Reach out and we'll get back to you as soon as possible.</p>
        </div>
      </div>

      {/* Contact Methods */}
      <div
        id="contact-methods"
        ref={el => (sectionRefs.current['contact-methods'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactMethods.map((method, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-lg text-center hover-tilt cursor-default ${visibleSections['contact-methods'] ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{ animationDelay: `${(i + 1) * 0.1}s` }}
            >
              <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white shadow-lg`}>
                {method.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">{method.title}</h3>
              <p className="text-brand-primary font-semibold text-sm">{method.detail}</p>
              <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1"><Clock size={10} /> {method.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form + FAQ */}
      <div
        id="form-section"
        ref={el => (sectionRefs.current['form-section'] = el)}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className={`grid md:grid-cols-2 gap-12 ${visibleSections['form-section'] ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Send size={22} className="text-brand-primary" /> Send us a Message
            </h2>
            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-700 mb-2">Message Sent!</h3>
                <p className="text-emerald-600">We'll get back to you within 2 hours. Check your email for updates.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({...prev, subject: e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white"
                    required
                  >
                    <option value="">Select a topic</option>
                    <option value="booking">Booking Issue</option>
                    <option value="refund">Refund Request</option>
                    <option value="payment">Payment Issue</option>
                    <option value="modification">Booking Modification</option>
                    <option value="feedback">Feedback / Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(prev => ({...prev, message: e.target.value}))}
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                    placeholder="Describe your issue or question..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Send size={18} /> Send Message
                </button>
              </form>
            )}
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <MessageCircle size={22} className="text-brand-primary" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <details key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm group">
                  <summary className="p-4 cursor-pointer font-semibold text-gray-900 hover:text-brand-primary transition list-none flex items-center justify-between">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
