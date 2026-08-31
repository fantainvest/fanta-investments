import { createContext, useContext, useState, type ReactNode } from 'react';

export interface CountryOption {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  paymentMethods: string[];
}

export const COUNTRIES: CountryOption[] = [
  {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    currencySymbol: 'KSh',
    flag: '🇰🇪',
    paymentMethods: ['M-Pesa', 'Airtel Money', 'Card', 'PayPal'],
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USDT',
    currencySymbol: '$',
    flag: '🇺🇸',
    paymentMethods: ['Card', 'PayPal'],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    currencySymbol: '₦',
    flag: '🇳🇬',
    paymentMethods: ['Card', 'PayPal'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
    paymentMethods: ['Card', 'PayPal'],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    currencySymbol: 'R',
    flag: '🇿🇦',
    paymentMethods: ['Card', 'PayPal'],
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    currencySymbol: 'TSh',
    flag: '🇹🇿',
    paymentMethods: ['M-Pesa', 'Airtel Money', 'Card'],
  },
  {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    currencySymbol: 'USh',
    flag: '🇺🇬',
    paymentMethods: ['M-Pesa', 'Airtel Money', 'Card'],
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    currencySymbol: '₹',
    flag: '🇮🇳',
    paymentMethods: ['Card', 'PayPal'],
  },
];

interface CurrencyContextType {
  country: CountryOption;
  setCountry: (c: CountryOption) => void;
  formatAmount: (amount: number, currency?: string, isLocal?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Exchange rates (approximate, for demo)
const RATES: Record<string, number> = {
  KES: 153.5,
  NGN: 1540,
  GBP: 0.79,
  ZAR: 18.2,
  TZS: 2510,
  UGX: 3780,
  INR: 83.5,
  USDT: 1,
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<CountryOption>(COUNTRIES[0]); // Default Kenya

  const formatAmount = (amount: number, overrideCurrency?: string, isLocal?: boolean): string => {
    const cur = overrideCurrency || country.currency;
    const sym = COUNTRIES.find((c) => c.currency === cur)?.currencySymbol || '$';

    // If isLocal is true, the amount is already in the target currency (e.g., KES amounts stored directly)
    if (isLocal) {
      return `${sym}${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }

    if (cur === 'USDT') {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    const rate = RATES[cur] || 1;
    const localAmount = amount * rate;

    return `${sym}${localAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <CurrencyContext.Provider value={{ country, setCountry, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
