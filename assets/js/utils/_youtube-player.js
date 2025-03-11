// call youtube api
const _youtubeAPI = () => {
    if (typeof window.onYouTubeIframeAPIReady !== "undefined") return;

    const _tag = document.createElement("script");
    _tag.src = "https://www.youtube.com/iframe_api";

    document.head.appendChild(_tag);

    window.onYouTubeIframeAPIReady = () => {
        if (window._videoPlayer) window._videoPlayer.forEach((item) => item.generate?.());
    };
};

// for youtube players
class _youtubePlayer {
    constructor(props) {
        this.target = props.target ?? null;
        this.id = props.id ?? null;

        if (!this.target && !this.id) return;

        this.player = null;

        this.el = {
            player: this.target.querySelector(".js-yt-player") ?? document.createElement("div"),
        };

        this.autoplay = props.autoplay ?? false;
        this.controls = props.controls !== undefined ? (props.controls ? 1 : 0) : 1;
        this.stretch = props.stretch ?? false;

        this.isPlaying = false;

        this.debug = props.debug ?? false;

        this.events = props.events ?? {}; // for events eg. 'beforeInit'
        this.listeners = {};

        this.init();
    }

    init() {
        this.emit("beforeInit");

        if (!window._videoPlayer) window._videoPlayer = []; // storage for video players
        window._videoPlayer.push(this);
        _youtubeAPI(); // call yt api

        // for player/iframe
        if (!this.target.contains(this.el.player)) {
            this.target.appendChild(this.el.player);
            this.el.player.classList.add("js-yt-player");
            this.el.player.style.position = "absolute";
            this.el.player.style.top = 0;
            this.el.player.style.left = 0;
            this.el.player.style.width = `100%`;
            this.el.player.style.height = `100%`;
        }

        this.emit("afterInit");

        if (this.debug) console.log("_youtubePlayer", this);
    }

    generate() {
        this.emit("beforeReady");

        this.player = new YT.Player(this.el.player, {
            videoId: this.id,
            playerVars: {
                playsinline: 1,
                autoplay: this.autoplay ? 1 : 0,
                loop: this.autoplay ? 1 : 0,
                mute: this.autoplay ? 1 : 0,
                controls: this.controls,
                showinfo: 0,
                modestbranding: 1,
                rel: 0,
                playlist: this.autoplay ? this.id : null,
            },
            events: {
                onReady: (event) => {
                    this.emit("onReady");
                },
                onStateChange: (event) => {
                    if (event.data === 1) {
                        this.target.classList.add("video-playing");
                        this.target.classList.remove("video-paused", "video-ended");
                    } else if (event.data === 2) {
                        this.target.classList.add("video-paused");
                        this.target.classList.remove("video-playing", "video-ended");
                    } else if (event.data === 0) {
                        this.target.classList.add("video-ended");
                        this.target.classList.remove("video-playing", "video-paused");
                    }

                    // pause other playing video
                    if (event.data === 1) {
                        this.isPlaying = true;
                        if (!this.autoplay) _youtubePlayer.pauseAll(this);
                    } else {
                        this.isPlaying = false;
                    }

                    this.emit("onStateChange");
                },
            },
        });

        if (this.player.g) this.el.player = this.player.g;

        if (this.stretch) {
            if (getComputedStyle(this.target).overflow === "visible")
                this.target.style.overflow = "hidden";

            let _resizeTimer = null;
            window.addEventListener("resize", () => {
                clearTimeout(_resizeTimer);

                _resizeTimer = setTimeout(() => this.resize(), 50);
            });
            this.resize();
        }

        this.emit("afterReady");
    }

    resize() {
        if (!this.stretch) return;

        const _parent = {
            width: this.target.offsetWidth,
            height: this.target.offsetHeight,
        };
        const _new = {
            width: 0,
            height: 0,
        };
        const _aspectRatio = 16 / 9;

        if (_parent.width / _parent.height > _aspectRatio) {
            _new.width = _parent.width;
            _new.height = _parent.width / _aspectRatio;
        } else {
            _new.width = _parent.height * _aspectRatio;
            _new.height = _parent.height;
        }

        this.el.player.style.top = `${(_parent.height - _new.height) / 2}px`;
        this.el.player.style.left = `${(_parent.width - _new.width) / 2}px`;
        this.el.player.style.width = `${_new.width}px`;
        this.el.player.style.height = `${_new.height}px`;
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

    static pauseAll(currentPlayer) {
        if (window._videoPlayer)
            window._videoPlayer.forEach((item) => {
                // for youtube
                if (
                    item.player &&
                    !item.autoplay &&
                    item.player.getPlayerState &&
                    item.player.getPlayerState() === 1
                ) {
                    if (!currentPlayer || item !== currentPlayer) item.player.pauseVideo();
                }

                // for video
                if (item.el.video && !item.autoplay) {
                    if (!currentPlayer || item !== currentPlayer) item.el.video.pause();
                }
            });
    }
}
