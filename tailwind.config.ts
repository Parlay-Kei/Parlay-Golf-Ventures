import type { Config } from "tailwindcss";
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    // Standardized breakpoints for consistent responsive behavior
    screens: {
      'xs': '480px',    // Extra small devices (portrait phones)
      'sm': '640px',    // Small devices (landscape phones)
      'md': '768px',    // Medium devices (tablets)
      'lg': '1024px',   // Large devices (desktops)
      'xl': '1280px',   // Extra large devices (large desktops)
      '2xl': '1536px',  // Extra extra large devices
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'var(--pgv-cream)', // Updated to cream
        foreground: 'var(--text-main)', // Updated to text-main
        
        // PGV Brand Colors
        pgv: {
          forest: 'var(--pgv-forest)',
          'forest-dark': 'var(--pgv-forest-dark)', // Darker forest green for better contrast
          gold: 'var(--pgv-gold)',
          'gold-dark': '#B08A30', // Darker gold for better contrast on light backgrounds
          'gold-darker': '#9C7C2C', // Even darker gold for hover states
          cream: 'var(--pgv-cream)',
          rust: 'var(--pgv-rust)',
          turf: 'var(--pgv-turf)',
          clay: 'var(--pgv-clay)',
        },
        
        // Text Colors
        text: {
          main: 'var(--text-main)',
          subtle: 'var(--text-subtle)',
          inverse: 'var(--text-inverse)',
        },
        
        // Primary/Secondary/Accent mapped to PGV colors
        primary: {
          DEFAULT: 'var(--pgv-forest)', // Deep Forest Green
          dark: '#001810',
          light: '#023020',
          foreground: 'var(--text-inverse)' // White text on primary
        },
        secondary: {
          DEFAULT: 'var(--pgv-gold)', // Gold
          dark: '#B08A30',
          light: '#E6C55C',
          foreground: 'var(--pgv-forest)' // Forest text on secondary
        },
        accent: {
          DEFAULT: 'var(--pgv-rust)', // Rust
          dark: '#8A4424',
          light: '#B66036',
          foreground: 'var(--text-inverse)' // White text on accent
        },
        
        // Functional Colors
        success: 'var(--pgv-turf)',
        warning: 'var(--pgv-gold)',
        danger: 'var(--pgv-clay)',
        
        // Legacy PGV Colors (keeping for backward compatibility)
        'pgv-green': 'var(--pgv-forest)', // Updated to match forest
        'pgv-green-light': '#023020',
        'pgv-green-dark': '#001810',
        'pgv-gold': 'var(--pgv-gold)',
        'pgv-gold-light': '#E6C55C',
        'pgv-gold-dark': '#B08A30',
        'pgv-gray': '#F5F7FA',
        'pgv-gray-dark': '#E1E5EB',
        
        // UI Component Colors
        destructive: {
          DEFAULT: 'var(--pgv-clay)',
          foreground: 'var(--text-inverse)'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        popover: {
          DEFAULT: 'var(--pgv-cream)',
          foreground: 'var(--text-main)'
        },
        card: {
          DEFAULT: 'var(--pgv-cream)',
          foreground: 'var(--text-main)'
        },
      },
      fontFamily: {
        sans: ['Inter', 'Lato', 'sans-serif'],
        serif: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        headline: ['Cinzel', 'serif'],
        body: ['Inter', 'Lato', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'button': '10px',
        'card': '12px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        "slide-in-bottom": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-in-top": {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "slide-in-bottom": "slide-in-bottom 0.4s ease-out",
        "slide-in-top": "slide-in-top 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'medium': '0 8px 30px rgba(0, 0, 0, 0.08)',
        'hard': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'header': '0 2px 8px rgba(0,0,0,0.15)',
        'card': '0 4px 12px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.12)',
        'button-hover': '0 4px 12px rgba(212, 175, 55, 0.3)',
        'text-glow': '0 0 4px rgba(212, 175, 55, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
      },
      transitionDuration: {
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom, var(--pgv-forest), #001810)',
        'gradient-nav': 'linear-gradient(to right, var(--pgv-forest), #001C14)',
        'gold-shimmer': 'linear-gradient(90deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.3) 25%, rgba(212,175,55,0.5) 50%, rgba(212,175,55,0.3) 75%, rgba(212,175,55,0.1) 100%)',
      },
      minHeight: {
        'header': 'clamp(80px, 10vh, 130px)', // Dynamic header height
      },
      spacing: {
        'header': 'clamp(80px, 10vh, 130px)', // For consistent spacing with header height
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
