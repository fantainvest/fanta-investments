export default function FantaSoda({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-fanta-500/20 rounded-full blur-3xl scale-150" />

      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-2xl relative z-10" xmlns="http://www.w3.org/2000/svg">
        {/* Can body */}
        <defs>
          <linearGradient id="canBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#C2410C" />
            <stop offset="25%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="75%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="canTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5E7EB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
          <linearGradient id="canBottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#6B7280" />
          </linearGradient>
          <radialGradient id="shine" cx="0.3" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Can top rim */}
        <ellipse cx="100" cy="45" rx="55" ry="12" fill="url(#canTop)" stroke="#D1D5DB" strokeWidth="1" />

        {/* Can body */}
        <rect x="45" y="45" width="110" height="300" rx="4" fill="url(#canBody)" />

        {/* White wave/stripe pattern */}
        <path d="M45 120 Q100 100 155 120 Q100 140 45 120 Z" fill="white" opacity="0.9" />
        <path d="M45 180 Q100 160 155 180 Q100 200 45 180 Z" fill="white" opacity="0.9" />
        <path d="M45 240 Q100 220 155 240 Q100 260 45 240 Z" fill="white" opacity="0.9" />

        {/* Green accent band */}
        <rect x="45" y="145" width="110" height="35" fill="#15803d" opacity="0.9" />
        <rect x="45" y="205" width="110" height="35" fill="#15803d" opacity="0.9" />

        {/* "FANTA" text */}
        <text x="100" y="175" textAnchor="middle" fontFamily="Arial Black, Impact, sans-serif" fontWeight="900" fontSize="28" fill="white" letterSpacing="2">FANTA</text>

        {/* Orange slice icon */}
        <circle cx="100" cy="290" r="22" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
        <path d="M100 272 L95 285 L105 285 Z" fill="white" opacity="0.6" />
        <path d="M100 272 L88 292 L100 288 Z" fill="white" opacity="0.4" />
        <path d="M100 272 L112 292 L100 288 Z" fill="white" opacity="0.4" />

        {/* Shine effect */}
        <rect x="45" y="45" width="110" height="300" rx="4" fill="url(#shine)" />

        {/* Can bottom rim */}
        <ellipse cx="100" cy="345" rx="55" ry="12" fill="url(#canBottom)" stroke="#6B7280" strokeWidth="1" />

        {/* Pull tab */}
        <ellipse cx="100" cy="38" rx="15" ry="5" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1" />
        <rect x="92" y="30" width="16" height="10" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5" />

        {/* Water droplets */}
        <circle cx="65" cy="100" r="3" fill="white" opacity="0.6" />
        <circle cx="135" cy="150" r="2.5" fill="white" opacity="0.5" />
        <circle cx="70" cy="250" r="2" fill="white" opacity="0.4" />
        <circle cx="140" cy="280" r="3.5" fill="white" opacity="0.5" />
      </svg>
    </div>
  );
}

export function FantaCanSmall({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 120" className={`${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="canBodySm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C2410C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="14" rx="17" ry="4" fill="#D1D5DB" />
      <rect x="13" y="14" width="34" height="90" rx="2" fill="url(#canBodySm)" />
      <path d="M13 38 Q30 30 47 38 Q30 46 13 38 Z" fill="white" opacity="0.9" />
      <path d="M13 58 Q30 50 47 58 Q30 66 13 58 Z" fill="white" opacity="0.9" />
      <rect x="13" y="46" width="34" height="10" fill="#15803d" opacity="0.9" />
      <text x="30" y="54" textAnchor="middle" fontFamily="Arial Black" fontWeight="900" fontSize="8" fill="white">FANTA</text>
      <ellipse cx="30" cy="104" rx="17" ry="4" fill="#6B7280" />
    </svg>
  );
}
