import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { authAPI } from '../../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  userType: 'SYSTEM_ADMIN' | 'HEALTHCARE_ORGANIZATION_USER' | 'EMS_ORGANIZATION_USER';
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
      className="relative pt-16 pb-8 sm:pt-24 sm:pb-10 overflow-hidden min-h-[50vh] lg:min-h-[70vh]"
      style={{ backgroundColor: '#001872' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid with items-end so login card bottom aligns with buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
          {/* Left: Copy and CTAs (headline, subheadline, buttons) */}
          <div className="text-center lg:text-left">
            {/* 2.2 Headline: Serifa 80px Medium; Planning/Routes/Outcomes white; punctuation #FF5700 */}
            <h1
              className="font-serifa font-medium text-white mb-6"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 56px)',
                lineHeight: '1.15',
              }}
            >
              Smarter{' '}
              <span style={{ color: '#FFFFFF' }}>Planning</span><span style={{ color: '#FF5700' }}>,</span> Optimized{' '}
              <span style={{ color: '#FFFFFF' }}>Routes</span><span style={{ color: '#FF5700' }}>,</span> Better{' '}
              <span style={{ color: '#FFFFFF' }}>Outcomes</span><span style={{ color: '#FF5700' }}>.</span>
            </h1>
            {/* 2.3 Subheadline: BC Novatica CYR 32px Medium, line-height 38px, #FFFFFF */}
            <p
              className="font-novatica font-medium mb-10 max-w-xl mx-auto text-center"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 24px)', lineHeight: '1.4', color: '#FFFFFF' }}
            >
              TRACC connects healthcare and transport providers to streamline
              patient transfers and improve outcomes.
            </p>
            {/* 2.4–2.6 Both buttons; Quick Start: 335×62, border-radius 15px, #FF5700, text #F0F3FF Inter Tight 20px */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleDownloadGuide}
                className="inline-flex items-center justify-center font-inter-tight font-medium rounded-[15px] shadow-lg transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 min-w-[280px] sm:min-w-[335px] h-[62px]"
                style={{ backgroundColor: '#FF5700', color: '#F0F3FF', fontSize: '20px' }}
              >
                <Download className="mr-2 h-5 w-5" />
                Download Quick Start Guide
              </button>
              <button
                onClick={onShowRegistration}
                className="inline-flex items-center justify-center px-8 h-[62px] font-inter-tight font-medium rounded-[15px] text-tracc-primary bg-white hover:bg-tracc-neutral transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-tracc-primary focus:ring-white"
                style={{ fontSize: '20px' }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Right: Login card – bottom aligns with buttons; no min-height */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-[571px] p-8 rounded-[26px] shadow-xl"
              style={{ backgroundColor: '#F0F3FF' }}
            >
              {/* 2.8 Login title: BC Novatica CYR 42px Medium #001872 */}
              <h2
                className="font-novatica font-medium mb-6"
                style={{ fontSize: '42px', color: '#001872' }}
              >
                Login to TRACC
              </h2>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="hero-email" className="sr-only">
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
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tracc-accent focus:border-tracc-accent focus:outline-none font-inter-tight placeholder:text-[#001872]/70"
                    style={{ backgroundColor: '#F4CEC6', color: '#001872', fontSize: '20px' }}
                  />
                </div>
                <div>
                  <label htmlFor="hero-password" className="sr-only">
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
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-tracc-accent focus:border-tracc-accent focus:outline-none font-inter-tight placeholder:text-[#001872]/70"
                    style={{ backgroundColor: '#F4CEC6', color: '#001872', fontSize: '20px' }}
                  />
                </div>
                {/* 2.10 Remember me: Inter Tight 16px #5D5D5D; checkbox per figma */}
                <div className="flex items-center justify-between">
                  <label
                    className="flex items-center gap-2 cursor-pointer font-inter-tight"
                    style={{ fontSize: '16px', color: '#5D5D5D' }}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-[1.5px] border-[#5D5D5D] w-[21px] h-[22px]"
                      style={{ backgroundColor: '#D9D9D9' }}
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="font-inter-tight hover:underline"
                    style={{ fontSize: '16px', color: '#001872' }}
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
                {/* 2.11 Login button: ~120×55, border-radius 15px, #FF5700, text Inter Tight 20px #F0F3FF */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex justify-center items-center font-inter-tight font-medium rounded-[15px] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-[120px] h-[55px]"
                    style={{ backgroundColor: '#FF5700', color: '#F0F3FF', fontSize: '20px' }}
                  >
                    {loading ? 'Signing in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* 2.5 Sub-text: below grid, aligned with left column */}
        <p
          className="mt-4 font-inter-tight font-light max-w-[280px] sm:max-w-[335px] mx-auto lg:mx-0 text-center lg:text-left"
          style={{ fontSize: '14px', color: '#F0F3FF' }}
        >
          Step-by-step guide to create your TRACC account
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
