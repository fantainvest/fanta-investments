import { v4 as uuid } from 'uuid';

// ── Users ──
export interface MockUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  is_suspended: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    email: 'admin@fanta.io',
    password_hash: '$2b$10$placeholder-admin-hash',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    is_verified: true,
    is_suspended: false,
    two_factor_enabled: false,
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    email: 'demo@fanta.io',
    password_hash: '$2b$10$placeholder-demo-hash',
    first_name: 'Demo',
    last_name: 'Investor',
    role: 'user',
    is_verified: true,
    is_suspended: false,
    two_factor_enabled: false,
    created_at: '2025-06-15T10:30:00Z',
  },
  {
    id: 'u3',
    email: 'jane@example.com',
    password_hash: '$2b$10$placeholder-jane-hash',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'user',
    is_verified: true,
    is_suspended: false,
    two_factor_enabled: true,
    created_at: '2025-07-01T08:00:00Z',
  },
];

// ── Investment Plans ──
export interface MockPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  min_investment: number;
  max_investment: number;
  duration_days: number;
  fee_percentage: number;
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  expected_return_min: number;
  expected_return_max: number;
  is_active: boolean;
}

export const mockPlans: MockPlan[] = [
  {
    id: 'p1',
    name: 'Starter',
    slug: 'starter',
    description: 'Perfect for beginners. Conservative crypto allocation with lower risk exposure.',
    min_investment: 100,
    max_investment: 5000,
    duration_days: 30,
    fee_percentage: 2.0,
    risk_level: 'low',
    expected_return_min: 3,
    expected_return_max: 8,
    is_active: true,
  },
  {
    id: 'p2',
    name: 'Growth',
    slug: 'growth',
    description: 'Balanced portfolio with moderate risk for steady growth potential.',
    min_investment: 1000,
    max_investment: 25000,
    duration_days: 60,
    fee_percentage: 2.5,
    risk_level: 'medium',
    expected_return_min: 8,
    expected_return_max: 18,
    is_active: true,
  },
  {
    id: 'p3',
    name: 'Premium',
    slug: 'premium',
    description: 'Aggressive strategy targeting high-growth tokens and DeFi yields.',
    min_investment: 5000,
    max_investment: 100000,
    duration_days: 90,
    fee_percentage: 3.0,
    risk_level: 'high',
    expected_return_min: 15,
    expected_return_max: 35,
    is_active: true,
  },
  {
    id: 'p4',
    name: 'Institutional',
    slug: 'institutional',
    description: 'Tailored strategies for large capital. Dedicated account management.',
    min_investment: 50000,
    max_investment: 1000000,
    duration_days: 180,
    fee_percentage: 1.5,
    risk_level: 'high',
    expected_return_min: 20,
    expected_return_max: 50,
    is_active: true,
  },
];

// ── Crypto Assets ──
export interface MockAsset {
  id: string;
  symbol: string;
  name: string;
  is_active: boolean;
}

export const mockAssets: MockAsset[] = [
  { id: 'a1', symbol: 'BTC', name: 'Bitcoin', is_active: true },
  { id: 'a2', symbol: 'ETH', name: 'Ethereum', is_active: true },
  { id: 'a3', symbol: 'USDT', name: 'Tether', is_active: true },
  { id: 'a4', symbol: 'SOL', name: 'Solana', is_active: true },
  { id: 'a5', symbol: 'BNB', name: 'BNB', is_active: true },
  { id: 'a6', symbol: 'XRP', name: 'Ripple', is_active: true },
  { id: 'a7', symbol: 'ADA', name: 'Cardano', is_active: true },
  { id: 'a8', symbol: 'DOT', name: 'Polkadot', is_active: true },
];

// ── Wallets (demo user u2) ──
export interface MockWallet {
  id: string;
  user_id: string;
  asset_id: string;
  balance: number;
}

export const mockWallets: MockWallet[] = [
  { id: 'w1', user_id: 'u2', asset_id: 'a1', balance: 0.245 },
  { id: 'w2', user_id: 'u2', asset_id: 'a2', balance: 3.75 },
  { id: 'w3', user_id: 'u2', asset_id: 'a3', balance: 2500 },
  { id: 'w4', user_id: 'u2', asset_id: 'a4', balance: 45 },
  { id: 'w5', user_id: 'u3', asset_id: 'a1', balance: 1.1 },
  { id: 'w6', user_id: 'u3', asset_id: 'a2', balance: 12.5 },
];

// ── Investments ──
export interface MockInvestment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  return_amount: number;
}

export const mockInvestments: MockInvestment[] = [
  {
    id: 'i1',
    user_id: 'u2',
    plan_id: 'p2',
    amount: 5000,
    status: 'active',
    start_date: '2025-08-01T00:00:00Z',
    end_date: '2025-09-30T00:00:00Z',
    return_amount: 620,
  },
  {
    id: 'i2',
    user_id: 'u2',
    plan_id: 'p1',
    amount: 1000,
    status: 'completed',
    start_date: '2025-06-01T00:00:00Z',
    end_date: '2025-07-01T00:00:00Z',
    return_amount: 155,
  },
  {
    id: 'i3',
    user_id: 'u2',
    plan_id: 'p3',
    amount: 15000,
    status: 'active',
    start_date: '2025-07-15T00:00:00Z',
    end_date: '2025-10-13T00:00:00Z',
    return_amount: 3200,
  },
  {
    id: 'i4',
    user_id: 'u3',
    plan_id: 'p2',
    amount: 8000,
    status: 'active',
    start_date: '2025-08-10T00:00:00Z',
    end_date: '2025-10-09T00:00:00Z',
    return_amount: 980,
  },
];

// ── Deposits ──
export interface MockDeposit {
  id: string;
  user_id: string;
  asset_id: string;
  amount: number;
  tx_hash: string;
  reference_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  created_at: string;
}

export const mockDeposits: MockDeposit[] = [
  {
    id: 'd1',
    user_id: 'u2',
    asset_id: 'a3',
    amount: 5000,
    tx_hash: '0xabc123...demo',
    reference_id: 'DEP-2025-001',
    status: 'confirmed',
    network: 'ERC-20',
    created_at: '2025-08-01T09:00:00Z',
  },
  {
    id: 'd2',
    user_id: 'u2',
    asset_id: 'a1',
    amount: 0.5,
    tx_hash: '0xdef456...demo',
    reference_id: 'DEP-2025-002',
    status: 'confirmed',
    network: 'Bitcoin',
    created_at: '2025-07-15T14:30:00Z',
  },
  {
    id: 'd3',
    user_id: 'u3',
    asset_id: 'a2',
    amount: 12,
    tx_hash: '0xghi789...demo',
    reference_id: 'DEP-2025-003',
    status: 'pending',
    network: 'ERC-20',
    created_at: '2025-08-28T11:00:00Z',
  },
];

// ── Withdrawals ──
export interface MockWithdrawal {
  id: string;
  user_id: string;
  asset_id: string;
  amount: number;
  wallet_address: string;
  network: string;
  tx_hash: string | null;
  reference_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  admin_notes: string | null;
  created_at: string;
}

export const mockWithdrawals: MockWithdrawal[] = [
  {
    id: 'wd1',
    user_id: 'u2',
    asset_id: 'a3',
    amount: 200,
    wallet_address: '0x1234...abcd',
    network: 'ERC-20',
    tx_hash: '0xwd1demo',
    reference_id: 'WD-2025-001',
    status: 'completed',
    admin_notes: null,
    created_at: '2025-08-10T16:00:00Z',
  },
  {
    id: 'wd2',
    user_id: 'u2',
    asset_id: 'a1',
    amount: 0.05,
    wallet_address: 'bc1q...xyz',
    network: 'Bitcoin',
    tx_hash: null,
    reference_id: 'WD-2025-002',
    status: 'pending',
    admin_notes: null,
    created_at: '2025-08-29T08:00:00Z',
  },
];

// ── Transactions (audit trail) ──
export interface MockTransaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  asset_symbol: string;
  reference_id: string;
  status: string;
  description: string;
  created_at: string;
}

export const mockTransactions: MockTransaction[] = [
  { id: 't1', user_id: 'u2', type: 'deposit', amount: 5000, asset_symbol: 'USDT', reference_id: 'DEP-2025-001', status: 'completed', description: 'USDT deposit via ERC-20', created_at: '2025-08-01T09:00:00Z' },
  { id: 't2', user_id: 'u2', type: 'investment', amount: 5000, asset_symbol: 'USDT', reference_id: 'INV-2025-001', status: 'completed', description: 'Invested in Growth plan', created_at: '2025-08-01T10:00:00Z' },
  { id: 't3', user_id: 'u2', type: 'deposit', amount: 0.5, asset_symbol: 'BTC', reference_id: 'DEP-2025-002', status: 'completed', description: 'BTC deposit via Bitcoin network', created_at: '2025-07-15T14:30:00Z' },
  { id: 't4', user_id: 'u2', type: 'investment', amount: 15000, asset_symbol: 'USDT', reference_id: 'INV-2025-003', status: 'completed', description: 'Invested in Premium plan', created_at: '2025-07-15T15:00:00Z' },
  { id: 't5', user_id: 'u2', type: 'withdrawal', amount: 200, asset_symbol: 'USDT', reference_id: 'WD-2025-001', status: 'completed', description: 'USDT withdrawal', created_at: '2025-08-10T16:00:00Z' },
  { id: 't6', user_id: 'u2', type: 'return', amount: 155, asset_symbol: 'USDT', reference_id: 'RET-2025-001', status: 'completed', description: 'Returns from Starter plan', created_at: '2025-07-01T00:00:00Z' },
  { id: 't7', user_id: 'u2', type: 'investment', amount: 1000, asset_symbol: 'USDT', reference_id: 'INV-2025-002', status: 'completed', description: 'Invested in Starter plan', created_at: '2025-06-01T00:00:00Z' },
];

// ── Site Content ──
export interface MockSiteContent {
  key: string;
  value: string;
}

export const mockSiteContent: MockSiteContent[] = [
  { key: 'site_name', value: 'Fanta Investments' },
  { key: 'site_tagline', value: 'Smart Crypto Investing' },
  { key: 'hero_title', value: 'Invest in the Future of Finance' },
  { key: 'hero_subtitle', value: 'Access diversified crypto investment strategies designed for every risk profile.' },
];

// ── Crypto prices (simulated) ──
export interface MockPrice {
  symbol: string;
  price_usd: number;
  change_24h: number;
}

export const mockPrices: MockPrice[] = [
  { symbol: 'BTC', price_usd: 112450.80, change_24h: 2.34 },
  { symbol: 'ETH', price_usd: 4520.15, change_24h: 1.87 },
  { symbol: 'USDT', price_usd: 1.00, change_24h: 0.01 },
  { symbol: 'SOL', price_usd: 198.45, change_24h: 4.12 },
  { symbol: 'BNB', price_usd: 685.30, change_24h: -0.55 },
  { symbol: 'XRP', price_usd: 2.87, change_24h: 3.21 },
  { symbol: 'ADA', price_usd: 0.92, change_24h: -1.23 },
  { symbol: 'DOT', price_usd: 9.45, change_24h: 1.10 },
];
