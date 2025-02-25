const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities, addComponents }) {
    addComponents({
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
        "@keyframes fadeInDown": {
            from: {
                opacity: "0",
                "-webkit-transform": "translate3d(0, -100%, 0)",
                transform: "translate3d(0, -100%, 0)",
            },
            to: {
                opacity: "1",
                "-webkit-transform": "translate3d(0, 0, 0)",
                transform: "translate3d(0, 0, 0)",
            },
        },
        "@keyframes pullUp": {
            "0%": {
                transform: "translateY(100%)",
            },
            "100%": {
                transform: "translateY(0)",
            },
        },
        "@keyframes popIn": {
            "0%": {
                transform: "scale(0)",
            },
            "100%": {
                transform: "scale(1)",
            },
        },
    });

    addUtilities({
        "[data-animate]": {
            opacity: "0",
        },
        ".visible": {
            opacity: "1",
        },
        ".animateFade": {
            animation: "animateFade 1s ease-out",
        },
        ".fadeInDown": {
            animation: "fadeInDown 1s ease-out",
        },
        ".animated": {
            animationDuration: "var(--animate-duration)",
            animationFillMode: "forwards",
        },
        ".in-animate": {
            animationDelay: "var(--animation-delay)",
            animationTimingFunction: "cubic-bezier(0.21,0.12,0,1.01)",
            animationFillMode: "forwards",
        },
        ".js-splittext": {
            "--animation-delay": "0.1s",
        },
        ".js-splittext .line-parent": {
            position: "relative",
            overflow: "hidden",
        },
        ".js-splittext-animate, .js-splittext[data-animate]": {
            opacity: "1",
            animation: "none",
            "--pullup-delay": "0.1s",
        },
        ".js-splittext-animate .word": {
            transform: "translateY(100%)",
        },
        ".js-splittext-animated .word": {
            animationDuration: "0.6s",
            animationTimingFunction: "cubic-bezier(0.215, 0.61, 0.355, 1)",
            animationDelay: "calc(var(--pullup-delay) + 0.1s * var(--index))",
            animationFillMode: "forwards",
            animationName: "pullUp",
        },
        ".js-splittext-animated .word .emoji": {
            animationDuration: "1s",
            animationName: "popIn",
        },
    });
});
