import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { wallets as walletApi, investments as invApi, deposits as depApi, withdrawals as wdApi, crypto as cryptoApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import StatusBadge from '../components/StatusBadge';

const chartData = [
  { name: 'Jun', value: 1200 },
  { name: 'Jul', value: 4500 },
  { name: 'Aug', value: 8200 },
  { name: 'Sep', value: 14500 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { country, formatAmount } = useCurrency();
  const [wallets, setWallets] = useState<any[]>([]);
  const [walletSummary, setWalletSummary] = useState<any>(null);
  const [investmentsList, setInvestments] = useState<any[]>([]);
  const [depositsList, setDeposits] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawals] = useState<any[]>([]);
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      walletApi.list().catch(() => ({ wallets: [], summary: null })),
      invApi.list().catch(() => []),
      depApi.list().catch(() => []),
      wdApi.list().catch(() => []),
      cryptoApi.prices().catch(() => []),
    ]).then(([w, i, d, wd, p]) => {
      if (w && typeof w === 'object' && 'wallets' in w) {
        setWallets(w.wallets || []);
        setWalletSummary(w.summary || null);
      } else {
        setWallets(Array.isArray(w) ? w : []);
      }
      setInvestments(i);
      setDeposits(d);
      setWithdrawals(wd);
      setPrices(p);
    });
  }, []);

  const getPrice = (symbol: string) => prices.find((p) => p.symbol === symbol)?.price_usd || 0;

  const totalWalletValue = wallets.reduce((sum: number, w: any) => {
    const sym = w.asset?.symbol || w.symbol || '';
    return sum + ((w.balance || 0) * getPrice(sym));
  }, 0);

  const totalInvested = investmentsList.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
  const totalReturns = investmentsList.reduce((sum: number, i: any) => sum + (i.return_amount || 0), 0);
  const totalDeposited = walletSummary?.totalDeposited || depositsList.filter((d: any) => d.status === 'confirmed').reduce((sum: number, d: any) => sum + d.amount, 0);
  const totalWithdrawn = walletSummary?.totalWithdrawn || withdrawalsList.filter((w: any) => ['approved', 'completed', 'pending'].includes(w.status)).reduce((sum: number, w: any) => sum + w.amount, 0);
  const portfolioValue = totalWalletValue + totalInvested + totalReturns;
  const activeInvestments = investmentsList.filter((i: any) => i.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Welcome back, {user?.firstName} <span className="inline-block animate-bounce">🍊</span></h1>
        <p className="text-gray-400 text-sm mt-1">Here's your portfolio overview • {country.flag} {country.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-fanta-600/20 flex items-center justify-center"><DollarSign className="text-fanta-400" size={20} /></div>
            <span className="text-gray-400 text-xs">Portfolio Value</span>
          </div>
          <p className="text-xl font-black">{formatAmount(portfolioValue)}</p>
          <div className="flex items-center gap-1 mt-1 text-green-400 text-xs"><TrendingUp size={12} /> +12.4%</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center"><ArrowDownRight className="text-green-400" size={20} /></div>
            <span className="text-gray-400 text-xs">Total Deposited</span>
          </div>
          <p className="text-xl font-black text-green-400">{formatAmount(totalDeposited)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center"><Activity className="text-purple-400" size={20} /></div>
            <span className="text-gray-400 text-xs">Invested</span>
          </div>
          <p className="text-xl font-black">{formatAmount(totalInvested)}</p>
          <p className="text-gray-500 text-xs mt-1">{activeInvestments.length} active</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-600/20 flex items-center justify-center"><TrendingUp className="text-yellow-400" size={20} /></div>
            <span className="text-gray-400 text-xs">Earnings</span>
          </div>
          <p className="text-xl font-black text-green-400">+{formatAmount(totalReturns)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center"><ArrowUpRight className="text-orange-400" size={20} /></div>
            <span className="text-gray-400 text-xs">Withdrawn</span>
          </div>
          <p className="text-xl font-black text-orange-400">{formatAmount(totalWithdrawn)}</p>
        </div>
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <h2 className="text-lg font-bold mb-4">Portfolio Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="value" stroke="#F97316" fill="url(#colorVal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/deposit" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-fanta-950/30 hover:border-fanta-600/30 border border-transparent transition-all">
              <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center"><ArrowDownRight className="text-green-400" size={20} /></div>
              <div><p className="font-medium text-sm">Deposit</p><p className="text-gray-500 text-xs">Add funds to your account</p></div>
              <ArrowRight className="text-gray-500 ml-auto" size={16} />
            </Link>
            <Link to="/withdraw" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-fanta-950/30 hover:border-fanta-600/30 border border-transparent transition-all">
              <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center"><ArrowUpRight className="text-orange-400" size={20} /></div>
              <div><p className="font-medium text-sm">Withdraw</p><p className="text-gray-500 text-xs">Transfer to external wallet</p></div>
              <ArrowRight className="text-gray-500 ml-auto" size={16} />
            </Link>
            <Link to="/plans" className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg hover:bg-fanta-950/30 hover:border-fanta-600/30 border border-transparent transition-all">
              <div className="w-10 h-10 rounded-lg bg-fanta-600/20 flex items-center justify-center"><TrendingUp className="text-fanta-400" size={20} /></div>
              <div><p className="font-medium text-sm">Invest</p><p className="text-gray-500 text-xs">Browse investment plans</p></div>
              <ArrowRight className="text-gray-500 ml-auto" size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Holdings */}
      {wallets.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4">Your Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-3 font-medium">Asset</th>
                  <th className="text-right py-3 font-medium">Balance</th>
                  <th className="text-right py-3 font-medium">Price</th>
                  <th className="text-right py-3 font-medium">Value</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((w: any) => {
                  const sym = w.asset?.symbol || w.symbol || '';
                  const price = getPrice(sym);
                  return (
                    <tr key={w.id} className="border-b border-gray-800/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-fanta-600/20 flex items-center justify-center text-xs font-bold text-fanta-400">{sym.slice(0, 2)}</div>
                          <div>
                            <p className="font-medium">{w.asset?.name || w.asset_name || sym}</p>
                            <p className="text-gray-500 text-xs">{sym}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3">{w.balance}</td>
                      <td className="text-right py-3">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="text-right py-3 font-medium">{formatAmount((w.balance || 0) * price)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Investments + Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Active Investments</h2>
            <Link to="/plans" className="text-fanta-400 text-sm hover:text-fanta-300">View All →</Link>
          </div>
          {activeInvestments.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No active investments. <Link to="/plans" className="text-fanta-400">Start investing →</Link></p>
          ) : (
            <div className="space-y-3">
              {activeInvestments.slice(0, 5).map((inv: any) => (
                <div key={inv.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-fanta-600/20 flex items-center justify-center">
                    <Clock className="text-fanta-400" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{inv.plan_name || inv.plan?.name || 'Investment'}</p>
                    <p className="text-gray-500 text-xs">{formatAmount(inv.amount)} · Ends {new Date(inv.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm font-medium">+{formatAmount(inv.return_amount || 0)}</p>
                    <p className="text-gray-500 text-xs">returns</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {depositsList.slice(0, 3).map((d: any) => (
              <div key={d.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <ArrowDownRight className="text-green-400" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Deposit</p>
                  <p className="text-gray-500 text-xs">{d.reference_id} · {d.payment_method || d.network}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">+{d.amount} {d.asset?.symbol || d.symbol}</p>
                  <StatusBadge status={d.status} />
                </div>
              </div>
            ))}
            {withdrawalsList.slice(0, 3).map((w: any) => (
              <div key={w.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center">
                  <ArrowUpRight className="text-orange-400" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Withdrawal</p>
                  <p className="text-gray-500 text-xs">{w.reference_id} · {w.network}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">-{w.amount} {w.asset?.symbol || w.symbol}</p>
                  <StatusBadge status={w.status} />
                </div>
              </div>
            ))}
            {depositsList.length === 0 && withdrawalsList.length === 0 && (
              <p className="text-gray-500 text-sm py-4">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
