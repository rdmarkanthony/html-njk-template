class _lightbox {
    constructor(props) {
        if (!window._lightboxList) window._lightboxList = []; // storage for all opened lightbox

        this.modal = props.modal ?? false;

        this.target = "";
        this.el = {
            cover: "",
            main: "",
            btn: {
                close: "",
            },
        };
        this.content = {
            parent: "",
            original: "",
        };

        this.events = props.events ?? {}; // for events eg. 'BeforeShow'
        this.listeners = {};

        if (this.isInLightbox(props.target)) return; // prevent duplicate lightbox instances

        this.init(props);
    }

    // check if target element is already in a lightbox
    isInLightbox(target) {
        const _target = typeof target === "string" ? document.querySelector(target) : target;
        if (!_target) return false;

        return window._lightboxList.some((lightbox) => lightbox.content.original === _target);
    }

    init(props) {
        if (!this.modal) this.hide("all"); // hide existing non-modal lightboxes

        // create main lightbox elements
        this.target = document.createElement("div");
        this.target.classList.add("js-lightbox");
        document.body.appendChild(this.target);

        this.el.cover = document.createElement("div");
        this.el.cover.classList.add("js-lightbox-cover");
        this.target.appendChild(this.el.cover);

        this.el.main = document.createElement("div");
        this.el.main.classList.add("js-lightbox-main");
        this.target.appendChild(this.el.main);

        // set target content
        if (props.target) {
            const _target =
                typeof props.target === "string"
                    ? document.querySelector(props.target)
                    : props.target;

            if (_target) {
                this.content.parent = _target.parentNode;
                this.content.original = _target;
            }
        }

        // default content if none is provided
        if (!this.content.original) {
            this.content.original = document.createElement("div");
            this.content.original.classList.add("lightbox-content", "container", "mx-auto");
            this.content.original.innerHTML =
                '<div class="section-par text-center"><h3>Lightbox content not found!</h3></div>';
        }

        this.el.main.appendChild(this.content.original);
        this.content.original.classList.add("js-lightbox-center");

        // if non-modal
        if (!this.modal) {
            this.createCloseButton(); // create close btn
            document.addEventListener("keydown", this.handleEscapeKey.bind(this)); // can use esc key
        }

        // need to recalculate spaces every resize
        let _resizeTimer = 0;
        window.addEventListener("resize", () => {
            this.resize();

            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => this.resize(), 100);
        });
        this.resize();

        this.emit("beforeShow"); // call custom callback event

        this.show(); // show the popup
        window._lightboxList.push(this); // store this lightbox
    }

    // create close btn
    createCloseButton() {
        this.el.btn.close = document.createElement("a");
        this.el.btn.close.classList.add("js-lightbox-btn", "btn-close");
        this.el.btn.close.href = "#";
        this.el.btn.close.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="currentColor"/></svg>`;
        this.target.appendChild(this.el.btn.close);

        this.el.btn.close.addEventListener("click", (e) => {
            e.preventDefault();
            this.hide();
        });
    }

    // for esc key
    handleEscapeKey(event) {
        if (!this.target) return;
        if (event.key === "Escape" || event.keyCode === 27) {
            if (window._lightboxList[window._lightboxList.length - 1] === this) this.hide();
        }
    }

    resize() {
        const _mainStyle = getComputedStyle(this.el.main);
        const _mainHeight =
            this.el.main.offsetHeight -
            (parseFloat(_mainStyle.paddingTop) + parseFloat(_mainStyle.paddingBottom));

        this.target.classList.toggle(
            "lightbox-short",
            this.content.original.offsetHeight < _mainHeight
        );
    }

    // show the lightbox
    show() {
        document.body.classList.add("lightbox-active");
        this.target.classList.add("lightbox-visible");

        setTimeout(() => this.emit("afterShow"), 500);
    }

    // hide the lightbox
    hide(status) {
        // if want to hide all existing lightbox
        if (status === "all") {
            [...window._lightboxList].forEach((item, index, arr) => {
                item.hide();
            });

            return;
        }

        this.emit("beforeClose"); // call custom callback event

        this.target.classList.remove("lightbox-visible");
        this.target.classList.add("lightbox-hiding");

        // clean any traces of this instance
        setTimeout(() => {
            if (this.content.parent) this.content.parent.appendChild(this.content.original);
            this.content.original.classList.remove("js-lightbox-center");

            window._lightboxList = window._lightboxList.filter((lightbox) => lightbox !== this);
            this.target.remove();

            if (window._lightboxList.length === 0)
                document.body.classList.remove("lightbox-active");

            this.emit("afterClose");
        }, 500);
    }

    // register event listener
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    // remove event listener
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback);
    }

    // emit certain event
    emit(event) {
        if (this.events[event]) this.events[event](this);

        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => callback(this));
    }

    // static method
    static close(status) {
        // to hide the latest or all active lightboxes
        [...window._lightboxList].forEach((item, index, arr) => {
            if (status === "all" || index === arr.length - 1) item.hide();
        });
    }
}
