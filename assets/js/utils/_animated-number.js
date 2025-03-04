class _animatedNumber {
    constructor(props) {
        if (!window._animatedNumber) window._animatedNumber = []; // storage for all animated numbers

        this.target = props.target ?? null;

        this.number = {
            from: props.from ?? 0,
            to: props.to ?? 0,
        };
        if (this.number.from === this.number.to) this.number.from = 0;

        this.duration = props.duration ?? 500;
        this.steps = props.steps ?? 10;
        this.stepSize =
            (this.number.to > this.number.from
                ? this.number.to - this.number.from
                : this.number.from - this.number.to) / this.steps;

        this.interval = null;
        this.intervalTime = this.duration / this.steps;

        this.animating = false;

        if (this.target) this.init(props.callback ?? null);
    }

    init(callback) {
        window._animatedNumber.forEach((instance) => {
            if (instance.target === this.target) instance.stop(); // stop other instances with the same target
        });
        window._animatedNumber.push(this); // add instance to storage

        this.animate(callback);

        // console.log("_animatedNumber", this);
    }

    animate(callback) {
        this.animating = true;

        let _currentNumber = this.number.from;
        this.updateText(_currentNumber);

        let _stepCount = 0;
        this.interval = setInterval(() => {
            if (this.number.to > this.number.from) {
                _currentNumber += this.stepSize;
            } else {
                _currentNumber -= this.stepSize;
            }

            _stepCount++;
            this.updateText(Math.round(_currentNumber));

            if (_stepCount >= this.steps) {
                this.stop();

                this.updateText(this.number.to);

                if (callback) callback(this);
            }
        }, this.intervalTime);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;

        this.animating = false;

        const _index = window._animatedNumber.indexOf(this);
        if (_index > -1) window._animatedNumber.splice(_index, 1);
    }

    updateText(value) {
        if (!this.target) return;

        this.target.innerText = parseFloat(value).toLocaleString();
    }
}
