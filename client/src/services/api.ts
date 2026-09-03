const BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Auth ──
export const auth = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; countryCode?: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<any>('/auth/me'),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

// ── Plans ──
export const plans = {
  list: () => request<any[]>('/plans'),
  getBySlug: (slug: string) => request<any>(`/plans/${slug}`),
};

// ── Investments ──
export const investments = {
  list: () => request<any[]>('/investments'),
  create: (data: { planId: number; amount: number }) =>
    request<any>('/investments', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Wallets ──
export const wallets = {
  list: () => request<{ wallets: any[]; summary: { totalBalance: number; totalDeposited: number; totalWithdrawn: number; totalInvested: number; totalReturns: number } }>('/wallets'),
};

// ── Deposits ──
export const deposits = {
  list: () => request<any[]>('/deposits'),
  create: (data: { assetId: number; amount: number; network: string; paymentMethod?: string; phoneNumber?: string }) =>
    request<any>('/deposits', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Withdrawals ──
export const withdrawals = {
  list: () => request<any[]>('/withdrawals'),
  create: (data: { assetId: number; amount: number; walletAddress: string; network: string }) =>
    request<any>('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Crypto ──
export const crypto = {
  prices: () => request<any[]>('/crypto/prices'),
  assets: () => request<any[]>('/crypto/assets'),
};

// ── Admin ──
export const admin = {
  analytics: () => request<any>('/admin/analytics'),
  users: () => request<any[]>('/admin/users'),
  verifyUser: (id: string) => request<any>(`/admin/users/${id}/verify`, { method: 'PATCH' }),
  suspendUser: (id: string) => request<any>(`/admin/users/${id}/suspend`, { method: 'PATCH' }),
  deposits: () => request<any[]>('/admin/deposits'),
  updateDepositStatus: (id: string, status: string) =>
    request<any>(`/admin/deposits/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  withdrawals: () => request<any[]>('/admin/withdrawals'),
  updateWithdrawalStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/admin/withdrawals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  investments: () => request<any[]>('/admin/investments'),
  transactions: () => request<any[]>('/admin/transactions'),
  plans: () => request<any[]>('/admin/plans'),
  userWallets: () => request<any[]>('/admin/user-wallets'),
  adminWallet: () => request<any[]>('/admin/admin-wallet'),
  adminWalletWithdraw: (data: { assetId: string; amount: number; walletAddress: string; network: string; notes?: string }) =>
    request<any>('/admin/admin-wallet/withdraw', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Activity Feed ──
export const activity = {
  feed: (page: number = 1, limit: number = 50) =>
    request<{ activities: any[]; total: number; page: number; limit: number; totalPages: number }>(
      `/activity/feed?page=${page}&limit=${limit}`
    ),
};

// ── Content ──
export const content = {
  getAll: () => request<Record<string, string>>('/content'),
};
