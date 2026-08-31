import { useState } from 'react';
import { Mail, MessageSquare, Send, Phone, MapPin } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import FantaLogo from '../components/FantaLogo';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { country } = useCurrency();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-2">
        <FantaLogo size={40} />
        <h1 className="text-3xl font-black">Contact Us</h1>
      </div>
      <p className="text-gray-400 mb-8">Have a question or need support? We're here to help.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fanta-600/20 flex items-center justify-center shrink-0">
            <Mail className="text-fanta-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-sm">Email</p>
            <p className="text-gray-400 text-xs">support@fanta.io</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fanta-600/20 flex items-center justify-center shrink-0">
            <MessageSquare className="text-fanta-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-sm">Support</p>
            <p className="text-gray-400 text-xs">24/7 response</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fanta-600/20 flex items-center justify-center shrink-0">
            <Phone className="text-fanta-400" size={20} />
          </div>
          <div>
            <p className="font-medium text-sm">Phone</p>
            <p className="text-gray-400 text-xs">{country.code === 'KE' ? '+254 700 000 000' : '+1 800 FANTA'}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Send a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <input type="text" className="input-field" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input type="text" className="input-field" placeholder="How can we help?" value={subject} onChange={(e) => setSubject(e.target.value)} required />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input-field min-h-[120px] resize-y" placeholder="Tell us more..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
            <Send size={18} />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}
