import bgmSrc from '../audio/bgm.m4a'

class Bgm{
    constructor() {
        this.audio = null;
        this.events = ['touchstart', 'mousedown', 'keydown'];
        this.tryPlay = this.tryPlay.bind(this);
    }
    init() {
        if( this.audio ) {
            return this.audio;
        }
        this.audio = new Audio(bgmSrc);
        this.audio.loop = true;
        this.audio.preload = 'auto';
        this.audio.volume = 0.35;

        this.events.forEach(eventName => {
            window.addEventListener(eventName, this.tryPlay, true);
        });

        this.tryPlay();
        return this.audio;
    }
    tryPlay() {
        if( !this.audio ) {
            return;
        }
        let playTask = this.audio.play();
        if( playTask && typeof playTask.then === 'function' ) {
            playTask.then(() => {
                this.removeListeners();
            }).catch(() => {});
        } else {
            this.removeListeners();
        }
    }
    removeListeners() {
        this.events.forEach(eventName => {
            window.removeEventListener(eventName, this.tryPlay, true);
        });
    }
}

export default new Bgm();
