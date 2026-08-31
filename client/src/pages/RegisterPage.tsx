import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FantaLogo from '../components/FantaLogo';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, firstName, lastName });
      toast.success('Account created! Welcome aboard.');
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <FantaLogo size={56} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Start your crypto investment journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input type="text" className="input-field" placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input type="text" className="input-field" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input-field" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" className="input-field" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-fanta-400 hover:text-fanta-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
