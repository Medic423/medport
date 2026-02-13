import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { authAPI } from '../../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'ADMIN' | 'USER' | 'HEALTHCARE' | 'EMS';
}

interface HeroSectionProps {
  onLogin: (user: User, token: string) => void;
  onShowRegistration: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onLogin,
  onShowRegistration,
}) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [error]);

  const handleDownloadGuide = () => {
    window.open('/docs/user-guides/get_started_quick_start.md', '_blank');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const response = await authAPI.login(formData);
      if (response.data.success) {
        setError('');
        if (response.data.mustChangePassword === true) {
          try {
            localStorage.setItem('mustChangePassword', 'true');
          } catch {}
        }
        onLogin(response.data.user, response.data.token);
      } else {
        setError(response.data.error || 'Login failed');
      }
    } catch (err: unknown) {
      const res = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { error?: string } } }).response : undefined;
      setError(res?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (error) setError('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section
      id="about"
      className="relative pt-16 pb-8 sm:pt-24 sm:pb-10 overflow-hidden"
      style={{ backgroundColor: '#001872' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Copy and CTAs */}
          <div className="text-center lg:text-left">
            <h1 className="font-serifa text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-6 leading-tight">
              Smarter{' '}
              <span style={{ color: '#ff5700' }}>Planning</span>, Optimized{' '}
              <span style={{ color: '#ff5700' }}>Routes</span>, Better{' '}
              <span style={{ color: '#ff5700' }}>Outcomes</span>.
            </h1>
            <p className="font-inter-tight text-xl mb-6 max-w-xl mx-auto lg:mx-0" style={{ color: 'rgba(255,255,255,0.95)' }}>
              TRACC connects healthcare and transport providers to streamline
              patient transfers and improve outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-white rounded-md shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                style={{ backgroundColor: '#ff5700' }}
              >
                <Download className="mr-2 h-5 w-5" />
                Download Quick Start Guide
              </button>
              <button
                onClick={onShowRegistration}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-inter-tight font-medium text-tracc-primary bg-white hover:bg-tracc-neutral rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
              >
                Create Account
              </button>
            </div>
            <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Step-by-step guide to make your TRACC success.
            </p>
          </div>

          {/* Right: Login card */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 border border-gray-200">
              <h2 className="font-inter-tight text-xl font-semibold text-tracc-primary mb-6">
                Login to TRACC
              </h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="hero-email"
                    className="sr-only"
                  >
                    Email
                  </label>
                  <input
                    id="hero-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-tracc-tertiary/60 bg-tracc-tertiary/30 placeholder:text-gray-500 focus:ring-2 focus:ring-tracc-accent focus:border-tracc-accent focus:outline-none font-inter-tight"
                  />
                </div>
                <div>
                  <label
                    htmlFor="hero-password"
                    className="sr-only"
                  >
                    Password
                  </label>
                  <input
                    id="hero-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-tracc-tertiary/60 bg-tracc-tertiary/30 placeholder:text-gray-500 focus:ring-2 focus:ring-tracc-accent focus:border-tracc-accent focus:outline-none font-inter-tight"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-tracc-gray cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300" />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-tracc-primary-light hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                {error && (
                  <div
                    ref={errorRef}
                    role="alert"
                    className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200"
                  >
                    {error}
                  </div>
                )}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 font-inter-tight font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#ff5700' }}
                  >
                    {loading ? 'Signing in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
