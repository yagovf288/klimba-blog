/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,sgn,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        "primary": "#3BE3D2",
        "primary-hover": "#2BCBC0",
        "secondary": "#0F172A",
        "background-light": "#F6F8F8",
        "background-dark": "#11211F",
        "surface-light": "#FFFFFF",
        "surface-dark": "#1A2C2A",
        "text-main": "#111717",
        "text-muted": "#648783",
        "brand-dark": "#0F172A",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3BE3D2 0%, #0F172A 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2.5rem",
      },
    },
  },
  plugins: [],
}
