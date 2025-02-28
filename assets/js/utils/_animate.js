class _animate {
    constructor(props = {}) {
        if (window._animateInstance) throw new Error("_animate is already running");

        window._animateInstance = this;

        this.debug = props.debug ?? false;
        this.delay = props.delay ?? 0.1;
        this.adjacentDelay = props.adjacentDelay ?? 0.1;
        this.duration = props.duration ?? 0.8;
        this.keyframe = props.keyframe ?? "fadeInUpSmall";

        this.init();
    }

    init() {
        // find all the animate containers
        document.querySelectorAll("[data-animate]").forEach((item) => {
            const _item = item;
            const _dataset = _item.dataset.animate.split(",");

            const _relation = _dataset[0] ? _dataset[0] : "";
            let _delay = _dataset[1] ? parseFloat(_dataset[1]) : this.delay; // default animation delay
            let _duration = _dataset[2] ? parseFloat(_dataset[2]) : this.duration; // default animation duration

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

                                this.set(_item, _delay, _duration);

                                _delay += this.adjacentDelay; // stagger the delay for all child
                            });
                        } else {
                            if (_item.dataset.animate) return;

                            _item.dataset.animate = "child"; // mark as child

                            this.set(_item, _delay, _duration);

                            _delay += this.adjacentDelay; // stagger the delay for all child
                        }
                    });
                });
            } else {
                // for single item
                if (!["children", "child"].includes(_relation)) this.set(_item, _delay, _duration);
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

                            this.show(_item);
                            this.clean(_item);

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
                        this.show(_item);
                        this.clean(_item);
                    }
                },
            });
        });

        // for header titles or splittext animate
        if (typeof _splitText !== "undefined" && typeof SplitType !== "undefined") {
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

                    if (this.debug) return;

                    const _words = _splittext?.split?.words;

                    if (!_words) return;

                    let _timeOut =
                        (_words.length + 1) *
                        parseFloat(window.getComputedStyle(_words[0]).animationDuration);
                    if (_timeOut <= 1) _timeOut = 1;

                    window.setTimeout(() => {
                        _splittext?.split?.revert();
                        _splittext.split = null;

                        _item.classList.remove("js-splittext-animate", "js-splittext-animated");
                        _item.style.setProperty("--pullup-delay", "");
                    }, _timeOut * 1000);
                });
            });
        }

        if (this.debug) console.log("_animate", this);
    }

    set(target, delay, duration) {
        target.style.animationDelay = `${delay.toFixed(2)}s`;
        target.style.setProperty("--animate-delay", `${delay.toFixed(2)}s`);
        target.style.setProperty("--animate-duration", `${duration}s`);
    }

    show(target) {
        let _className =
            target.dataset.animateClass || target.dataset.animate?.split(",")[0] || this.keyframe;
        if (["parent", "children", "child"].includes(_className)) _className = this.keyframe;

        // show and animate the element
        target.classList.remove("opacity-0");
        target.classList.add("animate__animated", `animate__${_className}`);
    }

    clean(target, callback) {
        if (this.debug) return;

        let _className =
            target.dataset.animateClass || target.dataset.animate?.split(",")[0] || this.keyframe;
        if (["parent", "children", "child"].includes(_className)) _className = this.keyframe;

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
    }
}
