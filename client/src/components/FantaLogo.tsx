export default function FantaLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Orange circle background */}
      <circle cx="50" cy="50" r="48" fill="#EA580C" />
      <circle cx="50" cy="50" r="42" fill="#F97316" />
      {/* F letter */}
      <text x="50" y="68" textAnchor="middle" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="52" fill="white" letterSpacing="-2">F</text>
      {/* Small bubble accents */}
      <circle cx="28" cy="28" r="5" fill="white" opacity="0.3" />
      <circle cx="72" cy="24" r="3" fill="white" opacity="0.25" />
      <circle cx="76" cy="38" r="4" fill="white" opacity="0.2" />
    </svg>
  );
}

export function FantaText({ className = '' }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      <span className="text-fanta-500">F</span>
      <span className="text-white">anta</span>
    </span>
  );
}
