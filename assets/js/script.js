const projName = {
    debug: false,
    init() {
        // if mobile/desktop
        document
            .querySelector("html")
            .classList.add(projName.isMobile() ? "is-mobile" : "is-desktop");

        // for debugging
        if (projName.url.getVars().debug === "true") projName.debug = true;
        if (projName.debug) {
            if (projName.url.getVars().outline === "true") {
                document.querySelectorAll("div").forEach((div) => {
                    div.style.outline = "1px dashed #ff0000";
                });
            }
        }

        // for header
        projName.header.init();

        // for footer
        projName.footer.init();

        // for general resize
        projName.on("resize", (event) => projName.resize(event));

        // for ready
        projName.on("ready", () => projName.ready());

        // initialize the events
        projName.event.resize((status, event) => {
            projName.emit("resize", status, event);
        });

        document.addEventListener("DOMContentLoaded", () => {
            projName.emit("ready");
        });
    },
    ready() {
        // for auto-scroll
        if (projName.url.getHash()) {
            const _target = document.querySelector(projName.url.getHash());

            if (!_target) return;
            // for auto scroll
            setTimeout(() => {
                projName.autoScroll({
                    target: _target,
                    offset: null,
                    speed: null,
                    callback: null,
                });
            }, 500);

            // for auto popup
            const _btnPopup = document.querySelector('a[href="' + projName.url.getHash() + '"]');
            if (!_btnPopup) return;
            setTimeout(() => {
                _btnPopup.click();
            }, 300);
        }

        document.querySelectorAll("[data-auto-scroll]").forEach((item) => {
            const _item = item;

            _item.addEventListener("click", (e) => {
                let _target = _item.getAttribute("href");

                if (!_target) return;
                _target = document.querySelector(_target);

                if (!_target) return;
                e.preventDefault();

                projName.autoScroll({ target: _target });
            });
        });

        if (projName.debug) console.log(projName);
    },
    header: {
        target: document.querySelector(".header-content"),
        height() {
            return !projName.header.target || projName.header.target.offsetHeight <= 0
                ? 0
                : projName.header.target.offsetHeight;
        },
        init() {},
    },
    footer: {
        target: document.querySelector(".footer-content"),
        height() {
            return !projName.footer.target || projName.footer.target.offsetHeight <= 0
                ? 0
                : projName.footer.target.offsetHeight;
        },
        init() {},
    },
    resize(event) {
        // sticky footer
        if (projName.footer.target) {
            projName.footer.target.style.marginTop = `${projName.footer.height() * -1}px`;

            const _mainWrapper = document.querySelector("#main-wrapper");
            if (_mainWrapper) _mainWrapper.style.paddingBottom = `${projName.footer.height()}px`;
        }
    },
    scrollTop() {
        return window.pageYOffset || document.documentElement.scrollTop;
    },
    autoScroll(opt) {
        if (!opt.target) return;

        // if need to scroll to parent of the target
        let _changeTarget = opt.target.dataset.scrollParent;
        if (_changeTarget) {
            _changeTarget = $(opt.target).closest(_changeTarget)[0];
            if (_changeTarget) opt.target = _changeTarget;
        }

        // for direction
        opt.direction = projName.scrollTop() >= opt.target.offsetTop ? "up" : "down";

        // for offset
        if (!opt.offset) {
            opt.offset = 0;

            // if target has no padding-top
            if (parseFloat(getComputedStyle(opt.target).paddingTop) <= 0) opt.offset += 20;
        }

        // for speed
        if (!opt.speed) opt.speed = 700;

        // animate
        window.scrollTo({
            top: opt.target.offsetTop - opt.offset,
            behavior: "smooth",
        });

        if (opt.callback) setTimeout(opt.callback, opt.speed);
    },
    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    },
    url: {
        getHash() {
            return window.location.hash ? window.location.hash.split("?")[0] : false;
        },
        getVars() {
            let vars = {};
            window.location.search
                .substring(1)
                .split("&")
                .forEach((param) => {
                    const [key, value] = param.split("=");
                    if (key) vars[decodeURIComponent(key)] = decodeURIComponent(value || "");
                });
            return vars;
        },
        setVars(key, value) {
            let vars = this.getVars();
            vars[key] = value;

            const queryString = Object.entries(vars)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join("&");

            const newUrl =
                window.location.pathname +
                (queryString ? "?" + queryString : "") +
                window.location.hash;

            window.history.pushState({ path: newUrl }, "", newUrl);
        },
    },
    event: {
        resize(callback) {
            let _resizeTimer = "";

            callback("init");

            window.addEventListener("load", (e) => {
                callback("ready", e);
            });

            window.addEventListener("resize", (e) => {
                callback("resize", e);

                clearTimeout(_resizeTimer);
                _resizeTimer = setTimeout(() => {
                    callback("after", e);
                }, 300);
            });
        },
        scroll(callback) {
            callback();
            window.addEventListener("scroll", (e) => {
                callback(e);
            });
        },
        dispatch(elem, eventName) {
            let event;
            if (typeof Event === "function") {
                event = new Event(eventName);
            } else {
                event = document.createEvent("Event");
                event.initEvent(eventName, true, true);
            }
            elem.dispatchEvent(event);
        },
    },
    width() {
        return document.documentElement.clientWidth;
    },
    height() {
        return document.documentElement.clientHeight;
    },
    listeners: {},
    on(event, callback) {
        if (!projName.listeners[event]) projName.listeners[event] = [];
        projName.listeners[event].push(callback);
    },
    emit(event, data = null, status = null) {
        if (!projName.listeners[event]) return;
        projName.listeners[event].forEach((callback) => {
            if (callback) callback(data, status);
        });
    },
};
projName.init();
