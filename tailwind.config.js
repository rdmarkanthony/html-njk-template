module.exports = {
    content: [
        "./pages/**/*.{html,njk}",
        "./templates/**/*.{html,njk}",
        "./assets/scss/**/*.{css,scss}",
        "./assets/js/**/*.js",
        // exclude specific file
        "!./assets/scss/_bootstrap.min.scss",
        "!./assets/js/lib/**/*.js",
    ],
    safelist: [],
    theme: {
        // screens: {
        //   sm: "640px",
        //   md: "768px",
        //   lg: "1024px",
        //   xl: "1280px",
        // },
        // colors: {
        //   blue: "#1fb6ff",
        //   purple: "#7e5bef",
        //   pink: "#ff49db",
        //   orange: "#ff7849",
        //   green: "#13ce66",
        //   yellow: "#ffc82c",
        //   "gray-dark": "#273444",
        //   gray: "#8492a6",
        //   "gray-light": "#d3dce6",
        // },
        // fontFamily: {
        //   sans: ['Graphik', 'sans-serif'],
        //   serif: ['Merriweather', 'serif'],
        // },
        // extend: {
        //   spacing: {
        //     "8xl": "96rem",
        //     "9xl": "128rem",
        //   },
        //   borderRadius: {
        //     "4xl": "2rem",
        //   },
        // },
    },
    plugins: [
        require("tailwindcss"),
        // require("@tailwindcss/forms"),
        // require("daisyui"),
        require("autoprefixer"),
        require("./tailwind/plugins/default"),
        require("./tailwind/plugins/animate"),
    ],
    daisyui: {
        themes: false, // https://daisyui.com/docs/themes/
    },
};
