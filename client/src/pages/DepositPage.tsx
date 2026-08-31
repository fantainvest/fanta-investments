import { useEffect, useState } from 'react';
import { deposits as depApi, crypto as cryptoApi } from '../services/api';
import { ArrowDownRight, CreditCard, Smartphone, Globe, Copy, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import type { CryptoAsset } from '../types';

const PAYMENT_ICONS: Record<string, typeof Smartphone> = {
  'M-Pesa': Smartphone,
  'Airtel Money': Smartphone,
  'Card': CreditCard,
  'PayPal': Globe,
};

const PAYMENT_COLORS: Record<string, string> = {
  'M-Pesa': 'text-green-400 bg-green-900/30 border-green-800',
  'Airtel Money': 'text-red-400 bg-red-900/30 border-red-800',
  'Card': 'text-blue-400 bg-blue-900/30 border-blue-800',
  'PayPal': 'text-indigo-400 bg-indigo-900/30 border-indigo-800',
};

function getCardBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  return 'Card';
}

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

const CARD_BRAND_COLORS: Record<string, string> = {
  Visa: 'text-blue-400', Mastercard: 'text-orange-400', Amex: 'text-green-400', Card: 'text-gray-400',
};

export default function DepositPage() {
  const { country, formatAmount } = useCurrency();
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [depositsList, setDeposits] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | ''>('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mpesaWaiting, setMpesaWaiting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      cryptoApi.assets().catch(() => []),
      depApi.list().catch(() => []),
    ]).then(([a, d]) => { setAssets(a); setDeposits(d); });
  }, []);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const needsPhone = paymentMethod === 'M-Pesa' || paymentMethod === 'Airtel Money';
  const needsCard = paymentMethod === 'Card';
  const cardBrand = needsCard ? getCardBrand(cardNumber) : '';

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
    setLoading(true);
    try {
      const result = await depApi.create({
        assetId: selectedAssetId as number,
        amount: parseFloat(amount),
        network: paymentMethod,
        paymentMethod,
        phoneNumber: needsPhone ? phoneNumber : undefined,
      });

      setDeposits([result, ...depositsList]);

      if (paymentMethod === 'M-Pesa' && result.checkoutRequestId) {
        setMpesaWaiting(true);
        toast.success('📱 STK Push sent! Check your phone to complete payment.');
        // Poll for result
        pollMpesaResult(result.checkoutRequestId);
      } else {
        toast.success(`Deposit of ${amount} ${selectedAsset?.symbol} recorded! Admin will confirm.`);
      }

      setAmount('');
      setPhoneNumber('');
      setCardNumber('');
      setCardExpiry('');
      setCardCVV('');
      setCardName('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Deposit failed');
    }
    setLoading(false);
  };

  const pollMpesaResult = async (checkoutRequestId: string) => {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const result = await fetch(`/api/mpesa/query/${checkoutRequestId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then((r) => r.json());

        if (result.success) {
          setMpesaWaiting(false);
          toast.success(`✅ M-Pesa payment confirmed! Receipt: ${result.mpesaReceipt}`);
          // Refresh deposits
          const deps = await depApi.list();
          setDeposits(deps);
          return;
        }
        if (result.resultCode && result.resultCode !== '0' && result.resultCode !== '1032') {
          setMpesaWaiting(false);
          toast.error(`Payment failed: ${result.resultDesc}`);
          return;
        }
      } catch { /* continue polling */ }
    }
    setMpesaWaiting(false);
    toast('Payment still processing. Check back later.');
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

            {needsPhone && (
              <div>
                <label className="label">Phone Number</label>
                <input type="tel" className="input-field" placeholder={country.code === 'KE' ? '+254 7XX XXX XXX' : '+255 7XX XXX XXX'} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                <p className="text-gray-500 text-xs mt-1">You'll receive an STK Push on this number</p>
              </div>
            )}

            {needsCard && (
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
                <div className="flex items-center gap-2 text-green-400 text-xs"><CheckCircle size={14} /><span>Accepted worldwide — no OTP required</span></div>
              </div>
            )}

            {paymentMethod && selectedAssetId && (
              <div>
                <label className="label">Amount ({selectedAsset?.symbol})</label>
                <input type="number" step="any" className="input-field text-lg font-bold" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                {amount && selectedAsset && <p className="text-fanta-400 text-sm mt-1">≈ {formatAmount(parseFloat(amount))}</p>}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading || mpesaWaiting || !paymentMethod || !selectedAssetId || !amount}>
              {mpesaWaiting ? (
                <><Loader2 size={18} className="animate-spin" /> Waiting for M-Pesa confirmation...</>
              ) : loading ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><ArrowDownRight size={18} /> {paymentMethod === 'Card' ? `Pay ${amount || '...'} ${selectedAsset?.symbol || ''} Now` : `Deposit via ${paymentMethod || '...'}`}</>
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
