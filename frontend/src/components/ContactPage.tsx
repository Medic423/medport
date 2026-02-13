import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './landing/Navigation';
import Footer from './landing/Footer';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-16">
        <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-tracc-primary hover:underline mb-6"
            >
              ← Back to Home
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
            <p className="text-sm text-gray-500 mb-8">Get in touch with the TRACC team</p>

            <div className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">General Inquiries</h2>
                <p className="text-gray-700 mb-4">
                  For general questions about TRACC or our services, please reach out:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li><strong>Email:</strong> support@traccems.com</li>
                  <li><strong>Website:</strong> traccems.com</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Support</h2>
                <p className="text-gray-700">
                  Existing customers can access support through their dashboard or contact their account manager.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sales</h2>
                <p className="text-gray-700">
                  Interested in TRACC for your organization? Visit our <button onClick={() => navigate('/pricing')} className="text-tracc-primary hover:underline font-medium">Pricing</button> page or create an account to get started.
                </p>
              </section>

              <p className="text-gray-500 text-sm italic mt-8">
                This is a placeholder. Replace with full Contact content and form.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default ContactPage;
