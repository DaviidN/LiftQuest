/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          from: "var(--color-primary-from)",
          via: "var(--color-primary-via)",
          to: "var(--color-primary-to)",
        },

        secondary: "var(--color-secondary)",

        heading: {
          from: "var(--color-heading-from)",
          to: "var(--color-heading-to)",
        },

        btnPrimary: {
          from: "var(--btn-color-primary-from)",
          to: "var(--btn-color-primary-to)",
        },
        btnPrimaryHover: {
          from: "var(--btn-color-primary-hover-from)",
          to: "var(--btn-color-primary-hover-to)",
        },

        btnSecondary: "var(--btn-color-secondary)",
        btnSecondaryHover: "var(--btn-color-secondary-hover)",

        btnTertiary: "var(--btn-color-tertiary)",
        btnTertiaryHover: "var(--btn-color-tertiary-hover)",
        
        btnGhostHover: "var(--btn-color-ghost-hover)"
      },
    },
  },
  plugins: [],
}

