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
          bg: '#07050e',        // Cosmic Deep Obsidian
          surface: '#110d22',   // Astral Twilight Glass
          elevated: '#17122e',  // Luminous Void Chamber
          border: '#291f48',    // Ethereal Amethyst Leyline Border
          text: '#f8fafc',      // Starlight White
          muted: '#cbd5e1',     // High-Contrast Astral Lavender/Silver
          subtle: '#94a3b8',    // Soft Celestial Secondary
        },
        light: {
          bg: '#07050e',        // Locked dark fantasy mode for consistent immersion
          surface: '#110d22',
          elevated: '#17122e',
          border: '#291f48',
          text: '#f8fafc',
          muted: '#cbd5e1',
        },
        brand: {
          primary: '#8b5cf6',   // Royal Celestial Violet
          accent: '#f59e0b',    // Radiant Starlight Amber / Gold
          gold: '#fbbf24',      // Divine Zenith Gold
          glow: '#a78bfa',
          success: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          cyan: '#38bdf8',
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
