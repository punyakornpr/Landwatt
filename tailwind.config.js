/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TerraWatt friendly palette — brand/paper ผูกกับ CSS variables เพื่อสลับธีมได้
        paper: 'rgb(var(--paper) / <alpha-value>)',
        ink: {
          DEFAULT: '#1d1d1f',
          soft: '#6e6e73',
          faint: '#86868b',
        },
        brand: {
          50: 'rgb(var(--brand-50) / <alpha-value>)',
          100: 'rgb(var(--brand-100) / <alpha-value>)',
          200: 'rgb(var(--brand-200) / <alpha-value>)',
          300: 'rgb(var(--brand-300) / <alpha-value>)',
          400: 'rgb(var(--brand-400) / <alpha-value>)',
          500: 'rgb(var(--brand-500) / <alpha-value>)',
          600: 'rgb(var(--brand-600) / <alpha-value>)',
          700: 'rgb(var(--brand-700) / <alpha-value>)',
          800: 'rgb(var(--brand-800) / <alpha-value>)',
          900: 'rgb(var(--brand-900) / <alpha-value>)',
          950: 'rgb(var(--brand-950) / <alpha-value>)',
        },
        // สีสนับสนุน 3 ตัว: success/info/warning — ผูก CSS vars ให้เปลี่ยนตามธีมได้
        energy: {
          50: 'rgb(var(--energy-50) / <alpha-value>)',
          100: 'rgb(var(--energy-100) / <alpha-value>)',
          200: 'rgb(var(--energy-200) / <alpha-value>)',
          300: 'rgb(var(--energy-300) / <alpha-value>)',
          400: 'rgb(var(--energy-400) / <alpha-value>)',
          500: 'rgb(var(--energy-500) / <alpha-value>)',
          600: 'rgb(var(--energy-600) / <alpha-value>)',
          700: 'rgb(var(--energy-700) / <alpha-value>)',
          800: 'rgb(var(--energy-800) / <alpha-value>)',
          900: 'rgb(var(--energy-900) / <alpha-value>)',
          950: 'rgb(var(--energy-950) / <alpha-value>)',
        },
        volt: {
          50: 'rgb(var(--volt-50) / <alpha-value>)',
          100: 'rgb(var(--volt-100) / <alpha-value>)',
          200: 'rgb(var(--volt-200) / <alpha-value>)',
          300: 'rgb(var(--volt-300) / <alpha-value>)',
          400: 'rgb(var(--volt-400) / <alpha-value>)',
          500: 'rgb(var(--volt-500) / <alpha-value>)',
          600: 'rgb(var(--volt-600) / <alpha-value>)',
          700: 'rgb(var(--volt-700) / <alpha-value>)',
          800: 'rgb(var(--volt-800) / <alpha-value>)',
          900: 'rgb(var(--volt-900) / <alpha-value>)',
        },
        electric: {
          50: 'rgb(var(--electric-50) / <alpha-value>)',
          100: 'rgb(var(--electric-100) / <alpha-value>)',
          200: 'rgb(var(--electric-200) / <alpha-value>)',
          300: 'rgb(var(--electric-300) / <alpha-value>)',
          400: 'rgb(var(--electric-400) / <alpha-value>)',
          500: 'rgb(var(--electric-500) / <alpha-value>)',
          600: 'rgb(var(--electric-600) / <alpha-value>)',
          700: 'rgb(var(--electric-700) / <alpha-value>)',
          800: 'rgb(var(--electric-800) / <alpha-value>)',
          900: 'rgb(var(--electric-900) / <alpha-value>)',
          950: 'rgb(var(--electric-950) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Prompt', 'Sarabun', 'Noto Sans Thai', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace']
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      }
    },
  },
  plugins: [],
}
