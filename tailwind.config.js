/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0d14',
          surface: '#111726',
          elevated: '#182138',
          border: '#233052',
          text: '#f1f5f9',
          muted: '#94a3b8',
        },
        light: {
          bg: '#f8fafc',
          surface: '#ffffff',
          elevated: '#f1f5f9',
          border: '#e2e8f0',
          text: '#0f172a',
          muted: '#64748b',
        },
        brand: {
          primary: '#6366f1', // Indigo
          accent: '#f59e0b',  // Amber
          glow: '#818cf8',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        narrative: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.25)',
        'glow-amber': '0 0 15px -3px rgba(245, 158, 11, 0.25)',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      }
    },
  },
  plugins: [],
}
