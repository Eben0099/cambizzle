import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { CheckCircle, Users, Globe, Zap } from 'lucide-react';

const About = () => {
  return (
    <>
      <SEO
        title="About Cambizzle | Trusted Marketplace in Cameroon"
        description="Learn about Cambizzle, Cameroon's premier peer-to-peer marketplace. Connect with buyers and sellers securely and easily."
        url="/about"
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              About <span className="text-[#D6BA69]">Cambizzle</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              Cameroon's trusted peer-to-peer marketplace
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Introduction */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Cambizzle is a Cameroon-based online marketplace dedicated to simplifying the way people buy and sell goods and services. We connect sellers and buyers in a seamless digital environment, making commerce more accessible, efficient, and rewarding for everyone involved.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To empower sellers by providing a platform that makes it easy to showcase and distribute their products and services to a broader audience. At the same time, we offer buyers a user-friendly experience that grants instant access to a diverse range of quality offerings—saving time and effort.
              </p>
            </div>
          </section>

          {/* Our Vision */}
          <section className="mb-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our ambition goes beyond national borders. We aim to expand Cambizzle across Africa, delivering a consistent standard of service that prioritizes customer satisfaction, quality assurance, and community trust.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                At Cambizzle, we believe in the power of technology to transform lives. We are committed to building a marketplace that creates opportunities, supports growth, and drives innovation. For us, failure is not an option—only progress and impact.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-black to-gray-900 text-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-gray-300 mb-8">
              Join thousands of users already buying and selling on Cambizzle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-[#D6BA69] text-black font-semibold px-8 py-3 rounded-lg hover:bg-[#e8d087] transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/"
                className="inline-block bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          </section>

          {/* Additional Info */}
          <section className="mt-16">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Have Questions?</h2>
              <p className="text-gray-600 mb-6">
                For more information or support, please contact us at{' '}
                <a href="mailto:info@cambizzle.com" className="text-[#D6BA69] hover:underline">
                  info@cambizzle.com
                </a>
              </p>
              <p className="text-gray-600">
                Be sure to read our <Link to="/terms" className="text-[#D6BA69] hover:underline">Terms & Conditions</Link> and <Link to="/safety-tips" className="text-[#D6BA69] hover:underline">Safety Tips</Link> for more information.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default About;
