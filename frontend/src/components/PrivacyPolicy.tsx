import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: December 8, 2025</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              TraccEMS ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our transportation coordination platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Organization details (healthcare facilities, EMS agencies)</li>
              <li>Phone numbers for SMS notifications</li>
              <li>Location data for service coordination</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">2.2 Usage Information</h3>
            <p className="text-gray-700">
              We automatically collect information about how you use our platform, including trip requests, responses, and system interactions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. SMS Notifications</h2>
            <p className="text-gray-700 mb-4">
              When you opt-in to receive SMS notifications, we will send you text messages regarding:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>New trip requests within your service area</li>
              <li>Trip status updates</li>
              <li>Important system notifications</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Opt-Out:</strong> You can opt-out of SMS notifications at any time by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Unchecking the SMS notifications option in your account settings</li>
              <li>Replying "STOP" to any SMS message</li>
              <li>Contacting us at support@traccems.com</li>
            </ul>
            <p className="text-gray-700">
              Message and data rates may apply. Message frequency varies based on trip activity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Facilitate transportation coordination between healthcare facilities and EMS agencies</li>
              <li>Send SMS notifications for trip requests (with your consent)</li>
              <li>Improve our services and platform functionality</li>
              <li>Comply with legal obligations</li>
              <li>Respond to your inquiries and provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We share your information only as necessary to provide our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>With EMS agencies when you create trip requests</li>
              <li>With healthcare facilities when you respond to trip requests</li>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or to protect rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Access and update your personal information</li>
              <li>Opt-out of SMS notifications at any time</li>
              <li>Request deletion of your account and data</li>
              <li>Object to certain processing of your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-700">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong> support@traccems.com<br />
              <strong>Address:</strong> [Your Business Address]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

