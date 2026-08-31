import FantaLogo from '../components/FantaLogo';

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FantaLogo size={40} />
        <h1 className="text-3xl font-black">Privacy Policy</h1>
      </div>
      <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
        <p><strong>Last updated:</strong> January 1, 2025</p>

        <h2 className="text-xl font-bold text-white mt-8">1. Information We Collect</h2>
        <p>We collect information you provide directly: name, email address, phone number (for mobile money), and account preferences. We also collect usage data.</p>

        <h2 className="text-xl font-bold text-white mt-8">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>To provide and maintain our services</li>
          <li>To process deposits and withdrawals</li>
          <li>To communicate with you about your account</li>
          <li>To improve the Platform and user experience</li>
        </ul>

        <h2 className="text-xl font-bold text-white mt-8">3. Data Security</h2>
        <p>We implement industry-standard security measures. Passwords are hashed using bcrypt. We never store private cryptocurrency keys or payment card details.</p>

        <h2 className="text-xl font-bold text-white mt-8">4. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data. Contact us at <strong className="text-fanta-400">privacy@fanta.io</strong>.</p>

        <h2 className="text-xl font-bold text-white mt-8">5. Contact</h2>
        <p>For privacy inquiries, contact <strong className="text-fanta-400">privacy@fanta.io</strong>.</p>
      </div>
    </div>
  );
}
