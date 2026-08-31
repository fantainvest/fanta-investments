import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Wallet, BarChart3, AlertTriangle, ArrowRight, ChevronRight, CreditCard, Smartphone, Globe, Zap, Star, Users, Clock } from 'lucide-react';
import { crypto as cryptoApi } from '../services/api';
import FantaLogo from '../components/FantaLogo';
import FantaSoda from '../components/FantaSoda';
import { useCurrency } from '../contexts/CurrencyContext';
import type { CryptoPrice } from '../types';

const features = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'Encrypted accounts, 2FA support, and cold-storage practices protect your assets.' },
  { icon: TrendingUp, title: 'Diversified Strategies', desc: 'From conservative to aggressive — choose plans that match your risk appetite.' },
  { icon: Wallet, title: 'Multiple Payment Methods', desc: 'Deposit via M-Pesa, Airtel Money, Card, or PayPal. Withdraw anytime.' },
  { icon: BarChart3, title: 'Portfolio Tracking', desc: 'Real-time dashboards with performance charts and transaction history.' },
];

const paymentMethods = [
  { icon: Smartphone, name: 'M-Pesa', desc: 'Instant mobile money deposits & withdrawals', color: 'text-green-400' },
  { icon: Smartphone, name: 'Airtel Money', desc: 'Quick mobile money transfers', color: 'text-red-400' },
  { icon: CreditCard, name: 'Card', desc: 'Visa & Mastercard supported worldwide', color: 'text-blue-400' },
  { icon: Globe, name: 'PayPal', desc: 'Global payments in 200+ countries', color: 'text-indigo-400' },
];

export default function LandingPage() {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    cryptoApi.prices().then(setPrices).catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section — Eye-catching */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-fanta-950/60 via-gray-950 to-gray-950" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fanta-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fanta-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-orange-400/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-fanta-900/40 border border-fanta-700/50 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-fanta-200 text-sm font-medium">🔥 Markets are live — Start with just 199 KES</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-[1.05] mb-6">
                Invest in the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fanta-400 via-fanta-300 to-yellow-400">
                  Future of Finance
                </span>
              </h1>

              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg leading-relaxed">
                Start investing in crypto with as little as <span className="text-fanta-400 font-bold">199 KES</span>. 
                Real-time prices. Instant deposits via <span className="text-green-400 font-medium">M-Pesa</span>, 
                <span className="text-red-400 font-medium"> Airtel Money</span>, 
                <span className="text-blue-400 font-medium"> Card</span>, or 
                <span className="text-indigo-400 font-medium"> PayPal</span>.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link to="/register" className="btn-primary text-lg !px-8 !py-4 flex items-center gap-2 shadow-lg shadow-fanta-600/25 hover:shadow-fanta-600/40 transition-shadow">
                  Start Investing Now <ArrowRight size={20} />
                </Link>
                <Link to="/plans" className="btn-outline text-lg !px-8 !py-4">
                  View Plans
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: '10K+', label: 'Active Investors', icon: Users },
                  { value: '199 KES', label: 'Min Investment', icon: TrendingUp },
                  { value: '24/7', label: 'Platform Access', icon: Clock },
                  { value: '4.9★', label: 'User Rating', icon: Star },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <s.icon className="text-fanta-400 mx-auto mb-1" size={18} />
                    <p className="text-white font-black text-sm">{s.value}</p>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Fanta Soda Can */}
            <div className="hidden lg:flex justify-center items-center relative">
              <div className="absolute w-80 h-80 bg-fanta-500/20 rounded-full blur-3xl" />
              <FantaSoda className="w-48 md:w-56 h-auto relative z-10" />
              {/* Floating crypto badges */}
              <div className="absolute top-10 right-10 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl px-3 py-2 shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                <p className="text-xs text-gray-400">BTC</p>
                <p className="text-green-400 font-bold text-sm">+2.34%</p>
              </div>
              <div className="absolute bottom-20 left-5 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl px-3 py-2 shadow-xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                <p className="text-xs text-gray-400">ETH</p>
                <p className="text-green-400 font-bold text-sm">+1.87%</p>
              </div>
              <div className="absolute top-1/2 right-0 bg-gray-900/90 backdrop-blur-sm border border-fanta-700 rounded-xl px-3 py-2 shadow-xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                <p className="text-xs text-fanta-300">From 199 KES</p>
                <p className="text-white font-bold text-sm">Min Investment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Prices */}
      {prices.length > 0 && (
        <section className="border-y border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
              <span className="text-fanta-400 text-sm font-bold shrink-0">🔥 LIVE</span>
              {prices.map((p) => (
                <div key={p.symbol} className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-white">{p.symbol}</span>
                  <span className="text-gray-300">${p.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className={`text-sm font-bold ${p.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.change_24h >= 0 ? '▲' : '▼'} {Math.abs(p.change_24h).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-fanta-400 font-bold text-sm uppercase tracking-wider">Why Choose Us</span>
          <h2 className="text-3xl md:text-5xl font-black mt-2 mb-4">Built for <span className="text-fanta-500">Everyone</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">Whether you're a beginner or pro, we've got you covered.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-fanta-600/50 hover:bg-gray-800/80 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-fanta-600/20 flex items-center justify-center mb-5 group-hover:bg-fanta-600/30 transition-colors">
                <f.icon className="text-fanta-400" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <span className="text-fanta-400 font-bold text-sm uppercase tracking-wider">Pay Your Way</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4">Flexible <span className="text-fanta-500">Payments</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paymentMethods.map((pm) => (
              <div key={pm.name} className="flex items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-fanta-600/50 hover:bg-gray-750 transition-all">
                <div className={`w-14 h-14 rounded-xl bg-gray-700/50 flex items-center justify-center ${pm.color}`}>
                  <pm.icon size={28} />
                </div>
                <div>
                  <p className="font-bold text-lg">{pm.name}</p>
                  <p className="text-gray-500 text-xs">{pm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA with Fanta branding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative card max-w-4xl mx-auto bg-gradient-to-br from-fanta-950 via-fanta-900/30 to-gray-900 border-fanta-800/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fanta-500/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8">
            <div className="hidden lg:block w-32 shrink-0">
              <FantaSoda className="w-full h-auto" />
            </div>
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-3xl md:text-4xl font-black mb-3">Ready to Start?</h2>
              <p className="text-gray-300 mb-6 text-lg">Join thousands of investors. Start with just <span className="text-fanta-400 font-bold">199 KES</span>. Invest KSh5,000+ to unlock withdrawals from <span className="text-fanta-400 font-bold">$10 USD</span>.</p>
              <Link to="/register" className="btn-primary text-lg !px-8 !py-4 inline-flex items-center gap-2 shadow-lg shadow-fanta-600/25">
                Create Free Account <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Assets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center">
        <h2 className="text-2xl md:text-3xl font-black mb-8">Supported <span className="text-fanta-500">Assets</span></h2>
        <div className="flex flex-wrap justify-center gap-4">
          {['BTC', 'ETH', 'USDT', 'SOL', 'BNB', 'XRP', 'ADA', 'DOT'].map((sym) => (
            <div key={sym} className="bg-gray-800 border border-gray-700 rounded-xl px-6 py-3 font-bold text-lg hover:border-fanta-600/50 hover:bg-gray-750 transition-all cursor-default">
              {sym}
            </div>
          ))}
        </div>
      </section>

      {/* Risk Disclaimer */}
      <section className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex gap-4">
            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-2">Risk Disclaimer</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cryptocurrency investments carry significant risk, including the potential loss of your entire investment. 
                Expected return ranges are <strong className="text-gray-300">illustrative only</strong>. 
                Minimum investment: <strong className="text-fanta-400">199 KES (~$1.50 USD)</strong>. 
                Minimum withdrawal: <strong className="text-fanta-400">$10 USD</strong> (requires KSh5,000+ in investments).
                You should only invest what you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
