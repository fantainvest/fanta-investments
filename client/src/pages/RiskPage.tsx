import { Rocket, Shield, TrendingUp, Users, Zap } from 'lucide-react';
import FantaLogo from '../components/FantaLogo';
import { Link } from 'react-router-dom';

export default function RiskPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FantaLogo size={40} />
        <h1 className="text-3xl font-black">Why Fanta Investments</h1>
      </div>

      <div className="bg-gradient-to-r from-fanta-900/40 to-fanta-800/20 border border-fanta-700/50 rounded-xl p-6 mb-8">
        <p className="text-fanta-200 font-medium">🚀 We're on a mission to make crypto investing accessible to everyone, everywhere.</p>
      </div>

      <div className="space-y-8">
        <div className="card hover:border-fanta-600/50 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-fanta-600/20 flex items-center justify-center shrink-0">
              <Shield className="text-fanta-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Bank-Grade Security</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Your funds are protected with enterprise-level encryption, cold storage practices, and 2FA authentication. We take your security as seriously as you do.</p>
            </div>
          </div>
        </div>

        <div className="card hover:border-green-600/50 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center shrink-0">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Expert-Managed Portfolios</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Our team of experienced analysts and traders work around the clock to optimize your portfolio. From DeFi yields to institutional strategies — we handle the complexity so you don't have to.</p>
            </div>
          </div>
        </div>

        <div className="card hover:border-orange-600/50 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600/20 flex items-center justify-center shrink-0">
              <Zap className="text-orange-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Instant Deposits & Fast Withdrawals</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Deposit via M-Pesa, Card, Crypto Transfer, Airtel Money, or PayPal. Withdraw from as little as $10 USD — your money, your pace.</p>
            </div>
          </div>
        </div>

        <div className="card hover:border-purple-600/50 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0">
              <Users className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-2">Community of 10,000+ Investors</h2>
              <p className="text-gray-400 text-sm leading-relaxed">Join a thriving community of like-minded investors across Kenya, Tanzania, and beyond. Real people, real results — see what our users are saying.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-br from-fanta-950/60 to-gray-900 border border-fanta-800/30">
        <h3 className="text-2xl font-black mb-3">Ready to Build Wealth?</h3>
        <p className="text-gray-400 mb-6">Start with just 199 KES and watch your portfolio grow.</p>
        <Link to="/register" className="btn-primary !px-8 !py-3 inline-flex items-center gap-2">
          Get Started Free <Rocket size={18} />
        </Link>
      </div>
    </div>
  );
}
