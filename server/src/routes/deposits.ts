import { Router } from 'express';
import { run, queryAll, queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Admin crypto wallet addresses — set these in your .env
// Format: WALLET_BTC, WALLET_ETH, WALLET_USDT, WALLET_SOL, WALLET_BNB
function getWalletAddresses(): Record<string, { address: string; network: string; label: string }> {
  const envMap: Record<string, string> = {
    BTC: process.env.WALLET_BTC || '',
    ETH: process.env.WALLET_ETH || '',
    USDT: process.env.WALLET_USDT || '',
    SOL: process.env.WALLET_SOL || '',
    BNB: process.env.WALLET_BNB || '',
    XRP: process.env.WALLET_XRP || '',
    ADA: process.env.WALLET_ADA || '',
    DOT: process.env.WALLET_DOT || '',
  };
  const networkMap: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum (ERC-20)',
    USDT: 'Tron (TRC-20) / Ethereum (ERC-20)',
    SOL: 'Solana',
    BNB: 'BNB Smart Chain (BEP-20)',
    XRP: 'XRP Ledger',
    ADA: 'Cardano',
    DOT: 'Polkadot',
  };
  const wallets: Record<string, { address: string; network: string; label: string }> = {};
  for (const sym of Object.keys(envMap)) {
    if (envMap[sym]) {
      wallets[sym] = { address: envMap[sym], network: networkMap[sym], label: sym };
    }
  }
  return wallets;
}

// GET /api/deposits/wallets — Get admin receiving wallet addresses (public)
router.get('/wallets', (_req, res) => {
  const wallets = Object.entries(getWalletAddresses()).map(([symbol, info]) => ({
    symbol,
    address: info.address,
    network: info.network,
    label: info.label,
  }));
  res.json(wallets);
});

// GET /api/deposits — User's deposit history
router.get('/', authenticate, (req: AuthRequest, res) => {
  const deposits = queryAll(
    `SELECT d.*, a.symbol, a.name as asset_name
     FROM deposits d
     JOIN crypto_assets a ON d.asset_id = a.id
     WHERE d.user_id = ?
     ORDER BY d.created_at DESC`,
    [req.user?.id]
  );
  res.json(deposits.map((d) => ({
    id: String(d.id),
    user_id: String(d.user_id),
    asset_id: String(d.asset_id),
    amount: d.amount,
    tx_hash: d.tx_hash,
    reference_id: d.reference_id,
    status: d.status,
    network: d.network,
    payment_method: d.payment_method,
    phone_number: d.phone_number,
    mpesa_receipt: d.mpesa_receipt,
    created_at: d.created_at,
    asset: { id: String(d.asset_id), symbol: d.symbol, name: d.asset_name, is_active: 1 },
  })));
});

// POST /api/deposits/crypto — Direct crypto deposit (user sends to admin wallet, submits tx hash)
router.post('/crypto', authenticate, async (req: AuthRequest, res) => {
  const { assetId, amount, txHash } = req.body;

  if (!assetId || !amount || amount <= 0) {
    res.status(400).json({ error: 'Valid asset and amount are required' });
    return;
  }

  const asset = queryOne('SELECT * FROM crypto_assets WHERE id = ?', [assetId]);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const walletInfo = getWalletAddresses()[asset.symbol as string];
  if (!walletInfo) {
    res.status(400).json({ error: `No receiving wallet configured for ${asset.symbol}` });
    return;
  }

  const refId = `DEP-${Date.now().toString(36).toUpperCase()}`;

  // Record the deposit as pending — admin confirms after verifying tx
  const result = run(
    'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, network, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user?.id, assetId, amount, refId, 'pending', 'Crypto Transfer', walletInfo.network, txHash || null]
  );

  res.status(201).json({
    id: String(result.lastInsertRowid),
    reference_id: refId,
    status: 'pending',
    message: txHash
      ? `Deposit of ${amount} ${asset.symbol} submitted. Waiting for admin to confirm.`
      : `Send ${amount} ${asset.symbol} to the wallet address above, then submit your transaction hash.`,
    wallet: {
      address: walletInfo.address,
      network: walletInfo.network,
      symbol: asset.symbol,
    },
  });
});

// POST /api/deposits — General deposit (M-Pesa, Airtel Money, Card, PayPal)
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { assetId, amount, network, paymentMethod, phoneNumber, cardLast4, cardBrand } = req.body;

  if (!assetId || !amount || !paymentMethod) {
    res.status(400).json({ error: 'Asset, amount, and payment method are required' });
    return;
  }

  const asset = queryOne('SELECT * FROM crypto_assets WHERE id = ?', [assetId]);
  if (!asset) {
    res.status(404).json({ error: 'Asset not found' });
    return;
  }

  const refId = `DEP-${Date.now().toString(36).toUpperCase()}`;

  // Build description based on payment method
  let description = `${paymentMethod} deposit`;
  if (paymentMethod === 'M-Pesa') {
    description = `M-Pesa deposit via ${phoneNumber || 'user'} — admin will confirm`; 
  } else if (paymentMethod === 'Card') {
    description = `Card deposit (${cardBrand || 'Card'} ending ${cardLast4 || '****'}) — admin will process`; 
  } else if (paymentMethod === 'Airtel Money') {
    description = `Airtel Money deposit via ${phoneNumber || 'user'} — admin will confirm`; 
  } else if (paymentMethod === 'PayPal') {
    description = 'PayPal deposit — admin will confirm'; 
  }

  const result = run(
    'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, phone_number, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user?.id, assetId, amount, refId, 'pending', paymentMethod, phoneNumber || null, network || paymentMethod]
  );

  // Log transaction record
  run(
    'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user?.id, 'deposit', amount, asset.symbol || 'USDT', refId, description, 'pending']
  );

  const messages: Record<string, string> = {
    'M-Pesa': `Deposit of ${amount} ${asset.symbol} via M-Pesa submitted. Admin will confirm your payment.`,
    'Card': `Card deposit of ${amount} ${asset.symbol} submitted. Admin will process your card payment.`,
    'Airtel Money': `Deposit of ${amount} ${asset.symbol} via Airtel Money submitted. Admin will confirm.`,
    'PayPal': `Deposit of ${amount} ${asset.symbol} via PayPal submitted. Admin will confirm.`,
  };

  res.status(201).json({
    id: String(result.lastInsertRowid),
    reference_id: refId,
    status: 'pending',
    message: messages[paymentMethod] || `Deposit recorded. Admin will confirm your ${paymentMethod} payment.`,
  });
});

export default router;
