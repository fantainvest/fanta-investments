import { useEffect, useState } from 'react';
import { deposits as depApi, crypto as cryptoApi } from '../services/api';
import { ArrowDownRight, CreditCard, Smartphone, Globe, CheckCircle, Copy, ExternalLink, Wallet, Shield } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import type { CryptoAsset } from '../types';

const PAYMENT_ICONS: Record<string, typeof Smartphone> = {
  'M-Pesa': Smartphone,
  'Airtel Money': Smartphone,
  'Card': CreditCard,
  'PayPal': Globe,
  'Crypto Transfer': Wallet,
};

const PAYMENT_COLORS: Record<string, string> = {
  'M-Pesa': 'text-green-400 bg-green-900/30 border-green-800',
  'Airtel Money': 'text-red-400 bg-red-900/30 border-red-800',
  'Card': 'text-blue-400 bg-blue-900/30 border-blue-800',
  'PayPal': 'text-indigo-400 bg-indigo-900/30 border-indigo-800',
  'Crypto Transfer': 'text-orange-400 bg-orange-900/30 border-orange-800',
};

function getCardBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  return 'Card';
}
function formatCardNumber(val: string): string { return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); }
function formatExpiry(val: string): string { const d = val.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d; }
const CARD_BRAND_COLORS: Record<string, string> = { Visa: 'text-blue-400', Mastercard: 'text-orange-400', Card: 'text-gray-400' };

interface WalletAddress {
  symbol: string;
  address: string;
  network: string;
  label: string;
}

export default function DepositPage() {
  const { country, formatAmount } = useCurrency();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [depositsList, setDeposits] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminWallets, setAdminWallets] = useState<WalletAddress[]>([]);
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    Promise.all([
      cryptoApi.assets().catch(() => []),
      depApi.list().catch(() => []),
      fetch('/api/deposits/wallets').then(r => r.json()).catch(() => []),
    ]).then(([a, d, w]) => { setAssets(a); setDeposits(d); setAdminWallets(w); });
  }, []);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const needsPhone = paymentMethod === 'M-Pesa' || paymentMethod === 'Airtel Money';
  const isCryptoTransfer = paymentMethod === 'Crypto Transfer';
  const isCard = paymentMethod === 'Card';
  const cardBrand = isCard ? getCardBrand(cardNumber) : '';

  const selectedWallet = isCryptoTransfer && selectedAsset
    ? adminWallets.find(w => w.symbol === selectedAsset.symbol)
    : null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod || !selectedAssetId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }
    if (needsPhone && !phoneNumber) {
      toast.error('Phone number is required');
      return;
    }
    if (isCard && (!cardNumber || !cardExpiry || !cardCVV || !cardName)) {
      toast.error('Please fill all card details');
      return;
    }

    setLoading(true);
    try {
      if (isCryptoTransfer) {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/deposits/crypto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ assetId: selectedAssetId, amount: parseFloat(amount), txHash: txHash || undefined }),
        });
        if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to submit deposit'); }
        const result = await res.json();
        setDeposits([result, ...depositsList]);
        toast.success(`Deposit of ${amount} ${selectedAsset?.symbol} submitted!`);
        setAmount(''); setTxHash('');
      } else {
        // M-Pesa, Airtel Money, Card, PayPal — all go through the same admin-confirmed flow
        const result = await depApi.create({
          assetId: selectedAssetId as number,
          amount: parseFloat(amount),
          network: paymentMethod,
          paymentMethod,
          phoneNumber: needsPhone ? phoneNumber : undefined,
          cardLast4: isCard ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
          cardBrand: isCard ? cardBrand : undefined,
        });
        setDeposits([result, ...depositsList]);
        toast.success(`Deposit of ${amount} ${selectedAsset?.symbol} submitted! Admin will confirm your ${paymentMethod} payment.`);
        setAmount(''); setPhoneNumber('');
        setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardName('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed');
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black">Deposit Funds</h1>
        <p className="text-gray-400 text-sm mt-1">Add cryptocurrency to your account • {country.flag} {country.name}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-bold mb-6">New Deposit</h2>
          <form onSubmit={handleDeposit} className="space-y-5">
            <div>
              <label className="label">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {country.paymentMethods.map((method) => {
                  const Icon = PAYMENT_ICONS[method] || CreditCard;
                  return (
                    <button key={method} type="button" onClick={() => setPaymentMethod(method)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${paymentMethod === method ? `${PAYMENT_COLORS[method]} border-current` : 'bg-gray-800 border-gray-700 hover:border-gray-600 text-gray-300'}`}>
                      <Icon size={20} />
                      <span className="text-sm font-medium">{method}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod && (
              <div>
                <label className="label">Select Asset</label>
                <select className="input-field" value={selectedAssetId} onChange={(e) => setSelectedAssetId(Number(e.target.value) || '')}>
                  <option value="">Choose cryptocurrency</option>
                  {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.symbol})</option>)}
                </select>
              </div>
            )}

            {/* Crypto Transfer wallet address */}
            {isCryptoTransfer && selectedWallet && (
              <div className="bg-orange-900/20 border border-orange-800/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-bold">
                  <Wallet size={16} />
                  <span>Send {selectedAsset?.symbol} to this address</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <code className="text-xs text-orange-300 font-mono break-all">{selectedWallet.address}</code>
                  <button type="button" onClick={() => copyToClipboard(selectedWallet.address)} className="ml-2 p-1 hover:bg-gray-700 rounded">
                    <Copy size={14} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-500 text-xs">Network: {selectedWallet.network}</p>
                <div className="flex items-center gap-2 text-yellow-400 text-xs">
                  <ExternalLink size={12} />
                  <span>Only send {selectedAsset?.symbol} on {selectedWallet.network}</span>
                </div>
              </div>
            )}

            {/* M-Pesa / Airtel Money phone input */}
            {needsPhone && (
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" placeholder={country.code === 'KE' ? '+254 7XX XXX XXX' : '+255 7XX XXX XXX'} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                <p className="text-gray-500 text-xs mt-1">{paymentMethod} will process your payment</p>
              </div>
            )}

            {/* Direct card input */}
            {isCard && (
              <div className="space-y-3">
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
                <div className="flex items-center gap-2 text-green-400 text-xs"><Shield size={14} /><span>Card details are encrypted and secure</span></div>
              </div>
            )}

            {/* Amount */}
            {paymentMethod && selectedAssetId && (
              <div>
                <label className="label">Amount ({selectedAsset?.symbol})</label>
                <input type="number" step="any" className="input-field text-lg font-bold" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                {amount && selectedAsset && <p className="text-fanta-400 text-sm mt-1">≈ {formatAmount(parseFloat(amount))}</p>}
              </div>
            )}

            {/* Crypto Transfer tx hash */}
            {isCryptoTransfer && (
              <div>
                <label className="label">Transaction Hash (Optional)</label>
                <input type="text" className="input-field text-xs font-mono" placeholder="0x..." value={txHash} onChange={(e) => setTxHash(e.target.value)} />
                <p className="text-gray-500 text-xs mt-1">Paste your transaction hash after sending</p>
              </div>
            )}

            {/* Info badges */}
            {isCryptoTransfer && (
              <div className="flex items-center gap-2 text-orange-400 text-xs">
                <CheckCircle size={14} />
                <span>Send crypto directly — funds go to admin wallet</span>
              </div>
            )}

            {paymentMethod === 'M-Pesa' && (
              <div className="flex items-center gap-2 text-green-400 text-xs">
                <CheckCircle size={14} />
                <span>You'll receive an STK Push on your phone to confirm</span>
              </div>
            )}

            {isCard && (
              <div className="flex items-center gap-2 text-blue-400 text-xs">
                <CheckCircle size={14} />
                <span>Enter your card details — admin will process the payment</span>
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading || !paymentMethod || !selectedAssetId || !amount}>
              {loading ? 'Processing...' : (
                <><ArrowDownRight size={18} /> {
                  isCryptoTransfer ? `Deposit ${amount || '...'} ${selectedAsset?.symbol || ''} (Direct)` :
                  isCard ? `Pay ${amount || '...'} ${selectedAsset?.symbol || ''} with Card` :
                  `Deposit via ${paymentMethod || '...'}`
                }</>
              )}
            </button>
          </form>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold mb-4">Deposit History</h2>
          {depositsList.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No deposits yet.</p>
          ) : (
            <div className="space-y-3">
              {depositsList.map((d: any) => (
                <div key={d.id} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                    <ArrowDownRight className="text-green-400" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{d.amount} {d.asset?.symbol || d.symbol}</p>
                    <p className="text-gray-500 text-xs truncate">{d.reference_id} · {d.payment_method || d.network}</p>
                    {d.mpesa_receipt && <p className="text-green-400 text-xs">Receipt: {d.mpesa_receipt}</p>}
                    {d.tx_hash && <p className="text-blue-400 text-xs font-mono truncate">TX: {d.tx_hash}</p>}
                    <p className="text-gray-600 text-xs">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
