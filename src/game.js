// A generic game, subclass and add specific initialisation and features
class Game {
    constructor() {
        // Physics updates run at a fixed frequency, independent of rendering
        // frame rate.
        this.physicsPerSecond = 25;
        this.physicsFrameTime = 1000 / this.physicsPerSecond;
        this.framesBeforeDrop = 5;

        this.startTime = performance.now();
        this.lastTime = this.startTime;
        this.physicsFrameTimeAccumulator = this.startTime;

        // Performance metrics
        this.skippedUpdates = 0;
        this.multiUpdates = 0;
        this.maxMultiUpdate = 0;

        // world
        this.physicsSystem = new PhysicsSystem({minX: 0, minY:0, maxX:100, maxY:100});
    }

    run() {
    }

    end() {
    }

    update(physicsFrameTime) {
    }

    render(interpolate) {
    }

    gameloop(time) {
        const timeSinceStart = time - this.startTime;

        if (timeSinceStart <= 60000) {
            // run for one minute
            window.requestAnimationFrame(this.gameloop.bind(this));
        } else {
            console.log(`skipped updates (good) = ${this.skippedUpdates}`);
            console.log(`multi updates (bad) = ${this.multiUpdates}`);
            console.log(`max multi update = ${this.maxMultiUpdate}`);    
            this.end();
            return;
        }

        const frameTime = time - this.lastTime;
        this.lastTime = time;

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
    }
}

class SpaceGame extends Game {
    constructor() {
        super();

        this.players = [
            createPlayerFromConfig(this.physicsSystem, {
                "render": {
                    "asset":        "tri",
                    "size":         10
                },
                "physics": {
                    "position": {"x": 30, "y": 50},
                    "boundingRadius":   5,
                    "mass":         10,
                    "rotateRate":   10,
                    "maxSpeed":     10,
                    "thrusters": [
                        {"power": 10, "angle": 0},
                        {"power": 10, "angle": 180}
                    ]
                },
                "control": {
                    "thrust":       [Keyboard.KEY_UP, Keyboard.KEY_DOWN],
                    "rotate_left":  Keyboard.KEY_LEFT,
                    "rotate_right": Keyboard.KEY_RIGHT,
                    "tractor":      Keyboard.KEY_SPACE
                }
            }),
            createPlayerFromConfig(this.physicsSystem, {
                "render": {
                    "asset":        "tri",
                    "size":         5
                },
                "physics": {
                    "position": {"x": 60, "y": 50},
                    "boundingRadius":   2.5,
                    "mass":         5,
                    "rotateRate":   20,
                    "maxSpeed":     10,
                    "thrusters": [
                        {"power": 10, "angle": 0}
                    ]
                },
                "control": {
                    "thrust":       [Keyboard.KEY_W],
                    "rotate_left":  Keyboard.KEY_A,
                    "rotate_right": Keyboard.KEY_D
                }
            })
        ];

        // fix targetting for now since there's only two ships
        this.players[0].target = this.players[1];
        this.players[1].target = this.players[0];

        for (let player of this.players) {
            this.physicsSystem.add(player.physicsObject);
        }
    }

    run() {
        window.addEventListener('keydown', Keyboard.keydown_handler);
        window.addEventListener('keyup', Keyboard.keyup_handler);

        window.requestAnimationFrame(this.gameloop.bind(this));
    }

    end() {
        window.removeEventListener('keydown', Keyboard.keydown_handler);
        window.removeEventListener('keyup', Keyboard.keyup_handler);
    }

    update(time) {
        for (let player of this.players) {
            player.update();
        }
        this.physicsSystem.update(this.physicsFrameTime);
    }

    render(interoplate) {
        for (let player of this.players) {
            player.renderObject.rotate(player.physicsObject.rotateAngle);
            player.renderObject.moveTo(player.physicsObject.position.x, player.physicsObject.position.y);
        }
    }
}

window.onload = function() {
    const game = new SpaceGame();
    game.run();
}
