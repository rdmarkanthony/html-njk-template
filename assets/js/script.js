"use strict";

const projName = {
    preloader: false,
    init() {
        // if mobile
        if (projName.isMobile()) $("html").addClass("is-mobile");

        // for debugging
        projName.debug.init();

        // for header
        projName.header.init();

        // for footer
        projName.footer.init();

        // for animate
        projName.animate.init();

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
    debug: {
        active: false,
        init() {
            if (projName.url.getVars().debug == "true") projName.debug.active = true;

            if (projName.url.getVars().outline == "true") {
                document.querySelectorAll("div").forEach((div) => {
                    div.style.outline = "1px dashed #ff0000";
                });
            }
        },
    },
    ready() {
        // show animate
        projName.animate.run();

        // for auto-scroll
        projName.scroll.init();

        console.log(projName);
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
        $(projName.footer.target).css({ marginTop: -projName.footer.height() });
        $("#main-wrapper").css({ paddingBottom: projName.footer.height() });

        if (event == "resize") return;
        // for equal height
        $("[data-group-height]").each(function () {
            let _groups = [];

            $("[gh-item]", this).each(function () {
                const _item = this.getAttribute("gh-item").split(",");

                if (_item[0].length <= 0) _item[0] = 1;

                const _groupNum = parseInt(_item[0]) - 1;
                if (_item[1]) this.within = parseInt(_item[1]);

                if (!_groups[_groupNum]) _groups.push([]);

                _groups[_groupNum].push(this);
            });

            if (_groups.length > 0) {
                _groups.forEach((group) => {
                    projName.equalHeight(group);
                });
            }
        });

        $("[data-row-group-height]").each(function () {
            let _parentWidth = this.offsetWidth;
            let _items = this.querySelectorAll("[rgh-item]");
            let _itemsPerRow = Math.floor(_parentWidth / _items[0].offsetWidth);

            let _groups = [];

            let _itemCounter = 0;
            for (let i = 0; i < _items.length; i++) {
                if (_itemCounter == 0) _groups.push([]);

                _groups[_groups.length - 1].push(_items[i]);

                _itemCounter++;
                if (_itemCounter >= _itemsPerRow) _itemCounter = 0;
            }

            if (_groups.length > 0) {
                for (let i = 0; i < _groups.length; i++) {
                    projName.equalHeight(_groups[i]);
                }
            }
        });
    },
    scroll: {
        init() {
            // for auto scroll
            if (projName.url.getHash()) {
                const _target = document.querySelector(projName.url.getHash());

                if (!_target) return;
                // for auto scroll
                setTimeout(function () {
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
                setTimeout(function () {
                    _btnPopup.click();
                }, 300);
            }

            $("[data-auto-scroll]").click(function (e) {
                const _target = document.querySelector(this.getAttribute("href"));

                if (!_target) return;
                e.preventDefault();

                projName.scroll.auto({ target: _target });
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
            opt.direction = "down";
            if (projName.scroll.top() >= $(opt.target).offset().top) opt.direction = "up";

            // for offset
            if (!opt.offset) {
                opt.offset = 0;

                // if target has no padding-top
                if (parseInt($(opt.target).css("padding-top")) <= 0) opt.offset += 20;
            }

            // for speed
            if (!opt.speed) opt.speed = 700;

            $("html")
                .stop()
                .animate({ scrollTop: $(opt.target).offset().top - opt.offset }, opt.speed, false, function () {
                    if (opt.callback) opt.callback();
                });
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
            projName.event.resize(function (event) {
                projName.emit("resize", event);
            });

            $(document).ready(function () {
                projName.emit("ready");
            });
        },
        resize(callback) {
            let _resizeTimer = "";

            callback("init");

            window.addEventListener("load", function (e) {
                callback("ready", e);
            });

            window.addEventListener("resize", function (e) {
                callback("resize", e);

                clearTimeout(_resizeTimer);
                _resizeTimer = setTimeout(function () {
                    callback("after", e);
                }, 300);
            });
        },
        scroll(callback) {
            callback();
            window.addEventListener("scroll", function (e) {
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
        return window.innerWidth - (window.innerWidth - document.documentElement.clientWidth);
    },
    height() {
        return window.innerHeight - (window.innerHeight - document.documentElement.clientHeight);
    },
    equalHeight(elements) {
        // clear the height first
        elements.forEach((element) => {
            element.style.minHeight = "";
        });
        if (elements.length <= 1) return;

        // find which has highest height
        let _biggestHeight = 0;
        elements.forEach((element) => {
            const _elHeight = element.offsetHeight;
            if (_elHeight > _biggestHeight) _biggestHeight = _elHeight;
        });

        // apply the common height
        elements.forEach((element) => {
            if (element.within) {
                if (projName.width() >= element.within) element.style.minHeight = _biggestHeight + "px";
            } else {
                element.style.minHeight = _biggestHeight + "px";
            }
        });
    },
    animate: {
        init() {
            $("[data-animate]").each(function () {
                const _this = this;
                const _dataset = this.dataset.animate.split(",");

                _this.opt = {
                    status: null,
                    animation: "animateFade",
                    duration: null,
                    delay: null,
                };

                if (_dataset[0] != "parent" && _dataset[0] != "child") {
                    // for single animation
                    if (projName.animate.getValue(_dataset[0])) _this.opt.animation = _dataset[0];
                    if (projName.animate.getValue(_dataset[1])) _this.opt.duration = _dataset[1];
                    if (projName.animate.getValue(_dataset[2])) _this.opt.delay = _dataset[2];

                    projName.animate.addListener(_this);
                } else {
                    // for group animation
                    if (_dataset[0] != "parent") return;

                    if (projName.animate.getValue(_dataset[1])) _this.opt.animation = _dataset[1];
                    if (projName.animate.getValue(_dataset[2])) _this.opt.duration = _dataset[2];
                    if (projName.animate.getValue(_dataset[3])) _this.opt.delay = _dataset[3];

                    _this.opt.status = "parent";

                    $('[data-animate="child"]', _this).each(function () {
                        $("> *", this).each(function () {
                            if (this.hasAttribute("data-animate")) return;
                            $(this).attr("data-animate", "sub-child");
                        });
                    });

                    let _delay = 0.5;
                    if (_this.opt.delay) _delay = parseFloat(_this.opt.delay);
                    $("[data-animate]", _this).each(function () {
                        if (this.dataset.animate == "child") return;

                        this.opt = Object.create(_this.opt);
                        this.opt.status = "child";

                        _delay += 0.1;
                        this.opt.delay = _delay;

                        projName.animate.addListener(this);
                    });
                }
            });
        },
        getValue(target) {
            if (!target) return false;
            if (target.length <= 0) return false;
            if (target == "false") return false;
            return target;
        },
        addListener(target) {
            target.addEventListener("visible", function () {
                $(target).addClass(target.opt.animation);
                if (target.opt.duration)
                    $(target).css({
                        "animation-duration": target.opt.duration + "s",
                    });
                if (target.opt.delay)
                    $(target).css({
                        "animation-delay": target.opt.delay + "s",
                    });

                $(target).addClass("animated");

                const _duration = parseFloat($(target).css("animation-duration"));
                const _delay = parseFloat($(target).css("animation-delay"));

                setTimeout(function () {
                    $(target).removeAttr("data-animate").removeClass("animated animateFade").css({
                        "animation-duration": "",
                        "animation-delay": "",
                    });
                    if (target.opt.animation) $(target).removeClass(target.opt.animation);
                    if (target.style.length <= 0) target.removeAttribute("style");
                }, (_duration + _delay) * 1000);
            });
        },
        run() {
            $("[data-animate]").each(function () {
                const _this = this;

                const _opt = this.opt;
                let _animated = false;

                if (_opt.status != "parent" && _opt.status != "child") {
                    $(_this).on("inview", function (event, visible) {
                        if (visible) {
                            if (_animated) return;
                            _animated = true;

                            projName.event.dispatch(_this, "visible");
                        }
                    });
                } else {
                    if (_opt.status != "parent") return;

                    $(_this).on("inview", function (event, visible) {
                        if (visible) {
                            if (_animated) return;
                            _animated = true;
                            $(_this).addClass("visible");
                            $('[data-animate="child"]', _this).removeAttr("data-animate");

                            $("[data-animate]", _this).each(function () {
                                projName.event.dispatch(this, "visible");
                            });
                        }
                    });
                }
            });
        },
    },
    enquire(breakpoints) {
        const _enquire = this;

        _enquire.instance = 0;
        _enquire.currentBreakpoint = null;
        _enquire.state = null;
        _enquire.event = null;

        _enquire.init = function () {
            // how to use this function
            // new projName.enquire({
            // 	0: function(enquire) {
            // 		// if(enquire.instance > 0) return; // if you want to call the function once
            // 		console.log('minwidth 0', enquire);
            // 	},
            // 	768: function(enquire) {
            // 		// if(enquire.instance > 0) return; // if you want to call the function once
            // 		console.log('minwidth 768', enquire);
            // 	},
            // 	1200: function(enquire) {
            // 		// if(enquire.instance > 0) return; // if you want to call the function once
            // 		console.log('minwidth 1200', enquire);
            // 	}
            // });

            projName.event.resize(function (state, e) {
                let _currentBreakpoint = null;

                for (const breakpoint in breakpoints) {
                    if (projName.width() >= breakpoint) _currentBreakpoint = breakpoint;
                }

                _enquire.instance++;
                if (_enquire.currentBreakpoint != breakpoints[_currentBreakpoint]) _enquire.instance = 0;
                _enquire.currentBreakpoint = breakpoints[_currentBreakpoint];

                _enquire.state = state;
                _enquire.event = e;

                _enquire.currentBreakpoint(_enquire);
            });
        };

        if (Object.keys(breakpoints).length > 0) _enquire.init();
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
                            '<div class="section-par text-center">' + "<h2>Popup content not found!</h2>" + "</div>"
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
                        .addClass("com_modal-popup-btn btn-close")
                        .html(
                            '<svg class="w-7 h-7 transition duration-300 hover:stroke-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>'
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
                            if (projName.popup.list[projName.popup.list.length - 1] == _popup) _popup.close(); // close only the current or the most recent popup
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
                if (_popup.content.original.offsetHeight < _mainHeight) $(_popup.target).addClass("popup-short"); // if the popup is short in height, position it in the center
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
                    if (_popup.content.parent) $(_popup.content.parent).append(_popup.content.original); // restore the content to its original container
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
