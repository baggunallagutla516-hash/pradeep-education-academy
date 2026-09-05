/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#061018',
          900: '#0B1C28',
          800: '#123042',
          700: '#1A4258',
        },
        lagoon: {
          50: '#EEF9F6',
          100: '#D5F0E9',
          200: '#AEE0D3',
          300: '#78C9B6',
          400: '#3FAE96',
          500: '#1F8F78',
          600: '#147361',
          700: '#115C4F',
          800: '#104A41',
          900: '#0E3D36',
        },
        ember: {
          400: '#F0A05A',
          500: '#E8852F',
          600: '#D46A18',
          700: '#B05212',
        },
        sand: {
          50: '#F5F8F7',
          100: '#E9EFEC',
        },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(11, 28, 40, 0.18)',
        lift: '0 18px 50px -20px rgba(20, 115, 97, 0.35)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 12% 18%, rgba(63, 174, 150, 0.22) 0px, transparent 45%), radial-gradient(at 88% 8%, rgba(232, 133, 47, 0.16) 0px, transparent 40%), radial-gradient(at 70% 85%, rgba(20, 115, 97, 0.12) 0px, transparent 45%)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(28px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.06)' },
        },
        'soft-rise': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'slide-in-right': 'slide-in-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 5s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 5.5s ease-in-out infinite',
        'soft-rise': 'soft-rise 0.65s cubic-bezier(0.22, 1, 0.36, 1) both',
        'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
