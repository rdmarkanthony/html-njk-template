const { animate } = window.popmotion;
class _rollingNumber {
    constructor(props) {
        this.target = props.target ?? null;
        this.debug = props.debug ?? false;

        this.el = {
            main: document.createElement("div"),
            numbers: [],
        };

        this.height = 0;

        this.duration = props.duration ?? 500;
        this.currentNumber = null;

        if (this.target) this.init();
    }

    init() {
        this.target.appendChild(this.el.main);
        this.target.style.position = "relative";
        this.target.style.overflow = "hidden";
        this.el.main.style.pointerEvents = "none";
        this.el.main.style.willChange = "transform";

        this.createNumbers();

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        if (this.debug) console.log("_rollingNumber", this);
    }

    createNumbers() {
        for (let i = 0; i < 10; i++) {
            let _number = document.createElement("div");
            _number.innerText = i;
            this.el.numbers.push(_number);
            this.el.main.appendChild(_number);
        }
    }

    roll(props) {
        const _from = props.from ?? this.currentNumber ?? 0;
        const _to = props.to ?? 0;
        const _duration = props.duration ?? this.duration;

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
    }
}
