// A generic game, subclass and add specific initialisation and features
class Game {
    constructor() {
        // Physics updates run at a fixed frequency, independent of rendering
        // frame rate.
        this.physicsPerSecond = 25;
        this.physicsFrameTime = 1000 / this.physicsPerSecond;
        this.framesBeforeDrop = 5;

        this.resetTiming();

        // Performance metrics
        this.skippedUpdates = 0;
        this.multiUpdates = 0;
        this.maxMultiUpdate = 0;

        // world
        this.physicsSystem = new PhysicsSystem({minX: 0, minY:0, maxX:100, maxY:100});

        // Frame control
        this.nextRAF = this.gameloop;
        this.abort = false;
    }

    run() {
        window.requestAnimationFrame(this.nextRAF.bind(this));
    }

    end() {
        this.abort = true;
    }

    update(physicsFrameTime) {
    }

    render(interpolate) {
    }

    resetTiming() {
        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.physicsFrameTimeAccumulator = this.startTime;
    }

    gameloop(time) {
        if (this.abort) return;

        const timeSinceStart = time - this.startTime;

        this.rAFId = window.requestAnimationFrame(this.nextRAF.bind(this));

        const frameTime = time - this.lastTime;
        this.lastTime = time;

        try {
            let loops = 0;
            while (performance.now() > this.physicsFrameTimeAccumulator && loops < this.framesBeforeDrop) {
                // using a frameTime less than the full physicsFrameTime to get the 
                // hands behaving properly when an absurdly low physics fps is set.
                // Wouldn't bother in a proper game loop with a high physics fps.
                this.update(this.physicsFrameTime);
                this.physicsFrameTimeAccumulator += this.physicsFrameTime;
                loops ++;
            }

            // Log some performanc metrics
            if (loops === 0) this.skippedUpdates++;
            else if (loops > 1) {
                this.multiUpdates++;
                if (loops > this.maxMultiUpdate) this.maxMultiUpdate = loops;
            }

            // Run rendering update, pass the interpolate value, which indicates
            // (using a value between 0 and 1) how far between physics updates we are.
            this.render((performance.now() + this.physicsFrameTime - this.physicsFrameTimeAccumulator) / this.physicsFrameTime);
        } catch(e) {
            // Next rAF already registered. We need to make sure it doesn't do anything.
            console.error('Bailing out!');
            window.cancelAnimationFrame(this.rAFId);
            this.abort = true;
            throw e;
        }
    }
}
