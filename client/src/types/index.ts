export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
}

export interface Plan {
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

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  is_active: boolean;
}

export interface CryptoPrice {
  symbol: string;
  price_usd: number;
  change_24h: number;
}

export interface Wallet {
  id: string;
  user_id: string;
  asset_id: string;
  balance: number;
  asset?: CryptoAsset;
}

export interface Investment {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  return_amount: number;
  plan?: Plan;
}

export interface Deposit {
  id: string;
  user_id: string;
  asset_id: string;
  amount: number;
  tx_hash: string;
  reference_id: string;
  status: 'pending' | 'confirmed' | 'failed';
  network: string;
  created_at: string;
  asset?: CryptoAsset;
}

export interface Withdrawal {
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
  asset?: CryptoAsset;
}

export interface Transaction {
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

export interface AdminAnalytics {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeInvestments: number;
  totalInvested: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  platformValue: number;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  is_suspended: boolean;
  two_factor_enabled: boolean;
  created_at: string;
}

export interface AdminDeposit extends Deposit {
  user?: { id: string; email: string; firstName: string; lastName: string };
}

export interface AdminWithdrawal extends Withdrawal {
  user?: { id: string; email: string; firstName: string; lastName: string };
}

export interface AdminInvestment extends Investment {
  user?: { id: string; email: string; firstName: string; lastName: string };
}
