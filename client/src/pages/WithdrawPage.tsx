import { useEffect, useState } from 'react';
import { withdrawals as wdApi, crypto as cryptoApi, wallets as walletApi } from '../services/api';
import { ArrowUpRight, AlertTriangle, CreditCard, Smartphone, Globe, CheckCircle, Wallet } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import type { CryptoAsset } from '../types';

const PAYMENT_ICONS: Record<string, typeof Smartphone> = { 'Crypto Transfer': Wallet, 'Airtel Money': Smartphone, 'Card': CreditCard, 'PayPal': Globe };
const PAYMENT_COLORS: Record<string, string> = { 'Crypto Transfer': 'text-green-400 bg-green-900/30 border-green-800', 'Airtel Money': 'text-red-400 bg-red-900/30 border-red-800', 'Card': 'text-blue-400 bg-blue-900/30 border-blue-800', 'PayPal': 'text-indigo-400 bg-indigo-900/30 border-indigo-800' };

function getCardBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  return 'Card';
}
function formatCardNumber(val: string): string { return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
function formatExpiry(val: string): string { const d = val.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
const CARD_BRAND_COLORS: Record<string, string> = { Visa: 'text-blue-400', Mastercard: 'text-orange-400', Card: 'text-gray-400' };

export default function WithdrawPage() {
  const { country, formatAmount } = useCurrency();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      cryptoApi.assets().catch(() => []),
      walletApi.list().catch(() => []),
      wdApi.list().catch(() => []),
    ]).then(([a, w, wd]) => {
      setAssets(a);
      setWallets(Array.isArray(w) ? w : (w?.wallets || []));
      setWithdrawalsList(wd);
    });
  }, []);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const userBalance = wallets.find((w: any) => w.asset_id == selectedAssetId)?.balance || 0;
  const needsPhone = paymentMethod === 'Airtel Money';
  const needsCard = paymentMethod === 'Card';
  const needsAddress = paymentMethod === 'PayPal' || paymentMethod === 'Crypto Transfer';
  const cardBrand = needsCard ? getCardBrand(cardNumber) : '';

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !amount || !paymentMethod) { toast.error('Please fill all fields'); return; }
    if (needsPhone && !destination) { toast.error('Phone number is required'); return; }
    if (needsCard && (!cardNumber || !cardExpiry || !cardCVV || !cardName)) { toast.error('Please fill all card details'); return; }
    if (!needsPhone && !needsCard && !needsAddress && !destination) { toast.error('Destination is required'); return; }

    const amt = parseFloat(amount);
    if (amt <= 0) { toast.error('Please enter a valid amount'); return; }
    if (amt > userBalance) { toast.error(`Insufficient balance. You have ${userBalance} ${selectedAsset?.symbol || ''} available.`); return; }

    setLoading(true);
    try {
      const dest = needsCard ? `Card ending ${cardNumber.replace(/\s/g, '').slice(-4)}` : destination;
      const wd = await wdApi.create({ assetId: selectedAssetId as number, amount: amt, walletAddress: dest, network: paymentMethod });
      setWithdrawalsList([wd, ...withdrawalsList]);
      toast.success(`Withdrawal of ${amount} ${selectedAsset?.symbol} submitted!`);
      setAmount(''); setDestination(''); setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Withdrawal failed';
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Withdraw Funds</h1>
        <p className="text-gray-400 text-sm mt-1">Transfer funds via your preferred method • {country.flag} {country.name}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">New Withdrawal</h2>
          <div className="space-y-3 mb-6">
            {wallets.filter((w: any) => w.balance > 0).length === 0 && (
              <div className="flex gap-3 bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-red-200 text-sm font-semibold">No funds available for withdrawal.</p>
                  <p className="text-red-300/60 text-xs mt-1">Deposit funds first to enable withdrawals. Once your deposit is confirmed by admin, you can withdraw.</p>
                </div>
              </div>
            )}
            <div className="flex gap-3 bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-3">
              <AlertTriangle className="text-yellow-500 shrink-0" size={18} />
              <p className="text-yellow-200/80 text-xs">Double-check your destination details. Transactions cannot be reversed.</p>
            </div>
            <div className="flex gap-3 bg-fanta-900/20 border border-fanta-800/50 rounded-lg p-3">
              <AlertTriangle className="text-fanta-400 shrink-0" size={18} />
              <p className="text-fanta-200/80 text-xs">Minimum withdrawal: <strong>$10 USD</strong>.</p>
            </div>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-5">
            <div>
              <label className="label">Withdrawal Method</label>
              <div className="grid grid-cols-2 gap-3">
                {country.paymentMethods.map((method) => {
                  const Icon = PAYMENT_ICONS[method] || CreditCard;
                  return (
                    <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === method ? `${PAYMENT_COLORS[method]} border-current` : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'}`}>
                      <Icon size={20} /><span className="text-sm font-medium">{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod && (
              <div>
                <label className="label">Select Asset</label>
                <select className="input-field" value={selectedAssetId} onChange={(e) => setSelectedAssetId(Number(e.target.value) || '')}>
                  <option value="">Choose asset</option>
                  {wallets.filter((w: any) => w.balance > 0).map((w: any) => (
                    <option key={w.asset_id} value={w.asset_id}>{w.asset?.name} ({w.asset?.symbol}) — {w.balance}</option>
                  ))}
                </select>
              </div>
            )}

            {paymentMethod && selectedAssetId && (
              <div>
                <label className="label">Amount ({selectedAsset?.symbol})</label>
                <input type="number" step="any" className="input-field text-lg font-bold" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} max={userBalance} required />
                <div className="flex justify-between mt-1">
                  <p className="text-gray-500 text-xs">Available: {userBalance} {selectedAsset?.symbol}</p>
                  {amount && <p className="text-fanta-400 text-xs">≈ {formatAmount(parseFloat(amount))}</p>}
                </div>
              </div>
            )}

            {needsPhone && paymentMethod && selectedAssetId && (
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" placeholder={country.code === 'KE' ? '+254 7XX XXX XXX' : '+255 7XX XXX XXX'} value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>
            )}

            {paymentMethod === 'PayPal' && selectedAssetId && (
              <div>
                <label className="label">PayPal Email</label>
                <input type="email" className="input-field" placeholder="your@email.com" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>
            )}

            {paymentMethod === 'Crypto Transfer' && selectedAssetId && (
              <div>
                <label className="label">Your Wallet Address</label>
                <input type="text" className="input-field font-mono text-xs" placeholder="Enter your crypto wallet address" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                <p className="text-gray-500 text-xs mt-1">We'll send crypto directly to this address</p>
              </div>
            )}

            {!needsPhone && !needsCard && !needsAddress && paymentMethod && selectedAssetId && (
              <div>
                <label className="label">Destination Address</label>
                <input type="text" className="input-field" placeholder="Wallet address" value={destination} onChange={(e) => setDestination(e.target.value)} required />
              </div>
            )}

            {needsCard && paymentMethod && selectedAssetId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="label !mb-0">Card Details</label>
                  {cardBrand !== 'Card' && <span className={`text-xs font-bold ${CARD_BRAND_COLORS[cardBrand]}`}>{cardBrand}</span>}
                </div>
                <input type="text" className="input-field" placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} maxLength={19} required />
                <input type="text" className="input-field" placeholder="Cardholder name" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" className="input-field" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} maxLength={5} required />
                  <input type="text" className="input-field" placeholder="CVV" value={cardCVV} onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} required />
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs"><CheckCircle size={14} /><span>Direct card payout — no OTP required</span></div>
                <p className="text-gray-500 text-xs">Credited within 1–3 business days. Accepted from all countries.</p>
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading || !paymentMethod || !selectedAsset || !amount}>
              {loading ? 'Processing...' : <><ArrowUpRight size={18} /> {needsCard ? `Withdraw ${amount || '...'} ${selectedAsset?.symbol || ''} to Card` : `Withdraw via ${paymentMethod || '...'}`}</>}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Withdrawal History</h2>
          {withdrawalsList.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No withdrawals yet.</p>
          ) : (
            <div className="space-y-3">
              {withdrawalsList.map((w: any) => (
                <div key={w.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-orange-600/20 flex items-center justify-center"><ArrowUpRight className="text-orange-400" size={18} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{w.amount} {w.asset?.symbol || w.symbol}</p>
                    <p className="text-gray-500 text-xs truncate">{w.reference_id} · {w.network}</p>
                    <p className="text-gray-600 text-xs">{new Date(w.created_at).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={w.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
