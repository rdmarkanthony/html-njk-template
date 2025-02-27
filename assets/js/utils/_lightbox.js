class _lightbox {
    constructor(props) {
        if (!window._lightboxList) window._lightboxList = [];

        this.modal = props?.modal || false;
        this.content = { parent: "", original: "" };
        this.el = { cover: "", main: "", btn: { close: "" } };
        this.target = "";
        this.listeners = {};

        if (this.isInLightbox(props?.target)) return;
        this.init(props);
    }

    isInLightbox(target) {
        const _target = typeof target === "string" ? document.querySelector(target) : target;
        if (!_target) return false;

        return window._lightboxList.some((lightbox) => lightbox.content.original === _target);
    }

    init(props) {
        if (!this.modal) this.close("all");

        this.target = document.createElement("div");
        this.target.classList.add("js-lightbox");
        document.body.appendChild(this.target);

        this.el.cover = document.createElement("div");
        this.el.cover.classList.add("js-lightbox-cover");
        this.target.appendChild(this.el.cover);

        this.el.main = document.createElement("div");
        this.el.main.classList.add("js-lightbox-main");
        this.target.appendChild(this.el.main);

        if (props?.target) {
            const _target =
                typeof props.target === "string"
                    ? document.querySelector(props.target)
                    : props.target;

            if (_target) {
                this.content.parent = _target.parentNode;
                this.content.original = _target;
            }
        }

        if (!this.content.original) {
            this.content.original = document.createElement("div");
            this.content.original.classList.add("lightbox-content", "container", "width-3");
            this.content.original.innerHTML =
                '<div class="section-par text-center"><h3>Lightbox content not found!</h3></div>';
        }

        this.el.main.appendChild(this.content.original);
        this.content.original.classList.add("js-lightbox-center");

        if (!this.modal) {
            this.createCloseButton();
            document.addEventListener("keydown", this.handleEscapeKey.bind(this));
        }

        projName.event.resize(() => this.resize());

        this.show();
        window._lightboxList.push(this);
    }

    createCloseButton() {
        this.el.btn.close = document.createElement("a");
        this.el.btn.close.classList.add("js-lightbox-btn", "btn-close");
        this.el.btn.close.href = "#";
        this.el.btn.close.innerHTML = `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M19.207 6.207a1 1 0 0 0-1.414-1.414L12 10.586 6.207 4.793a1 1 0 0 0-1.414 1.414L10.586 12l-5.793 5.793a1 1 0 1 0 1.414 1.414L12 13.414l5.793 5.793a1 1 0 0 0 1.414-1.414L13.414 12l5.793-5.793z" fill="currentColor"/></svg>`;
        this.target.appendChild(this.el.btn.close);

        this.el.btn.close.addEventListener("click", (e) => {
            e.preventDefault();
            this.close();
        });
    }

    handleEscapeKey(event) {
        if (!this.target) return;
        if (event.key === "Escape" || event.keyCode === 27) {
            if (window._lightboxList[window._lightboxList.length - 1] === this) this.close();
        }
    }

    resize() {
        const mainHeight =
            this.el.main.offsetHeight -
            (parseFloat(getComputedStyle(this.el.main).paddingTop) +
                parseFloat(getComputedStyle(this.el.main).paddingBottom));
        this.target.classList.toggle(
            "lightbox-short",
            this.content.original.offsetHeight < mainHeight
        );
    }

    show() {
        document.body.classList.add("lightbox-active");
        this.target.classList.add("lightbox-visible");
        setTimeout(() => this.emit("afterShow"), 500);
    }

    close(status) {
        if (status === "all") {
            [...window._lightboxList].forEach((item, index, arr) => {
                item.close();
            });

            return;
        }

        this.target.classList.remove("lightbox-visible");
        this.target.classList.add("lightbox-hiding");

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

    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => callback(this));
    }

    static command(action) {
        if (action === "close" || action === "closeAll") {
            [...window._lightboxList].forEach((item, index, arr) => {
                if (action === "closeAll" || index === arr.length - 1) item.close();
            });
        }
    }
}
