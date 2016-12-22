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
        super.run();
    }

    end() {
        super.end();
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
