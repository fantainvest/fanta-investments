import { Router } from 'express';
import { run, queryAll, queryOne } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { initiateSTKPush, isMpesaConfigured } from '../services/mpesa';

const router = Router();

// GET /api/deposits
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

// POST /api/deposits
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { assetId, amount, network, paymentMethod, phoneNumber } = req.body;

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

  if (paymentMethod === 'M-Pesa' && isMpesaConfigured() && phoneNumber) {
    // Real M-Pesa STK Push
    const stkResult = await initiateSTKPush(phoneNumber, amount, refId);

    if (stkResult.success && stkResult.checkoutRequestId) {
      // Save M-Pesa transaction
      run(
        'INSERT INTO mpesa_transactions (user_id, checkout_request_id, merchant_request_id, amount, phone_number, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user?.id, stkResult.checkoutRequestId, stkResult.merchantRequestId, amount, phoneNumber, 'pending']
      );

      // Create deposit record (pending until M-Pesa confirms via callback)
      const result = run(
        'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, phone_number, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user?.id, assetId, amount, refId, 'pending', 'M-Pesa', phoneNumber, 'M-Pesa']
      );

      res.status(201).json({
        id: String(result.lastInsertRowid),
        reference_id: refId,
        status: 'pending',
        message: stkResult.customerMessage || 'STK Push sent. Please complete payment on your phone.',
        checkoutRequestId: stkResult.checkoutRequestId,
      });
      return;
    } else {
      // M-Pesa failed but deposit still recorded
      const result = run(
        'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, phone_number, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user?.id, assetId, amount, refId, 'pending', 'M-Pesa', phoneNumber, 'M-Pesa']
      );
      res.status(201).json({
        id: String(result.lastInsertRowid),
        reference_id: refId,
        status: 'pending',
        message: stkResult.message,
      });
      return;
    }
  }

  // For Card, PayPal, Airtel Money — record deposit (admin confirms)
  const result = run(
    'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, phone_number, network) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user?.id, assetId, amount, refId, 'pending', paymentMethod, phoneNumber || null, network || paymentMethod]
  );

  res.status(201).json({
    id: String(result.lastInsertRowid),
    reference_id: refId,
    status: 'pending',
    message: `Deposit recorded. Admin will confirm your ${paymentMethod} payment.`,
  });
});

// POST /api/deposits/mpesa/callback — M-Pesa callback handler
router.post('/mpesa/callback', (req, res) => {
  try {
    const { Body } = req.body;
    if (!Body) {
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
      return;
    }

    const { stkCallback } = Body;
    if (!stkCallback) {
      res.json({ ResultCode: 0, ResultDesc: 'Success' });
      return;
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Find the M-Pesa transaction
    const mpesaTx = queryOne(
      'SELECT * FROM mpesa_transactions WHERE checkout_request_id = ? OR merchant_request_id = ?',
      [CheckoutRequestID, MerchantRequestID]
    );

    if (mpesaTx) {
      if (ResultCode === 0) {
        // Success — extract receipt and amount
        const metadata = CallbackMetadata?.Item || [];
        const receipt = metadata.find((m: { Name: string }) => m.Name === 'MpesaReceiptNumber')?.Value;
        const amount = metadata.find((m: { Name: string }) => m.Name === 'Amount')?.Value;

        run(
          'UPDATE mpesa_transactions SET status = "success", result_code = ?, result_desc = ?, mpesa_receipt = ?, updated_at = datetime("now") WHERE id = ?',
          [ResultCode, ResultDesc, receipt, mpesaTx.id]
        );

        // Confirm the deposit and credit admin wallet + user virtual balance
        const deposit = queryOne('SELECT * FROM deposits WHERE user_id = ? AND payment_method = "M-Pesa" AND status = "pending" ORDER BY created_at DESC LIMIT 1', [mpesaTx.user_id]);
        if (deposit) {
          run('UPDATE deposits SET status = "confirmed", mpesa_receipt = ?, updated_at = datetime("now") WHERE id = ?', [receipt, deposit.id]);

          const depositAmount = amount || mpesaTx.amount;

          // 1. Credit admin wallet (real money)
          const adminWallet = queryOne('SELECT id FROM admin_wallets WHERE asset_id = ?', [deposit.asset_id]);
          if (adminWallet) {
            run('UPDATE admin_wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [depositAmount, adminWallet.id]);
          } else {
            run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [deposit.asset_id, depositAmount]);
          }

          // 2. Credit user wallet (virtual balance — user sees this)
          const wallet = queryOne('SELECT id FROM wallets WHERE user_id = ? AND asset_id = ?', [mpesaTx.user_id, deposit.asset_id]);
          if (wallet) {
            run('UPDATE wallets SET balance = balance + ?, updated_at = datetime("now") WHERE id = ?', [depositAmount, wallet.id]);
          } else {
            run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [mpesaTx.user_id, deposit.asset_id, depositAmount]);
          }

          // Log transaction
          const asset = queryOne('SELECT symbol FROM crypto_assets WHERE id = ?', [deposit.asset_id]);
          run(
            'INSERT INTO transactions (user_id, type, amount, asset_symbol, reference_id, description) VALUES (?, ?, ?, ?, ?, ?)',
            [mpesaTx.user_id, 'deposit', depositAmount, asset?.symbol || 'USDT', deposit.reference_id, `M-Pesa deposit confirmed (${receipt}) — funds received in admin wallet`]
          );
        }
      } else {
        // Failed
        run(
          'UPDATE mpesa_transactions SET status = "failed", result_code = ?, result_desc = ?, updated_at = datetime("now") WHERE id = ?',
          [ResultCode, ResultDesc, mpesaTx.id]
        );
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('M-Pesa callback error:', error);
    res.json({ ResultCode: 0, ResultDesc: 'Success' }); // Always return success to Safaricom
  }
});

export default router;
