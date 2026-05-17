/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#07080d',
          card: '#0d1117',
          elevated: '#131720',
        },
        brand: {
          blue: '#3b82f6',
          green: '#22c55e',
        },
        text: {
          primary: '#e2e8f0',
          muted: '#64748b',
        },
        border: '#1e2433',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
