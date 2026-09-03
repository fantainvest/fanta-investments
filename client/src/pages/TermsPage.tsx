import FantaLogo from '../components/FantaLogo';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FantaLogo size={40} />
        <h1 className="text-3xl font-black">Terms of Service</h1>
      </div>
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> January 1, 2025</p>

        <h2 className="text-xl font-bold text-white mt-8">1. Acceptance of Terms</h2>
        <p>By accessing or using Fanta Investments ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>

        <h2 className="text-xl font-bold text-white mt-8">2. Description of Service</h2>
        <p>Fanta Investments is a cryptocurrency investment platform that provides users with tools to invest in digital assets through various investment plans. The Platform currently operates in demo/simulation mode with simulated transactions.</p>

        <h2 className="text-xl font-bold text-white mt-8">3. Eligibility</h2>
        <p>You must be at least 18 years of age and have the legal capacity to enter into binding agreements in your jurisdiction to use this Platform.</p>

        <h2 className="text-xl font-bold text-white mt-8">4. Account Registration</h2>
        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree to provide accurate and complete information during registration.</p>

        <h2 className="text-xl font-bold text-white mt-8">5. Investment Risks</h2>
        <p>Cryptocurrency investments carry significant risk, including the potential loss of your entire investment. Expected return ranges displayed on the Platform are illustrative only and do not constitute guarantees. Past performance is not indicative of future results.</p>

        <h2 className="text-xl font-bold text-white mt-8">6. Payment Methods</h2>
        <p>The Platform supports deposits and withdrawals via Crypto Transfer (direct to wallet), Airtel Money, Card (Visa/Mastercard via Stripe), and PayPal, depending on your selected country. Processing times and fees may vary by method.</p>

        <h2 className="text-xl font-bold text-white mt-8">7. Fees</h2>
        <p>The Platform charges fees as outlined in each investment plan. Fees are deducted from investment returns and are clearly displayed before you confirm any investment.</p>

        <h2 className="text-xl font-bold text-white mt-8">8. Prohibited Activities</h2>
        <p>You may not use the Platform for any unlawful purpose, attempt to manipulate markets, engage in money laundering, or violate any applicable laws or regulations.</p>

        <h2 className="text-xl font-bold text-white mt-8">9. Limitation of Liability</h2>
        <p>Fanta Investments shall not be liable for any losses arising from market fluctuations, system failures, or circumstances beyond our reasonable control.</p>

        <h2 className="text-xl font-bold text-white mt-8">10. Contact</h2>
        <p>For questions about these Terms, contact us at <strong className="text-fanta-400">legal@fanta.io</strong>.</p>
      </div>
    </div>
  );
}
