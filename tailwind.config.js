/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}", "./pages/**/*.{ts,tsx,js,jsx}", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-container-highest': 'var(--surface-container-highest)',
      },
      fontFamily: {
        newsreader: ['Newsreader', 'serif'],
      },
      borderRadius: {
        DEFAULT: '0px',
        none: '0px',
      },
    },
  },
  plugins: [],
}
