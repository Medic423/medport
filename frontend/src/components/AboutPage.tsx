import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './landing/Navigation';
import Footer from './landing/Footer';

const AboutPage: React.FC = () => {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">About TRACC</h1>
            <p className="text-sm text-gray-500 mb-8">Transport Coordination for Healthcare</p>

            <div className="prose max-w-none space-y-6">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                <p className="text-gray-700">
                  TRACC (Transport Coordination Center) connects healthcare facilities and EMS providers to streamline patient transfers and improve outcomes. Our platform enables smarter planning, optimized routes, and better coordination for medical transport.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Serve</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Hospitals & Health Systems</strong> – Optimize ER facilities and workflow</li>
                  <li><strong>EMS & Transport Providers</strong> – Straightforward routes and trip management</li>
                  <li><strong>Coordinators & Dispatch</strong> – Real-time transfer coordination</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How It Works</h2>
                <p className="text-gray-700 mb-4">
                  Clinicians and coordinators submit transport requests through the TRACC portal. Our system identifies the best available transport provider based on location and needs. Teams receive clear instructions and updates for each patient move.
                </p>
              </section>

              <p className="text-gray-500 text-sm italic mt-8">
                This is a placeholder. Replace with full About content.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AboutPage;
