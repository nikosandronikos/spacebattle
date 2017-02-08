import {Keyboard} from '../2dGameUtils/src/input';
import {Game} from '../2dGameUtils/src/game';

import {PhysicsSystem} from '../physics';

import {createPlayerFromConfig} from './gameobject';
import {createRenderText} from '../RenderObject';

export class SpaceGame extends Game {
    constructor() {
        super();

        // world
        this.physicsSystem = new PhysicsSystem({minX: 0, minY:0, maxX:100, maxY:100});

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
                },
                stats: {
                    hp: 100
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
                },
                stats: {
                    hp: 80
                }
            })
        ];

        this.players[0].addObserver('death', this.playerDeathHandler, this, 0);
        this.players[1].addObserver('death', this.playerDeathHandler, this, 1);

        // fix targetting for now since there's only two ships
        this.players[0].target = this.players[1];
        this.players[1].target = this.players[0];

        for (let player of this.players) {
            this.physicsSystem.add(player.physicsModel);
        }

        this.changeMode('start');
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
            player.renderObject.rotate(player.physicsModel.rotateAngle);
            player.renderObject.moveTo(player.physicsModel.position.x, player.physicsModel.position.y);
        }
    }

    changeMode(newMode) {
        switch (this.mode) {
            case 'start':
            case 'pause':
            case 'end':
                this.statusText.remove();
                this.statusText = null;
                break;
        }

        switch (newMode) {
            case 'start':
                this.nextRAF = this.startGameLoop;
                this.statusText = createRenderText('Get Ready...', 8).moveTo(30,50);
                break;
            case 'run':
                this.resetTiming();
                this.nextRAF = this.gameloop;
                break;
            case 'pause':
                Keyboard.ignoreUntilReleased(Keyboard.KEY_ESC);
                this.nextRAF = this.pausedGameLoop
                this.statusText = createRenderText('Paused.', 8).moveTo(40,50);
                break;
            case 'end':
                this.nextRAF = this.endGameLoop;
                this.statusText = createRenderText('Game Over.', 8).moveTo(35,50);
                break;
        }

        this.mode = newMode;
    }

    gameloop(time) {
        if (Keyboard.pressed(Keyboard.KEY_ESC)) {
            this.changeMode('pause');
            this.rAFId = window.requestAnimationFrame(this.nextRAF.bind(this));
            return;
        }
        super.gameloop(time);
    }

    startGameLoop(time) {
        if (this.abort) return;
        if (Keyboard.anyKeyDown()) {
            this.changeMode('run');
        }
        this.rAFId = window.requestAnimationFrame(this.nextRAF.bind(this));
    }

    pausedGameLoop(time) {
        if (this.abort) return;
        if (Keyboard.pressed(Keyboard.KEY_ESC)) {
            console.log('ending');
            this.changeMode('end');
        } else if (Keyboard.anyKeyDown()) {
            console.log('running');
            this.changeMode('run');
        }
        this.rAFId = window.requestAnimationFrame(this.nextRAF.bind(this));
    }

    endGameLoop(time) {
        // Will only run once.
        console.log(`skipped updates (good) = ${this.skippedUpdates}`);
        console.log(`multi updates (bad) = ${this.multiUpdates}`);
        console.log(`max multi update = ${this.maxMultiUpdate}`);    
        this.end();
    }

    playerDeathHandler(playerIndex, oldHP, newHP) {
        console.log('someone died');
        createRenderText(`Player ${playerIndex} died.`, 8).moveTo(35, 40);
        this.changeMode('end');
    }
}
