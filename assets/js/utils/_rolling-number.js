class _rollingNumber {
    constructor(props) {
        this.target = props.target ?? null;
        this.debug = props.debug ?? false;

        this.el = {
            main: document.createElement("div"),
            numbers: [],
        };

        this.speed = props.speed ?? 10;
        this.currentNumber = null;

        if (this.target) this.init();
    }

    init() {
        this.target.appendChild(this.el.main);
        this.el.main.style.position = "relative";
        this.el.main.style.overflow = "hidden";
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
        const _speed = props.speed ?? this.speed;
    }

    resize() {
        let _height = 0;
        this.el.numbers.forEach((item) => {
            if (item.offsetHeight > _height) _height = item.offsetHeight;
        });

        this.el.main.style.height = `${_height}px`;
    }
}
