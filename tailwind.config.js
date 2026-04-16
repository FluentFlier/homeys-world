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
      },
      fontFamily: {
        heading: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-nunito)', 'sans-serif'],
      },
      borderRadius: {
        blob: '60% 40% 30% 70% / 60% 30% 70% 40%',
      },
    },
  },
  plugins: [],
}
