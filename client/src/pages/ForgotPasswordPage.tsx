import { useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../services/api';
import { KeyRound } from 'lucide-react';
import FantaLogo from '../components/FantaLogo';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.forgotPassword(email);
      setSent(true);
    } catch {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <FantaLogo size={56} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black">Reset Password</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm">If an account exists with that email, a reset link has been sent. Check your inbox.</p>
            </div>
            <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-sm mt-6">
          <Link to="/login" className="text-fanta-400 hover:text-fanta-300">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
