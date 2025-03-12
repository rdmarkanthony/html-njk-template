class _typing {
    constructor(props) {
        this.target = props.target ?? null;

        this.el = {
            main: document.createElement("span"),
            cursor: document.createElement("span"),
        };

        this.text = props.text ?? "";
        this.count = 0;
        this.speed = props.speed ?? 50;

        this.cursorEnabled = props.cursorEnabled ?? true;

        this.events = props.events ?? {};
        this.listeners = {};

        if (this.target) this.init();
    }

    init() {
        this.style();

        this.el.main.classList.add("js-typing-main");
        this.target.appendChild(this.el.main);

        this.createCursor(); // create cursor

        // console.log("_typing", this);
    }

    createCursor() {
        this.el.cursor.classList.add("js-typing-cursor");
        this.el.cursor.innerHTML = "|";
        this.target.appendChild(this.el.cursor);

        this.showCursor();
    }

    showCursor() {
        if (this.cursorEnabled) this.el.cursor.classList.add("cursor-visible");
    }

    hideCursor() {
        this.el.cursor.classList.remove("cursor-visible");
    }

    start(callback) {
        if (this.text.length <= 0) return;
        this.showCursor();
        this.emit("beforeStart");

        this.count = 0;
        const _run = () => {
            if (this.count > this.text.length) {
                this.emit("afterStart");
                callback?.(this);
                return;
            }

            this.el.main.textContent += this.text.charAt(this.count);
            this.count++;

            setTimeout(_run, this.speed);
        };
        _run();
    }

    erase(callback) {
        let _text = this.el.main.innerHTML;
        let _count = _text.length;

        if (_count <= 0) return;
        this.showCursor();
        this.emit("beforeErase");

        const _erase = () => {
            if (_count === 0) {
                this.emit("afterErase");
                callback?.(this);
                return;
            }

            _text = _text.slice(0, -1);
            this.el.main.innerHTML = _text;
            _count--;

            setTimeout(_erase, this.speed);
        };
        _erase();
    }

    clear() {
        this.el.main.innerHTML = "";
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

    style() {
        let _style = document.querySelector("#js-typing-style");
        if (_style) return;

        _style = document.createElement("style");
        _style.setAttribute("id", "js-typing-style");
        document.head.appendChild(_style);

        _style.innerHTML =
            `.js-typing-cursor { opacity: 0; font-weight: 100; line-height: normal; }` +
            ` @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }` +
            `.js-typing-cursor.cursor-visible { animation: blink 0.7s infinite; }`;
    }
}
