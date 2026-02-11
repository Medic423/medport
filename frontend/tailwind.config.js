/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Existing app palette */
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        /* TRACC landing – design-specs.txt */
        tracc: {
          primary: '#001872',
          'primary-light': '#006ac6',
          accent: '#ff5700',
          neutral: '#f0f3ff',
          gray: '#5d5d5d',
          tertiary: '#f4cec6',
          /* light blue section bg from screenshots */
          'section-bg': '#e6f0f8',
        },
      },
      fontFamily: {
        serifa: ['Serifa', 'Georgia', 'serif'],
        novatica: ['BC Novatica CYR', 'Georgia', 'serif'],
        'inter-tight': ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
