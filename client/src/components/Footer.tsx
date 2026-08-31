import { Link } from 'react-router-dom';
import FantaLogo from './FantaLogo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <FantaLogo size={32} />
              <span className="text-lg font-black"><span className="text-fanta-500">Fanta</span> Investments</span>
            </Link>
            <p className="text-gray-400 text-sm">Smart crypto investing for every risk profile. Access diversified strategies and professional portfolio management.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <div className="space-y-2">
              <Link to="/plans" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Investment Plans</Link>
              <Link to="/dashboard" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Dashboard</Link>
              <Link to="/deposit" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Deposit</Link>
              <Link to="/withdraw" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Withdraw</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <div className="space-y-2">
              <Link to="/terms" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Privacy Policy</Link>
              <Link to="/risk" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Risk Disclosure</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">Contact Us</Link>
              <a href="mailto:support@fanta.io" className="block text-gray-400 hover:text-fanta-400 text-sm transition-colors">support@fanta.io</a>
            </div>
            <div className="mt-4 flex gap-2">
              {['M-Pesa', 'Airtel Money', 'Card', 'PayPal'].map((m) => (
                <span key={m} className="text-xs bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-gray-400">{m}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Fanta Investments. All rights reserved. Cryptocurrency investments carry risk. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}
