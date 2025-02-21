class _inview {
    constructor(props) {
        this.target = props.target ?? null;

        if (this.target) this.init();
    }

    init() {
        console.log(this);
    }
}
