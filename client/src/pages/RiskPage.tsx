import { AlertTriangle } from 'lucide-react';
import FantaLogo from '../components/FantaLogo';

export default function RiskPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FantaLogo size={40} />
        <h1 className="text-3xl font-black">Risk Disclosure</h1>
      </div>

      <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-6 mb-8">
        <p className="text-yellow-200 font-medium">⚠️ Important: Please read this disclosure carefully before investing.</p>
      </div>

      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <h2 className="text-xl font-bold text-white mt-8">General Risk Warning</h2>
        <p>Cryptocurrency investments are highly speculative and carry a significant risk of loss. The value of digital assets can fluctuate dramatically over short periods.</p>

        <h2 className="text-xl font-bold text-white mt-8">No Guaranteed Returns</h2>
        <p>Any return ranges displayed on this Platform are <strong className="text-white">illustrative only</strong> and should not be interpreted as guarantees of future performance.</p>

        <h2 className="text-xl font-bold text-white mt-8">Market Volatility</h2>
        <p>Cryptocurrency markets are known for extreme volatility. Prices can drop 50% or more in a single day.</p>

        <h2 className="text-xl font-bold text-white mt-8">Payment Method Risks</h2>
        <p>Mobile money transactions (M-Pesa, Airtel Money) may be subject to carrier fees and processing delays. Card payments may incur foreign transaction fees depending on your bank.</p>

        <h2 className="text-xl font-bold text-white mt-8">Your Responsibility</h2>
        <p>You should only invest what you can afford to lose entirely. Consider your financial situation, risk tolerance, and investment objectives before using this Platform.</p>
      </div>
    </div>
  );
}
