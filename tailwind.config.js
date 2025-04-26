/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/**/*.{html,js}',
    './src/**/*.{html,js}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: { // Soft Pink/Lavender
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        accent: { // Soft Green
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: { // Soft Yellow
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        danger: { // Soft Red
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
        },
        
        // Keep existing specific colors if needed
        paul: "#7AA2F7", // Existing - maybe adjust later if needed
        darya: "#F7768E", // Existing - maybe adjust later if needed
        both: "#AD8EE6", // Existing - maybe adjust later if needed
        category: { // Use new pastel accents or keep specific ones? Let's update slightly
          docs: "#4ade80", // accent-400 (Soft Green)
          apartment: "#facc15", // warning-400 (Soft Yellow)
          services: "#a78bfa", // Existing violet, slightly pastel
          moving: "#7dd3fc", // primary-300 (Soft Blue)
          finances: "#fb7185", // danger-400 (Soft Red)
          paperwork: "#6ee7b7", // Existing teal, slightly pastel -> let's use a distinct accent
          other: "#a3a3a3" // Neutral gray
        },
        gray: { // Keep existing grays for neutrality
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
        // Removed Discord specific dark colors
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        "sm": "0.375rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16, 24, 40, 0.05)",
        sm: "0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)",
        md: "0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -1px rgba(16, 24, 40, 0.06)",
        lg: "0 10px 15px -3px rgba(16, 24, 40, 0.1), 0 4px 6px -2px rgba(16, 24, 40, 0.05)",
        xl: "0 20px 25px -5px rgba(16, 24, 40, 0.1), 0 10px 10px -5px rgba(16, 24, 40, 0.04)",
        "2xl": "0 25px 50px -12px rgba(16, 24, 40, 0.25)",
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        "fade-in": "fade-in 0.3s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "bounce-sm": "bounce-sm 0.5s ease-out", // New playful bounce
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "bounce-sm": { // New bounce animation
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        }
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
}; 