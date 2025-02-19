const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities, addComponents }) {
    addUtilities({
        "@keyframes animateFade": {
            "0%": {
                opacity: "0",
                transform: "translate3d(0, 40px, 0)",
            },
            "100%": {
                opacity: "1",
                transform: "translate3d(0, 0, 0)",
            },
        },
        ".animateFade": {
            animation: "animateFade 1s ease-out",
        },
        "[data-animate]": {
            opacity: "0",
        },
        ".visible": {
            opacity: "1",
        },
        ".animated": {
            animationDuration: "var(--animate-duration)",
            animationFillMode: "forwards",
        },
    });
});
