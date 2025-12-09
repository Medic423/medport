import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: December 8, 2025</p>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using the TraccEMS platform ("Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700">
              TraccEMS is a transportation coordination platform that connects healthcare facilities with EMS agencies to facilitate patient transport requests. The Service enables:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Healthcare facilities to create and manage transport requests</li>
              <li>EMS agencies to receive notifications and respond to transport requests</li>
              <li>Coordination of transportation services through SMS notifications and platform messaging</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Registration</h3>
            <p className="text-gray-700 mb-4">
              To use the Service, you must register for an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Account Types</h3>
            <p className="text-gray-700">
              The Service supports different account types (Healthcare Facilities, EMS Agencies, Administrators) with varying access levels and permissions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. SMS Notifications</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.1 Opt-In</h3>
            <p className="text-gray-700 mb-4">
              By opting in to SMS notifications, you consent to receive text messages regarding trip requests and platform notifications. You can opt-in through your account settings.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.2 Opt-Out</h3>
            <p className="text-gray-700 mb-4">
              You may opt-out of SMS notifications at any time by:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Unchecking the SMS notifications option in your account settings</li>
              <li>Replying "STOP" to any SMS message</li>
              <li>Contacting customer support</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-2">4.3 Message Frequency</h3>
            <p className="text-gray-700">
              Message frequency varies based on trip activity in your service area. Standard message and data rates may apply.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
            <p className="text-gray-700 mb-4">You agree to:</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
              <li>Provide accurate and current information</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Maintain the security of your account</li>
              <li>Not share your account credentials with others</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Service Availability</h2>
            <p className="text-gray-700">
              We strive to maintain Service availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700">
              TraccEMS provides a coordination platform and is not responsible for the actual transportation services provided by EMS agencies. We are not liable for any damages arising from the use or inability to use the Service, including but not limited to transportation delays or service failures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold TraccEMS harmless from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these Terms at any time. We will notify users of material changes. Continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700">
              We may suspend or terminate your account at any time for violation of these Terms or for any other reason. You may terminate your account at any time through your account settings or by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700">
              These Terms shall be governed by and construed in accordance with the laws of [Your State/Country], without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong> support@traccems.com<br />
              <strong>Address:</strong> [Your Business Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

