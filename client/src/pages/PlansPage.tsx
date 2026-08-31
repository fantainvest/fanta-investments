import { useEffect, useState } from 'react';
import { plans as plansApi, investments as invApi } from '../services/api';
import { Shield, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import toast from 'react-hot-toast';
import type { Plan } from '../types';

const riskColors: Record<string, string> = {
  low: 'text-green-400 bg-green-900/30 border-green-800',
  medium: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  high: 'text-orange-400 bg-orange-900/30 border-orange-800',
  very_high: 'text-red-400 bg-red-900/30 border-red-800',
};

const riskLabels: Record<string, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  very_high: 'Very High Risk',
};

export default function PlansPage() {
  const { country, formatAmount } = useCurrency();
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Plans are stored in KES, so display them as-is when country is Kenya
  const isKES = country.currency === 'KES';

  useEffect(() => {
    plansApi.list().then(setPlanList).catch(() => {});
  }, []);

  const handleInvest = async () => {
    if (!selected || !amount) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < selected.min_investment || amt > selected.max_investment) {
      toast.error(`Amount must be between ${formatAmount(selected.min_investment, undefined, isKES)} and ${formatAmount(selected.max_investment, undefined, isKES)}`);
      return;
    }
    setLoading(true);
    try {
      await invApi.create({ planId: Number(selected.id), amount: amt });
      toast.success(`Successfully invested in ${selected.name}!`);
      setSelected(null);
      setAmount('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Investment failed');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Investment Plans</h1>
        <p className="text-gray-400 text-sm mt-1">Choose a plan that fits your investment goals • {country.flag} {country.currency}</p>
      </div>

      <div className="flex gap-3 bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4 mb-8">
        <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
        <p className="text-yellow-200/80 text-sm">
          Expected returns shown below are <strong>illustrative only</strong> and not guaranteed. Cryptocurrency investments can lose value.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {planList.map((plan) => (
          <div key={plan.id} className={`card hover:border-fanta-600/50 transition-all ${selected?.id === plan.id ? 'border-fanta-500 ring-1 ring-fanta-500/30' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-black">{plan.name}</h3>
                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${riskColors[plan.risk_level]}`}>
                  <Shield size={12} /> {riskLabels[plan.risk_level]}
                </span>
              </div>
              <div className="text-right">
                <p className="text-fanta-400 text-2xl font-black">{plan.expected_return_min}–{plan.expected_return_max}%</p>
                <p className="text-gray-500 text-xs">expected range</p>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Min Investment</p>
                  <p className="text-sm font-bold">{formatAmount(plan.min_investment, undefined, isKES)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Max Investment</p>
                  <p className="text-sm font-bold">{formatAmount(plan.max_investment, undefined, isKES)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-bold">{plan.duration_days} days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Fee</p>
                  <p className="text-sm font-bold">{plan.fee_percentage}%</p>
                </div>
              </div>
            </div>

            <button onClick={() => { setSelected(plan); setAmount(String(plan.min_investment)); }} className="btn-primary w-full">
              Invest in {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Invest Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black mb-1">Invest in {selected.name}</h2>
            <p className="text-gray-400 text-sm mb-6">Enter the amount you'd like to invest</p>

            <div className="space-y-4">
              <div>
                <label className="label">Amount ({country.currency})</label>
                <input type="number" className="input-field text-lg font-bold" placeholder={formatAmount(selected.min_investment, undefined, isKES)} value={amount} onChange={(e) => setAmount(e.target.value)} min={selected.min_investment} max={selected.max_investment} />
                <p className="text-gray-500 text-xs mt-1">Min: {formatAmount(selected.min_investment, undefined, isKES)} · Max: {formatAmount(selected.max_investment, undefined, isKES)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-400">Plan</span><span>{selected.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Duration</span><span>{selected.duration_days} days</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Fee</span><span>{selected.fee_percentage}%</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Expected Range</span><span className="text-fanta-400">{selected.expected_return_min}–{selected.expected_return_max}%</span></div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleInvest} className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? 'Processing...' : <><CheckCircle size={16} /> Confirm</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
