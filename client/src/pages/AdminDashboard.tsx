import { useEffect, useState } from 'react';
import { admin } from '../services/api';
import { Users, DollarSign, TrendingUp, Clock, ArrowDownRight, ArrowUpRight, Shield, CheckCircle, XCircle, Ban, RotateCcw, Wallet } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import type { AdminAnalytics, AdminUser, AdminDeposit, AdminWithdrawal, AdminInvestment, Transaction } from '../types';

type Tab = 'overview' | 'users' | 'deposits' | 'withdrawals' | 'investments' | 'admin_wallet' | 'transactions';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deposits, setDeposits] = useState<AdminDeposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [investments, setInvestments] = useState<AdminInvestment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminWallet, setAdminWallet] = useState<any[]>([]);

  // Admin wallet withdrawal modal
  const [showMainWalletModal, setShowMainWalletModal] = useState(false);
  const [mainWalletAssetId, setMainWalletAssetId] = useState('');
  const [mainWalletAmount, setMainWalletAmount] = useState('');
  const [mainWalletAddress, setMainWalletAddress] = useState('');
  const [mainWalletNetwork, setMainWalletNetwork] = useState('');
  const [mainWalletNotes, setMainWalletNotes] = useState('');
  const [mainWalletLoading, setMainWalletLoading] = useState(false);

  const refreshAll = () => {
    admin.analytics().then(setAnalytics).catch(() => {});
    admin.users().then(setUsers).catch(() => {});
    admin.deposits().then(setDeposits).catch(() => {});
    admin.withdrawals().then(setWithdrawals).catch(() => {});
    admin.investments().then(setInvestments).catch(() => {});
    admin.transactions().then(setTransactions).catch(() => {});
    admin.adminWallet().then(setAdminWallet).catch(() => {});
  };

  useEffect(() => { refreshAll(); }, []);

  const handleVerify = async (id: string) => {
    try {
      await admin.verifyUser(id);
      setUsers(users.map((u) => u.id === id ? { ...u, is_verified: true } : u));
      toast.success('User verified');
    } catch { toast.error('Failed'); }
  };

  const handleSuspend = async (id: string) => {
    try {
      await admin.suspendUser(id);
      setUsers(users.map((u) => u.id === id ? { ...u, is_suspended: !u.is_suspended } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const handleDepositStatus = async (id: string, status: string) => {
    try {
      await admin.updateDepositStatus(id, status);
      setDeposits(deposits.map((d) => d.id === id ? { ...d, status: status as AdminDeposit['status'] } : d));
      toast.success(`Deposit ${status}`);
      refreshAll();
    } catch { toast.error('Failed'); }
  };

  const handleWithdrawalStatus = async (id: string, status: string) => {
    try {
      await admin.updateWithdrawalStatus(id, status);
      setWithdrawals(withdrawals.map((w) => w.id === id ? { ...w, status: status as AdminWithdrawal['status'] } : w));
      toast.success(`Withdrawal ${status}`);
      refreshAll();
    } catch { toast.error('Failed'); }
  };

  const handleMainWalletWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainWalletAssetId || !mainWalletAmount || !mainWalletAddress || !mainWalletNetwork) {
      toast.error('All fields are required');
      return;
    }
    setMainWalletLoading(true);
    try {
      const result = await admin.adminWalletWithdraw({
        assetId: mainWalletAssetId,
        amount: parseFloat(mainWalletAmount),
        walletAddress: mainWalletAddress,
        network: mainWalletNetwork,
        notes: mainWalletNotes || undefined,
      });
      toast.success(result.message || 'Withdrawal to main wallet completed');
      setShowMainWalletModal(false);
      setMainWalletAssetId(''); setMainWalletAmount(''); setMainWalletAddress(''); setMainWalletNetwork(''); setMainWalletNotes('');
      refreshAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Withdrawal failed');
    }
    setMainWalletLoading(false);
  };

  const selectedAdminWalletAsset = adminWallet.find((w) => w.asset_id === mainWalletAssetId);

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: TrendingUp },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'deposits', label: 'Deposits', icon: ArrowDownRight },
    { key: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
    { key: 'investments', label: 'Investments', icon: DollarSign },
    { key: 'admin_wallet', label: 'Admin Wallet', icon: Wallet },
    { key: 'transactions', label: 'Transactions', icon: Clock },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-fanta-600/20 flex items-center justify-center">
            <Shield className="text-fanta-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Platform management and analytics</p>
          </div>
        </div>
        <button onClick={() => setShowMainWalletModal(true)} className="btn-primary flex items-center gap-2">
          <ArrowUpRight size={16} /> Withdraw to Main Wallet
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-2 border-b border-gray-800">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? 'bg-fanta-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && analytics && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><Users className="text-fanta-400" size={20} /><span className="text-gray-400 text-sm">Users</span></div>
            <p className="text-2xl font-black">{analytics.totalUsers}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="text-green-400" size={20} /><span className="text-gray-400 text-sm">Total Deposits</span></div>
            <p className="text-2xl font-black">${analytics.totalDeposits.toLocaleString()}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><ArrowUpRight className="text-orange-400" size={20} /><span className="text-gray-400 text-sm">Total Withdrawals</span></div>
            <p className="text-2xl font-black">${analytics.totalWithdrawals.toLocaleString()}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><TrendingUp className="text-purple-400" size={20} /><span className="text-gray-400 text-sm">Active Investments</span></div>
            <p className="text-2xl font-black">{analytics.activeInvestments}</p>
            <p className="text-gray-500 text-xs">Total: ${analytics.totalInvested.toLocaleString()}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><ArrowDownRight className="text-yellow-400" size={20} /><span className="text-gray-400 text-sm">Pending Deposits</span></div>
            <p className="text-2xl font-black">{analytics.pendingDeposits}</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-3 mb-2"><ArrowUpRight className="text-yellow-400" size={20} /><span className="text-gray-400 text-sm">Pending Withdrawals</span></div>
            <p className="text-2xl font-black">{analytics.pendingWithdrawals}</p>
          </div>
          <div className="card sm:col-span-2">
            <div className="flex items-center gap-3 mb-2"><DollarSign className="text-fanta-400" size={20} /><span className="text-gray-400 text-sm">Platform Value</span></div>
            <p className="text-2xl font-black">${analytics.platformValue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      {tab === 'users' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 font-medium">User</th>
                <th className="text-left py-3 font-medium">Role</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-left py-3 font-medium">Joined</th>
                <th className="text-right py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-800/50">
                  <td className="py-3">
                    <p className="font-medium">{u.first_name} {u.last_name}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </td>
                  <td className="py-3"><span className={`text-xs font-medium ${u.role === 'admin' ? 'text-fanta-400' : 'text-gray-400'}`}>{u.role}</span></td>
                  <td className="py-3">
                    {u.is_suspended ? <StatusBadge status="suspended" /> : u.is_verified ? <StatusBadge status="confirmed" /> : <span className="text-gray-500 text-xs">Unverified</span>}
                  </td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!u.is_verified && u.role !== 'admin' && (
                        <button onClick={() => handleVerify(u.id)} className="p-1.5 rounded-lg bg-green-900/30 hover:bg-green-900/50 text-green-400" title="Verify"><CheckCircle size={14} /></button>
                      )}
                      {u.role !== 'admin' && (
                        <button onClick={() => handleSuspend(u.id)} className={`p-1.5 rounded-lg ${u.is_suspended ? 'bg-green-900/30 hover:bg-green-900/50 text-green-400' : 'bg-red-900/30 hover:bg-red-900/50 text-red-400'}`} title={u.is_suspended ? 'Unsuspend' : 'Suspend'}>
                          {u.is_suspended ? <RotateCcw size={14} /> : <Ban size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deposits Table */}
      {tab === 'deposits' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 font-medium">User</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Method</th>
                <th className="text-left py-3 font-medium">Reference</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id} className="border-b border-gray-800/50">
                  <td className="py-3">
                    <p className="font-medium">{d.user?.firstName} {d.user?.lastName}</p>
                    <p className="text-gray-500 text-xs">{d.user?.email}</p>
                  </td>
                  <td className="py-3 font-medium">{d.amount} {d.asset?.symbol}</td>
                  <td className="py-3 text-gray-400">{d.network}</td>
                  <td className="py-3 text-gray-400 text-xs">{d.reference_id}</td>
                  <td className="py-3"><StatusBadge status={d.status} /></td>
                  <td className="py-3 text-right">
                    {d.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDepositStatus(d.id, 'confirmed')} className="p-1.5 rounded-lg bg-green-900/30 hover:bg-green-900/50 text-green-400" title="Confirm"><CheckCircle size={14} /></button>
                        <button onClick={() => handleDepositStatus(d.id, 'failed')} className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400" title="Reject"><XCircle size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdrawals Table */}
      {tab === 'withdrawals' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 font-medium">User</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Method</th>
                <th className="text-left py-3 font-medium">Destination</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-right py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-b border-gray-800/50">
                  <td className="py-3">
                    <p className="font-medium">{w.user?.firstName} {w.user?.lastName}</p>
                    <p className="text-gray-500 text-xs">{w.user?.email}</p>
                  </td>
                  <td className="py-3 font-medium">{w.amount} {w.asset?.symbol}</td>
                  <td className="py-3 text-gray-400">{w.network}</td>
                  <td className="py-3 text-gray-400 text-xs font-mono truncate max-w-[150px]">{w.wallet_address}</td>
                  <td className="py-3"><StatusBadge status={w.status} /></td>
                  <td className="py-3 text-right">
                    {w.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleWithdrawalStatus(w.id, 'approved')} className="p-1.5 rounded-lg bg-green-900/30 hover:bg-green-900/50 text-green-400" title="Approve"><CheckCircle size={14} /></button>
                        <button onClick={() => handleWithdrawalStatus(w.id, 'rejected')} className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400" title="Reject"><XCircle size={14} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Investments Table */}
      {tab === 'investments' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 font-medium">User</th>
                <th className="text-left py-3 font-medium">Plan</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Returns</th>
                <th className="text-left py-3 font-medium">Status</th>
                <th className="text-left py-3 font-medium">End Date</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-800/50">
                  <td className="py-3">
                    <p className="font-medium">{inv.user?.firstName} {inv.user?.lastName}</p>
                    <p className="text-gray-500 text-xs">{inv.user?.email}</p>
                  </td>
                  <td className="py-3">{inv.plan?.name}</td>
                  <td className="py-3 font-medium">KSh{inv.amount.toLocaleString()}</td>
                  <td className="py-3 text-green-400 font-medium">+KSh{inv.return_amount.toLocaleString()}</td>
                  <td className="py-3"><StatusBadge status={inv.status} /></td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(inv.end_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Wallet Tab */}
      {tab === 'admin_wallet' && (
        <div>
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold">Admin Wallet</h2>
                <p className="text-gray-400 text-xs">Funds from user withdrawal requests — withdraw to main wallet when ready</p>
              </div>
              <button onClick={() => setShowMainWalletModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                <ArrowUpRight size={14} /> Withdraw to Main Wallet
              </button>
            </div>

            {adminWallet.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="text-gray-600 mx-auto mb-3" size={40} />
                <p className="text-gray-500 text-sm">No funds in admin wallet yet</p>
                <p className="text-gray-600 text-xs mt-1">When users request withdrawals, funds appear here</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminWallet.map((w) => (
                  <div key={w.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{w.asset?.symbol}</span>
                      <span className="text-gray-500 text-xs">{w.asset?.name}</span>
                    </div>
                    <p className="text-fanta-400 text-2xl font-black">{w.balance}</p>
                    <p className="text-gray-500 text-xs mt-1">Available to withdraw</p>
                    <button
                      onClick={() => { setMainWalletAssetId(String(w.asset_id)); setShowMainWalletModal(true); }}
                      className="mt-3 w-full btn-outline text-xs !py-2 flex items-center justify-center gap-1"
                    >
                      <ArrowUpRight size={12} /> Send to Main Wallet
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent admin wallet transactions */}
          <div className="card">
            <h3 className="text-sm font-bold mb-3">Recent Wallet Activity</h3>
            {transactions.filter((t) => t.type === 'admin_withdrawal' || t.type === 'withdrawal').length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {transactions.filter((t) => t.type === 'admin_withdrawal' || t.type === 'withdrawal').slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'admin_withdrawal' ? 'bg-orange-600/20' : 'bg-green-600/20'}`}>
                      <ArrowUpRight className={t.type === 'admin_withdrawal' ? 'text-orange-400' : 'text-green-400'} size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{t.amount} {t.asset_symbol}</p>
                      <p className="text-gray-500 text-xs truncate">{t.description}</p>
                    </div>
                    <span className={`text-xs font-medium ${t.type === 'admin_withdrawal' ? 'text-orange-400' : 'text-green-400'}`}>
                      {t.type === 'admin_withdrawal' ? 'OUT' : 'IN'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {tab === 'transactions' && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left py-3 font-medium">Type</th>
                <th className="text-left py-3 font-medium">Amount</th>
                <th className="text-left py-3 font-medium">Description</th>
                <th className="text-left py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-800/50">
                  <td className="py-3"><span className={`text-xs font-medium capitalize ${t.type === 'deposit' ? 'text-green-400' : t.type === 'withdrawal' ? 'text-orange-400' : t.type === 'return' ? 'text-blue-400' : t.type === 'admin_withdrawal' ? 'text-red-400' : 'text-fanta-400'}`}>{t.type.replace('_', ' ')}</span></td>
                  <td className="py-3 font-medium">{t.amount} {t.asset_symbol}</td>
                  <td className="py-3 text-gray-400 text-xs">{t.description}</td>
                  <td className="py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Withdraw to Main Wallet Modal */}
      {showMainWalletModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowMainWalletModal(false)}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-black mb-1">Withdraw to Main Wallet</h2>
            <p className="text-gray-400 text-sm mb-6">Transfer funds from admin wallet to your main wallet</p>

            <form onSubmit={handleMainWalletWithdraw} className="space-y-4">
              <div>
                <label className="label">Select Asset</label>
                <select className="input-field" value={mainWalletAssetId} onChange={(e) => setMainWalletAssetId(e.target.value)} required>
                  <option value="">Choose asset</option>
                  {adminWallet.map((w) => (
                    <option key={w.asset_id} value={w.asset_id}>{w.asset?.name} ({w.asset?.symbol}) — Balance: {w.balance}</option>
                  ))}
                </select>
              </div>

              {mainWalletAssetId && (
                <>
                  <div>
                    <label className="label">Amount</label>
                    <input type="number" step="any" className="input-field" placeholder="0.00" value={mainWalletAmount} onChange={(e) => setMainWalletAmount(e.target.value)} max={selectedAdminWalletAsset?.balance || 0} required />
                    <p className="text-gray-500 text-xs mt-1">Max: {selectedAdminWalletAsset?.balance || 0} {selectedAdminWalletAsset?.asset?.symbol}</p>
                  </div>

                  <div>
                    <label className="label">Main Wallet Address</label>
                    <input type="text" className="input-field" placeholder="Your main wallet address" value={mainWalletAddress} onChange={(e) => setMainWalletAddress(e.target.value)} required />
                  </div>

                  <div>
                    <label className="label">Network</label>
                    <select className="input-field" value={mainWalletNetwork} onChange={(e) => setMainWalletNetwork(e.target.value)} required>
                      <option value="">Select network</option>
                      <option value="ERC-20">ERC-20 (Ethereum)</option>
                      <option value="TRC-20">TRC-20 (Tron)</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="SOL">Solana</option>
                      <option value="BEP-20">BEP-20 (BSC)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="PayPal">PayPal</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Notes (optional)</label>
                    <input type="text" className="input-field" placeholder="Transfer notes..." value={mainWalletNotes} onChange={(e) => setMainWalletNotes(e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMainWalletModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={mainWalletLoading || !mainWalletAssetId || !mainWalletAmount || !mainWalletAddress || !mainWalletNetwork}>
                  {mainWalletLoading ? 'Processing...' : <><ArrowUpRight size={16} /> Send to Main Wallet</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
