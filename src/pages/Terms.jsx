import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <>
      <SEO
        title="Terms & Conditions | Cambizzle"
        description="Read Cambizzle's Terms & Conditions. Understand your rights and responsibilities as a user of our marketplace."
        url="/terms"
        image="https://images.unsplash.com/photo-1450101499163-c8917c7b175c?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Terms & <span className="text-[#D6BA69]">Conditions</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Please read our terms carefully before using Cambizzle
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-8">
            
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                Welcome to Cambizzle. These Terms and Conditions govern your use of our website <a href="https://www.cambizzle.com" className="text-[#D6BA69] hover:underline">www.cambizzle.com</a> that connects buyers and sellers. By accessing or using our site, you agree to comply with and be bound by these Terms and Conditions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                If you do not agree with any part of these Terms, you must not use the Site.
              </p>
            </section>

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <p className="text-gray-600 leading-relaxed">
                You must be at least 18 years old to use the Services. By using the Site, you affirm that you are at least 18 years old, or that you have the permission of a parent or guardian to use the Site.
              </p>
            </section>

            {/* 3. Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registration</h2>
              <p className="text-gray-600 leading-relaxed">
                Some parts of the Site may require you to register an account. When registering, you agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account and password, and for all activities under your account.
              </p>
            </section>

            {/* 4. User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>You are responsible for the content you post on the Site. You may not post any material that is illegal, defamatory, offensive, or otherwise violates the rights of others.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>You agree not to engage in any activity that disrupts or interferes with the operation of the Site.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>You are responsible for ensuring that your actions comply with all applicable laws in Cameroon, including data protection and consumer protection laws.</span>
                </li>
              </ul>
            </section>

            {/* 5. Prohibited Activities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Prohibited Activities</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Post illegal or prohibited content, including but not limited to fraud, hate speech, discriminatory material, or content violating intellectual property rights.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Engage in spam, scams, or fraudulent transactions.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Use the Site for any unlawful or unauthorized purposes.</span>
                </li>
              </ul>
            </section>

            {/* 6. Listing and Transactions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Listing and Transactions</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Users may list items for sale, rent, or trade on the Site, subject to compliance with these Terms and applicable laws in Cameroon.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Transactions and communication between users are conducted at their own risk. We do not guarantee the quality, authenticity, or legality of the goods and services listed.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>We recommend users exercise caution and verify the details of any transaction before entering into agreements.</span>
                </li>
              </ul>
            </section>

            {/* 7. Payment and Fees */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment and Fees</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>www.cambizzle.com may charge fees for certain premium listings or services. All fees, if applicable, will be clearly outlined on the Site.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>All payments must be made through approved payment methods. By making a payment, you agree to the payment terms set forth by the payment provider.</span>
                </li>
              </ul>
            </section>

            {/* 8. Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                By using the Site, you consent to the collection and use of your personal information as described in our Privacy Policy.
              </p>
            </section>

            {/* 9. Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Intellectual Property</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>The content, design, and trademarks on the Site are owned by Cambizzle or licensed to us. You may not use, reproduce, or distribute any material from the Site without permission.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Users retain ownership of the content they post but grant www.cambizzle.com a license to use, display, and distribute such content on the Site and other related platforms.</span>
                </li>
              </ul>
            </section>

            {/* 10. Disclaimers and Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers and Limitation of Liability</h2>
              <ul className="space-y-3 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>The Site is provided "as is" and "as available" without warranties of any kind, express or implied.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>We do not guarantee the accuracy, reliability, or completeness of any content on the Site.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>We are not responsible for any losses, damages, or liabilities arising from your use of the Site, including any disputes between users.</span>
                </li>
              </ul>
            </section>

            {/* 11. Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your access to the Site or Services at any time for violating these Terms or engaging in unlawful conduct.
              </p>
            </section>

            {/* 12. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of Cameroon. Any disputes arising under or in connection with these Terms will be subject to the exclusive jurisdiction of the courts in Cameroon.
              </p>
            </section>

            {/* 13. Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify or update these Terms at any time. Any changes will be posted on this page, and the effective date will be updated. You are encouraged to review these Terms periodically.
              </p>
            </section>

            {/* 14. Contact Us */}
            <section className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions or concerns regarding these Terms and Conditions, please contact us at:
              </p>
              <ul className="space-y-2 text-gray-600 ml-6">
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Website: <a href="https://www.cambizzle.com" className="text-[#D6BA69] hover:underline">www.cambizzle.com</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Email: <a href="mailto:info@cambizzle.com" className="text-[#D6BA69] hover:underline">info@cambizzle.com</a></span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#D6BA69]">•</span>
                  <span>Phone: +237678185437</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;
