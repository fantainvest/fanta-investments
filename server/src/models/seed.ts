import bcrypt from 'bcrypt';
import { getDb, run, queryOne } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

export async function seedDatabase(): Promise<void> {
  const db = getDb();
  const schemaPath = path.resolve(__dirname, './schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema (CREATE TABLE IF NOT EXISTS is safe to run multiple times)
  db.exec(schema);

  // 1. Seed crypto assets FIRST (others reference these)
  const assetsExist = queryOne('SELECT id FROM crypto_assets LIMIT 1');
  if (!assetsExist) {
    const assets = [
      ['BTC', 'Bitcoin', 'bitcoin'],
      ['ETH', 'Ethereum', 'ethereum'],
      ['USDT', 'Tether', 'tether'],
      ['SOL', 'Solana', 'solana'],
      ['BNB', 'BNB', 'binancecoin'],
      ['XRP', 'Ripple', 'ripple'],
      ['ADA', 'Cardano', 'cardano'],
      ['DOT', 'Polkadot', 'polkadot'],
    ];
    for (const a of assets) {
      run('INSERT INTO crypto_assets (symbol, name, coingecko_id) VALUES (?, ?, ?)', a);
    }
    console.log('✅ Crypto assets seeded');
  }

  // 2. Seed investment plans
  const plansExist = queryOne('SELECT id FROM investment_plans LIMIT 1');
  if (!plansExist) {
    const plans = [
      ['Starter', 'starter', 'Perfect for beginners. Start with just 199 KES. Conservative crypto allocation with lower risk exposure.', 199, 599, 14, 2.0, 'low', 5, 12],
      ['Growth', 'growth', 'Balanced portfolio with moderate risk for steady growth potential. Ideal for regular investors.', 599, 4999, 30, 2.5, 'medium', 10, 25],
      ['Premium', 'premium', 'Aggressive strategy targeting high-growth tokens and DeFi yields. For experienced investors.', 4999, 9999, 60, 3.0, 'high', 15, 40],
      ['Gold', 'gold', 'High-yield portfolio with diversified crypto assets. Serious returns for serious investors.', 9999, 49999, 90, 2.5, 'high', 20, 50],
      ['Platinum', 'platinum', 'Elite tier with dedicated portfolio management. Maximum exposure to high-growth opportunities.', 49999, 499999, 180, 1.5, 'very_high', 25, 65],
    ];
    for (const p of plans) {
      run(
        'INSERT INTO investment_plans (name, slug, description, min_investment, max_investment, duration_days, fee_percentage, risk_level, expected_return_min, expected_return_max) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        p
      );
    }
    console.log('✅ Investment plans seeded');
  }

  // 3. Seed admin user
  const adminExists = queryOne('SELECT id FROM users WHERE email = ?', ['admin@fanta.io']);
  if (!adminExists) {
    const hash = await bcrypt.hash('admin@fanta.io', 10);
    run(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, country_code) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['admin@fanta.io', hash, 'Admin', 'User', 'admin', 1, 'KE']
    );
    console.log('✅ Admin user created: admin@fanta.io / admin@fanta.io');
  }

  // 4. Seed demo user with wallets, admin wallet, investments, deposits, withdrawals
  const demoExists = queryOne('SELECT id FROM users WHERE email = ?', ['demo@fanta.io']);
  if (!demoExists) {
    const hash = await bcrypt.hash('password123', 10);
    const result = run(
      'INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, country_code, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['demo@fanta.io', hash, 'Demo', 'Investor', 'user', 1, 'KE', '+254712345678']
    );
    const userId = result.lastInsertRowid;

    // Get asset IDs (assets already exist at this point)
    const usdtAsset = queryOne('SELECT id FROM crypto_assets WHERE symbol = ?', ['USDT']);
    const btcAsset = queryOne('SELECT id FROM crypto_assets WHERE symbol = ?', ['BTC']);
    const ethAsset = queryOne('SELECT id FROM crypto_assets WHERE symbol = ?', ['ETH']);
    const solAsset = queryOne('SELECT id FROM crypto_assets WHERE symbol = ?', ['SOL']);

    // User virtual wallets (user sees these numbers)
    if (usdtAsset) run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [userId, usdtAsset.id, 2500]);
    if (btcAsset) run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [userId, btcAsset.id, 0.245]);
    if (ethAsset) run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [userId, ethAsset.id, 3.75]);
    if (solAsset) run('INSERT INTO wallets (user_id, asset_id, balance) VALUES (?, ?, ?)', [userId, solAsset.id, 45]);

    // Admin wallet (real money from deposits)
    if (usdtAsset) run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [usdtAsset.id, 2500]);
    if (btcAsset) run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [btcAsset.id, 0.245]);
    if (ethAsset) run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [ethAsset.id, 3.75]);
    if (solAsset) run('INSERT INTO admin_wallets (asset_id, balance) VALUES (?, ?)', [solAsset.id, 45]);

    // Investments (money already with admin)
    const growthPlan = queryOne('SELECT id FROM investment_plans WHERE slug = ?', ['growth']);
    const premiumPlan = queryOne('SELECT id FROM investment_plans WHERE slug = ?', ['premium']);

    if (growthPlan) {
      run(
        'INSERT INTO investments (user_id, plan_id, amount, status, start_date, end_date, return_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, growthPlan.id, 5000, 'active', '2025-08-01', '2025-09-30', 620]
      );
    }
    if (premiumPlan) {
      run(
        'INSERT INTO investments (user_id, plan_id, amount, status, start_date, end_date, return_amount) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, premiumPlan.id, 15000, 'active', '2025-07-15', '2025-10-13', 3200]
      );
    }

    // Deposits (confirmed — money in admin wallet)
    if (usdtAsset) {
      run(
        'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, network) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, usdtAsset.id, 5000, 'DEP-2025-001', 'confirmed', 'M-Pesa', 'M-Pesa']
      );
    }
    if (btcAsset) {
      run(
        'INSERT INTO deposits (user_id, asset_id, amount, reference_id, status, payment_method, network) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, btcAsset.id, 0.5, 'DEP-2025-002', 'confirmed', 'Card', 'Card']
      );
    }

    // Withdrawal (pending — admin will process)
    if (usdtAsset) {
      run(
        'INSERT INTO withdrawals (user_id, asset_id, amount, wallet_address, network, reference_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, usdtAsset.id, 200, '0x1234...abcd', 'ERC-20', 'WD-2025-001', 'pending']
      );
    }

    console.log('✅ Demo user created: demo@fanta.io / password123');
  }
}
