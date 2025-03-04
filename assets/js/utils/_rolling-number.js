const { animate } = window.popmotion;
class _rollingNumber {
    constructor(props) {
        this.target = props.target ?? null;
        this.debug = props.debug ?? false;

        this.el = {
            main: document.createElement("div"),
            numbers: [],
        };

        this.numeric = props.numeric ?? true;

        this.maxNumber = props.maxNumber ?? 10;
        this.duration = props.duration ?? 750;
        this.currentNumber = null;

        this.height = 0;

        if (this.target) this.init();
    }

    init() {
        this.target.appendChild(this.el.main);

        this.target.style.position = "relative";
        this.target.style.overflow = "hidden";

        this.el.main.style.pointerEvents = "none";
        this.el.main.style.willChange = "transform";
        this.el.main.style.textAlign = "center";

        // create numbers
        for (let i = 0; i < this.maxNumber; i++) {
            this.createNumber(i);
        }
        this.createNumber(0);
        if (!this.numeric) {
            this.createNumber(",");
            this.createNumber(".");
        }

        let _resizeTimer = 0;
        window.addEventListener("resize", () => {
            clearTimeout(_resizeTimer);

            _resizeTimer = setTimeout(() => this.resize(), 100);
        });
        this.resize();

        if (this.debug) console.log("_rollingNumber", this);
    }

    createNumber(value) {
        let _number = document.createElement("div");
        _number.innerText = value;
        this.el.numbers.push(_number);
        this.el.main.appendChild(_number);
    }

    roll(props) {
        let _from = props?.from ?? this.currentNumber ?? 0;
        let _to = props?.to ?? 0;
        const _duration = props?.duration ?? this.duration;

        if (_to === ",") {
            _to = this.el.numbers.length - 2;
            if (_from === 0) _from = this.maxNumber;
        }
        if (_to === ".") {
            _to = this.el.numbers.length - 1;
            if (_from === 0) _from = this.maxNumber;
        }

        // if (_to >= this.maxNumber) _to = this.maxNumber - 1;
        if (_from === _to) return;

        animate({
            from: _from * this.height,
            to: _to * this.height,
            duration: _duration,
            onUpdate: (value) => {
                this.el.main.style.transform = `translate3d(0, -${value}px, 0)`;
            },
            onComplete: () => {
                this.currentNumber = _to;
            },
        });
    }

    resize() {
        let _height = 0;

        this.el.numbers.forEach((item) => {
            if (item.offsetHeight > _height) _height = item.offsetHeight;
        });

        this.target.style.height = `${_height}px`;
        this.height = _height;

        if (this.currentNumber > 0) this.roll({ from: 0, to: this.currentNumber }); // reset position
    }
}
