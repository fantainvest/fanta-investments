import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, COUNTRIES, type CountryOption } from '../contexts/CurrencyContext';

export default function CurrencySelector() {
  const { country, setCountry } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (c: CountryOption) => {
    setCountry(c);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm hover:border-fanta-600/50 transition-colors"
      >
        <span className="text-lg">{country.flag}</span>
        <span className="font-medium">{country.currency}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 w-56 z-50">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => handleSelect(c)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors ${c.code === country.code ? 'bg-gray-750 text-fanta-400' : 'text-gray-300'}`}
            >
              <span className="text-lg">{c.flag}</span>
              <div className="text-left">
                <p className="font-medium">{c.name}</p>
                <p className="text-gray-500 text-xs">{c.currency} ({c.currencySymbol})</p>
              </div>
              {c.code === country.code && <span className="ml-auto text-fanta-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
