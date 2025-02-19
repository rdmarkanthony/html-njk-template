const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities }) {
    addUtilities({
        ".ease, a, input[type='submit'], button": {
            transition: "all var(--animate-delay) ease",
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
    });
});
