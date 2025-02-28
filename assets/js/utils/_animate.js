const _animate = {
    debug: false,
    delay: 0,
    adjacentDelay: 0,
    duration: 0,
    init(props = {}) {
        _animate.debug = props.debug ?? false;
        _animate.delay = props.delay ?? 0.5;
        _animate.adjacentDelay = props.adjacentDelay ?? 0.15;
        _animate.duration = props.duration ?? 0.8;

        // find all the animate containers
        document.querySelectorAll("[data-animate]").forEach((item) => {
            const _item = item;
            const _dataset = _item.dataset.animate.split(",");

            const _relation = _dataset[0] ? _dataset[0] : "";
            let _delay = _dataset[1] ? parseFloat(_dataset[1]) : _animate.delay; // default animation delay
            let _duration = _dataset[2] ? parseFloat(_dataset[2]) : _animate.duration; // default animation duration

            if (_relation === "parent") {
                // for parent

                // find all the children of this parent
                _item.querySelectorAll('[data-animate="children"]').forEach((item) => {
                    const _item = item;

                    // find again the sub-children
                    Array.from(_item.children).forEach((item) => {
                        const _item = item;

                        // if this children has children too
                        if (_item.dataset.animate === "children") {
                            Array.from(_item.children).forEach((item) => {
                                const _item = item;

                                _item.dataset.animate = "child"; // mark as child

                                _animate.set(_item, _delay, _duration);

                                _delay += _animate.adjacentDelay; // stagger the delay for all child
                            });
                        } else {
                            if (_item.dataset.animate) return;

                            _item.dataset.animate = "child"; // mark as child

                            _animate.set(_item, _delay, _duration);

                            _delay += _animate.adjacentDelay; // stagger the delay for all child
                        }
                    });
                });
            } else {
                // for single item
                if (!["children", "child"].includes(_relation))
                    _animate.set(_item, _delay, _duration);
            }

            // animate the containers upon inview
            new _inview({
                target: _item,
                callback: () => {
                    if (_relation === "parent") {
                        // for parent
                        _item.classList.remove("opacity-0");
                        _item.removeAttribute("data-animate");

                        // animate each child
                        _item.querySelectorAll('[data-animate="child"]').forEach((item) => {
                            const _item = item;

                            _animate.show(_item);
                            _animate.clean(_item);

                            projName.event.dispatch(_item, "visible");
                        });
                    } else if (_relation === "children") {
                        // this is the parent of child, no animation, just show the content
                        _item.classList.remove("opacity-0");
                        _item.removeAttribute("data-animate");
                    } else if (_relation === "child") {
                        // do nothing, as their parent will trigger visibility for each of them
                        return;
                    } else {
                        // for single item
                        _animate.show(_item);
                        _animate.clean(_item);
                    }
                },
            });
        });

        // for header titles or splittext animate
        document.querySelectorAll(".js-splittext").forEach((item) => {
            const _item = item;
            const _splittext = new _splitText({ target: _item });

            if (!_item.dataset.animate) return;
            _item.classList.add("js-splittext-animate");

            _item.addEventListener("visible", () => {
                _item.classList.add("js-splittext-animated");
                _item.style.setProperty(
                    "--pullup-delay",
                    window.getComputedStyle(_item).animationDelay
                );

                if (_animate.debug) return;

                const _words = _splittext?.split?.words;

                if (!_words) return;

                let _timeOut =
                    (_words.length + 1) *
                    parseFloat(window.getComputedStyle(_words[0]).animationDuration);
                if (_timeOut <= 1) _timeOut = 1;

                window.setTimeout(() => {
                    _splittext?.split?.revert();
                    _item.classList.remove("js-splittext-animate", "js-splittext-animated");
                    _item.style.setProperty("--pullup-delay", "");
                }, _timeOut * 1000);
            });
        });

        if (_animate.debug) console.log(_animate);
    },
    set(target, delay, duration) {
        target.style.animationDelay = `${delay}s`;
        target.style.setProperty("--animate-delay", `${delay}s`);
        target.style.setProperty("--animate-duration", `${duration}s`);
    },
    show(target) {
        let _className =
            target.dataset.animateClass || target.dataset.animate?.split(",")[0] || "fadeInUp";
        if (["parent", "children", "child"].includes(_className)) _className = "fadeInUp";

        // show and animate the element
        target.classList.remove("opacity-0");
        target.classList.add("animate__animated", `animate__${_className}`);
    },
    clean(target, callback) {
        if (_animate.debug) return;

        let _className =
            target.dataset.animateClass || target.dataset.animate?.split(",")[0] || "fadeInUp";
        if (["parent", "children", "child"].includes(_className)) _className = "fadeInUp";

        // hide the element after delay
        const _styles = window.getComputedStyle(target);
        let _delay = parseFloat(_styles.animationDuration) + parseFloat(_styles.animationDelay);

        window.setTimeout(() => {
            target.removeAttribute("data-animate");
            target.classList.remove("animate__animated", `animate__${_className}`, "opacity-0");

            target.style.animationDelay = "";
            target.style.setProperty("--animate-delay", "");
            target.style.animationDuration = "";
            target.style.setProperty("--animate-duration", "");
            target.style.animationFillMode = "";

            target.removeAttribute("data-animate-class");

            if (target.getAttribute("style")?.length <= 0) target.removeAttribute("style");

            if (callback) callback();
        }, _delay * 1000);
    },
};
