const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities }) {
    addUtilities({
        ".ease, a, input[type='submit'], button": {
            transition: "all var(--animation-delay) ease",
        },
        ".mobile-input": {
            appearance: "none",
            border: "none",
            "border-radius": "0",
            outline: "none !important",
            "box-shadow": "none !important",
            "&:focus, &:active": {
                outline: "none !important",
                "box-shadow": "none !important",
            },
        },
        ".scrolling-touch": {
            overflow: "auto",
            overflowScrolling: "touch",
            "-webkit-overflow-scrolling": "touch",
        },
        ".link-underline, .link-underline2": {
            "--underline-color": "currentColor",
            textDecoration: "none",
            backgroundImage:
                "linear-gradient(transparent 0, var(--underline-color, black) 1px, var(--underline-color, black) 2px, transparent 2px)",
            backgroundSize: "100% 3px",
            backgroundPosition: "100% 100%",
            backgroundRepeat: "no-repeat",
            transition:
                "color var(--animation-delay) ease-in-out, background-size var(--animation-delay) ease-in-out",
            "&:hover": {
                backgroundSize: "0% 3px",
            },
        },
        ".link-underline2": {
            backgroundSize: "0% 3px",
            backgroundPosition: "0% 100%",
            "&:hover": {
                backgroundSize: "100% 3px",
            },
        },
    });
});
