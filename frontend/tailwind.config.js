/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
        display: ['var(--font-nunito)', 'Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // Duolingo palette
        duo: {
          green: '#58cc02',
          'green-dark': '#58a700',
          'green-hover': '#61e002',
          'green-light': '#d7ffb8',
          blue: '#1cb0f6',
          'blue-dark': '#1899d6',
          'blue-light': '#ddf4ff',
          red: '#ff4b4b',
          'red-dark': '#e63f3f',
          'red-light': '#ffdfe0',
          yellow: '#ffc800',
          'yellow-dark': '#e6b400',
          purple: '#ce82ff',
          'purple-dark': '#a560e8',
          orange: '#ff9600',
          'orange-dark': '#e68a00',
          gold: '#ffc800',
          gray: '#afafaf',
          'gray-light': '#e5e5e5',
          'gray-lighter': '#f7f7f7',
          'gray-dark': '#777777',
          'gray-darker': '#4b4b4b',
          ink: '#3c3c3c',
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'duo-btn': '0 4px 0 0 rgba(0,0,0,0.15)',
        'duo-green': '0 4px 0 0 #58a700',
        'duo-blue': '0 4px 0 0 #1899d6',
        'duo-red': '0 4px 0 0 #c53030',
        'duo-yellow': '0 4px 0 0 #e6b400',
        'duo-purple': '0 4px 0 0 #a560e8',
        'duo-gray': '0 4px 0 0 #b0b0b0',
        'duo-inner': 'inset 0 -4px 0 0 rgba(0,0,0,0.1)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'bounce-in': { '0%': { transform: 'scale(0.5)', opacity: '0' }, '60%': { transform: 'scale(1.1)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        'slide-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        'wiggle': { '0%,100%': { transform: 'rotate(-3deg)' }, '50%': { transform: 'rotate(3deg)' } },
        'pop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        'shake': { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-8px)' }, '75%': { transform: 'translateX(8px)' } },
        'confetti': { '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' }, '100%': { transform: 'translateY(-500px) rotate(720deg)', opacity: '0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bounce-in': 'bounce-in 0.4s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'wiggle': 'wiggle 0.3s ease-in-out',
        'pop': 'pop 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
