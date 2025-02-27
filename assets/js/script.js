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
        projName.event.init();

        // for popup
        $("[data-modal-popup]").each(function () {
            const _this = this;
            let _modal = false;

            const _dataset = _this.dataset.modalPopup.split(",");
            if (_dataset[0]) {
                if (_dataset[0] == "modal") _modal = true;
            }

            $(_this).click(function (e) {
                e.preventDefault();

                new projName.popup.open({ target: _this.getAttribute("href"), modal: _modal });
            });
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
            console.log(typeof Event);
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
    findElement: function (target) {
        if (target.length <= 0 || target == "#") return false;
        return document.querySelector(target);
    },
    popup: {
        list: [], // keep in list all the opened popups
        open: function (opt) {
            let _inPopup = false; // check if the content is already present within the popup
            _inPopup = _.find(
                projName.popup.list,
                (popup) => popup.content.original === document.querySelector(opt.target)
            );

            if (_inPopup) return;

            const _popup = this;

            _popup.target = "";
            _popup.el = {
                cover: "",
                main: "",
                btn: {
                    close: "",
                },
            };
            _popup.content = {
                parent: "",
                original: "",
            };

            _popup.modal = false;

            _popup.init = function () {
                if (opt && opt.modal) _popup.modal = true;
                if (!_popup.modal) projName.popup.close("all"); // close previous popup

                // popup parent container
                _popup.target = document.createElement("div");
                $(_popup.target).addClass("com_modal-popup");
                $("body").append(_popup.target);

                // popup dim bg
                _popup.el.cover = document.createElement("div");
                $(_popup.target).append(_popup.el.cover);
                $(_popup.el.cover).addClass("com_modal-popup-cover");

                // popup main container
                _popup.el.main = document.createElement("div");
                $(_popup.target).append(_popup.el.main);
                $(_popup.el.main).addClass("com_modal-popup-main");

                if (opt && opt.target) {
                    // if there's content to display in the popup
                    const _content = projName.findElement(opt.target);

                    if (_content) {
                        _popup.content.parent = _content.parentNode;
                        _popup.content.original = _content;
                    }
                }

                if (!_popup.content.original) {
                    // no content to display
                    _popup.content.original = document.createElement("div");
                    $(_popup.content.original)
                        .addClass("popup-content container max-w-screen-sm")
                        .append(
                            '<div class="section-par text-center">' +
                                "<h2>Popup content not found!</h2>" +
                                "</div>"
                        );
                }

                $(_popup.el.main).append(_popup.content.original);
                $(_popup.content.original).addClass("com_modal-popup-center");

                // for close button
                if (!_popup.modal) {
                    // if modal, no need for close button
                    _popup.el.btn.close = document.createElement("a");
                    $(_popup.target).append(_popup.el.btn.close);
                    $(_popup.el.btn.close)
                        .addClass("com_modal-popup-btn btn-close group")
                        .html(
                            '<svg class="w-7 h-7 transition duration-200 group-hover:stroke-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>'
                        );
                    _popup.el.btn.close.setAttribute("href", "#");

                    $(_popup.el.btn.close).click(function (e) {
                        e.preventDefault();
                        _popup.close();
                    });

                    // for escape key
                    document.addEventListener("keydown", function (event) {
                        if (!_popup.target) return;
                        if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
                            if (projName.popup.list[projName.popup.list.length - 1] == _popup)
                                _popup.close(); // close only the current or the most recent popup
                        }
                    });
                }

                projName.event.resize(function (state, event) {
                    _popup.resize(state, event);
                });

                _popup.show();
                projName.popup.list.push(_popup); // add this popup to the list
            };

            _popup.resize = function (state, event) {
                // if(state == 'resize') return;

                const _mainHeight =
                    _popup.el.main.offsetHeight -
                    (parseFloat($(_popup.el.main).css("padding-top")) +
                        parseFloat($(_popup.el.main).css("padding-bottom")));

                $(_popup.target).removeClass("popup-short");
                if (_popup.content.original.offsetHeight < _mainHeight)
                    $(_popup.target).addClass("popup-short"); // if the popup is short in height, position it in the center
            };

            _popup.show = function () {
                $("body").addClass("popup-active");
                $(_popup.target).addClass("popup-visible"); // animate-In the popup

                setTimeout(function () {
                    _popup.emit("afterShow");
                }, 500);
            };

            _popup.close = function () {
                $(_popup.target).removeClass("popup-visible");
                $(_popup.target).addClass("popup-hiding"); // animate-Out the popup

                setTimeout(function () {
                    if (_popup.content.parent)
                        $(_popup.content.parent).append(_popup.content.original); // restore the content to its original container
                    $(_popup.content.original).removeClass("com_modal-popup-center");

                    // remove this popup in popup.list
                    _.remove(projName.popup.list, (popup) => _.isEqual(popup, _popup));

                    $(_popup.target).remove();

                    if (projName.popup.list.length <= 0) $("body").removeClass("popup-active");

                    _popup.emit("afterClose");
                }, 500);
            };

            _popup.listeners = {};

            (_popup.on = function (event, callback) {
                if (!_popup.listeners[event]) _popup.listeners[event] = [];
                _popup.listeners[event].push(callback);
            }),
                (_popup.emit = function (event) {
                    if (!_popup.listeners[event]) return;
                    _.each(_popup.listeners[event], function (callback) {
                        if (callback) callback(_popup);
                    });
                });

            _popup.init();
        },
        close: function (state) {
            if (projName.popup.list.length <= 0) return;

            if (state == "all") {
                // close all popup
                const _popups = _.clone(projName.popup.list);

                _.each(_popups, function (popup) {
                    popup.close();
                });
            } else {
                // close only the current or the most recent popup
                projName.popup.list[projName.popup.list.length - 1].close();
            }
        },
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
