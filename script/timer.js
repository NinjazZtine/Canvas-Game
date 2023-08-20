class Timer {
    constructor(interval, cFunction) {
        this.timer = 0;
        this.interval = interval;
        this.cFunction = cFunction;
    }

    update(timeElapsed) {
        if (this.timer > this.interval) {
            this.cFunction();
            this.timer = 0;
        } else {
            this.timer += timeElapsed;
        }
    }
}
