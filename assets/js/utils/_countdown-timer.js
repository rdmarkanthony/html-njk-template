const { DateTime } = luxon;

class _countdownTimer {
    constructor(props) {
        this.dateTime = {
            target: props.dateTime ?? null,
            now: null,
            diff: null,
        };

        this.timeZone = props.target ?? "Asia/Manila";

        this.interval = null;

        this.debug = props.debug ?? false;

        this.events = props.events ?? {}; // for events eg. 'beforeInit'
        this.listeners = {};

        if (this.dateTime.target) this.init();
    }

    init() {
        this.emit("beforeInit");

        this.interval = setInterval(() => {
            if (this.dateTime.diff.seconds < 0) {
                this.destroy();
                return;
            }

            this.update();
        }, 1000);
        this.update();

        this.emit("afterInit");

        if (this.debug) console.log("_countdownTimer", this);
    }

    update() {
        this.dateTime.now = DateTime.now().setZone(this.timeZone);
        this.dateTime.diff = this.dateTime.target
            .diff(this.dateTime.now, ["days", "hours", "minutes", "seconds"])
            .toObject();

        this.emit("update");
    }

    destroy() {
        clearInterval(this.interval);
        this.emit("end");
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
}
