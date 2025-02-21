const projName = {
    debug: false,
    init() {
        // if mobile/desktop
        document.querySelector("html").classList.add(projName.isMobile() ? "is-mobile" : "is-desktop");

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
        projName.event.init();
    },
    ready() {
        // for auto-scroll
        projName.scroll.init();

        if (projName.debug) console.log(projName);
    },
    header: {
        target: document.querySelector(".header-content"),
        height() {
            if (!projName.header.target || projName.header.target.offsetHeight <= 0) return null;
            return projName.header.target.offsetHeight;
        },
        init() {},
    },
    footer: {
        target: document.querySelector(".footer-content"),
        height() {
            if (!projName.footer.target || projName.footer.target.offsetHeight <= 0) return null;
            return projName.footer.target.offsetHeight;
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
    scroll: {
        init() {
            // for auto scroll
            if (projName.url.getHash()) {
                const _target = document.querySelector(projName.url.getHash());

                if (!_target) return;
                // for auto scroll
                setTimeout(() => {
                    projName.scroll.auto({
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

                    projName.scroll.auto({ target: _target });
                });
            });
        },
        top() {
            return window.pageYOffset || document.documentElement.scrollTop;
        },
        auto(opt) {
            if (!opt.target) return;

            // if need to scroll to parent of the target
            let _changeTarget = opt.target.dataset.scrollParent;
            if (_changeTarget) {
                _changeTarget = $(opt.target).closest(_changeTarget)[0];
                if (_changeTarget) opt.target = _changeTarget;
            }

            // for direction
            opt.direction = projName.scroll.top() >= opt.target.offsetTop ? "up" : "down";

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
    },
    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    },
    url: {
        getHash() {
            if (window.location.hash) {
                return window.location.hash.split("?")[0];
            } else {
                return false;
            }
        },
        getVars() {
            let vars = {};
            const parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi, function (m, key, value) {
                vars[key] = value;
            });
            return vars;
        },
        setVars(key, value) {
            let url = window.location.href;
            const hash = location.hash;

            url = url.replace(hash, "");

            if (url.indexOf(key + "=") >= 0) {
                const old = ocbc.getUrlVars()[key];
                url = url.replace(key + "=" + old, key + "=" + value);
            } else {
                if (url.indexOf("?") < 0) url += "?" + key + "=" + value;
                else url += "&" + key + "=" + value;
            }
            window.history.pushState({ path: url + hash }, "", url + hash);
        },
    },
    event: {
        init() {
            projName.event.resize((event) => {
                projName.emit("resize", event);
            });

            document.addEventListener("DOMContentLoaded", () => {
                projName.emit("ready");
            });
        },
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
    emit(event, data) {
        if (!projName.listeners[event]) return;
        projName.listeners[event].forEach((callback) => {
            if (callback) callback(data);
        });
    },
};
projName.init();
