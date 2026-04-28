/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#000000',
          900: '#0a0a0a',
          850: '#111111',
          800: '#1a1a1a',
          700: '#262626',
          600: '#3a3a3a',
        },
        amber: {
          DEFAULT: '#D4A574',
          50: '#fbf6ef',
          100: '#f5e9d4',
          200: '#ead2a8',
          300: '#dfba7c',
          400: '#D4A574',
          500: '#c08c52',
          600: '#9b6f3f',
          700: '#74532f',
          800: '#4d3720',
          900: '#2a1e12',
        },
        rye: '#8B5A2B',
        copper: '#B87333',
        oak: '#5C4033',
        bone: '#F5EFE6',
        success: '#5FB97A',
        warning: '#E0B341',
        danger: '#D9534F',
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        sheet: '24px',
      },
      boxShadow: {
        glow: '0 0 40px rgba(212, 165, 116, 0.18)',
        card: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'scan-line': 'scan-line 2.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        'scan-line': {
          '0%, 100%': { transform: 'translateY(-50%)', opacity: '0.2' },
          '50%': { transform: 'translateY(50%)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
    },
  },
  plugins: [],
};
