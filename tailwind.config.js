/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{html,njk}",
    "./templates/**/*.{html,njk}",
    "./assets/scss/**/*.{css,scss}",
    "./assets/js/**/*.js",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss"),
    require("autoprefixer"),
    require("daisyui"),
  ],
  daisyui: {
    // https://daisyui.com/docs/themes/
    themes: false,
  },
};
