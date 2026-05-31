/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FDFCF8',
        foreground: '#2C2C24',
        primary: { DEFAULT: '#5D7052', foreground: '#F3F4F1' },
        secondary: { DEFAULT: '#C18C5D', foreground: '#FFFFFF' },
        accent: { DEFAULT: '#E6DCCD', foreground: '#4A4A40' },
        muted: { DEFAULT: '#F0EBE5', foreground: '#78786C' },
        border: '#DED8CF',
        destructive: '#A85448',
        // Mainframe palette (dark theme — used by (mainframe) route group)
        void: '#050506',
        slab: '#0c0c0e',
        edge: '#161619',
        wire: '#222228',
        fog: '#5a5a6e',
        bone: '#e8e4dd',
        chalk: '#f5f2ec',
        lime: '#b5ff4d',
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
        // Mainframe typography
        display: ['Instrument Serif', 'serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        blob: '60% 40% 30% 70% / 60% 30% 70% 40%',
      },
    },
  },
  plugins: [],
}
