class _lightbox {
    constructor(opt) {
        if (!window._lightboxList) window._lightboxList = [];

        this.modal = opt?.modal || false;
        this.content = { parent: "", original: "" };
        this.el = { cover: "", main: "", btn: { close: "" } };
        this.target = "";
        this.listeners = {};

        if (this.isInPopup(opt?.target)) return;
        this.init(opt);
    }

    isInPopup(target) {
        return window._lightboxList.some(
            (popup) => popup.content.original === document.querySelector(target)
        );
    }

    init(opt) {
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

        if (opt?.target) {
            const _content = projName.findElement(opt.target);
            if (_content) {
                this.content.parent = _content.parentNode;
                this.content.original = _content;
            }
        }

        if (!this.content.original) {
            this.content.original = document.createElement("div");
            this.content.original.classList.add("popup-content", "container", "width-3");
            this.content.original.innerHTML =
                '<div class="section-par text-center"><h3>Popup content not found!</h3></div>';
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
        this.el.btn.close.innerHTML = '<i class="fal fa-times"></i>';
        this.target.appendChild(this.el.btn.close);

        this.el.btn.close.addEventListener("click", (e) => {
            e.preventDefault();
            this.close();
        });
    }

    handleEscapeKey(event) {
        if (!this.target) return;
        if (event.key === "Escape" || event.keyCode === 27) {
            if (pru.popup.list[pru.popup.list.length - 1] === this) this.close();
        }
    }

    resize() {
        const mainHeight =
            this.el.main.offsetHeight -
            (parseFloat(getComputedStyle(this.el.main).paddingTop) +
                parseFloat(getComputedStyle(this.el.main).paddingBottom));
        this.target.classList.toggle(
            "popup-short",
            this.content.original.offsetHeight < mainHeight
        );
    }

    show() {
        document.body.classList.add("popup-active");
        this.target.classList.add("popup-visible");
        setTimeout(() => this.emit("afterShow"), 500);
    }

    close(status) {
        if (status === "all") {
            while (window._lightboxList.length) {
                window._lightboxList[0].close();
            }

            return;
        }

        this.target.classList.remove("popup-visible");
        this.target.classList.add("popup-hiding");

        setTimeout(() => {
            if (this.content.parent) this.content.parent.appendChild(this.content.original);
            this.content.original.classList.remove("js-lightbox-center");

            window._lightboxList = window._lightboxList.filter((popup) => popup !== this);
            this.target.remove();

            if (window._lightboxList.length === 0) document.body.classList.remove("popup-active");

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
}
