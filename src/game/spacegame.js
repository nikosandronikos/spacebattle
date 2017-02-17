import {Keyboard} from '../2dGameUtils/src/input';
import {Game} from '../2dGameUtils/src/game';
import {Rect} from '../2dGameUtils/src/geometry';

import {RenderObject, Renderer} from '../renderer';

import {PhysicsSystem} from '../physics';

import {createPlayerFromConfig} from './gameobject';
//import {createRenderText} from '../RenderObject';

function pickAStar(layerNum) {
    const starCols = [
        'Big Red',
        'Big Blue',
        'Big Bright Blue',
        'Med Red',
        'Med Light Blue',
        'Med Bright Blue',
        'Med Green',
        'Med Yellow',
        'Med Purple',
        'Small Blue',
        'Small White',
        'Small Light Blue',
    ];
    const starSelection = [{min: 9, max: 12}, {min: 3, max: 12}, {min: 0, max: 12}][layerNum];
    const n = Math.random();
    const selection = ~~(Math.random() * (starSelection.max - starSelection.min)) + starSelection.min;
    return `Stars_001-${starCols[selection]}-${selection}`;
}

export class SpaceGame extends Game {
    constructor(renderer) {
        super();
        this.renderer = renderer;
        this.physicsSystem = new PhysicsSystem({minX: 0, minY:0, maxX:renderer.bounds.x, maxY:renderer.bounds.y});

        const nStarDefs = 12;

        for (let layer = 25, layerNum = 0; layerNum < 3; layer *= 2, layerNum++) {
            const sceneryLayer = renderer.createSceneryLayer(layer);

            renderer.layers[100 - layer] = sceneryLayer;
            for (let i = 0; i < 500 * layer; i++) {
                sceneryLayer.addSprite(
                    Math.random() * renderer.bounds.x,
                    Math.random() * renderer.bounds.y,
                    pickAStar(layerNum)
                );
            }
        }

        this.playerLayer = renderer.createLayer(100);
        Renderer.playerLayer = this.playerLayer;

        //renderer.viewPort.lookAtRect(new Rect(750,550,1050,750));
        this.players = [
            createPlayerFromConfig(this.physicsSystem, {
                "sprite": RenderObject.createFromConfig('uship', this.playerLayer),
                "physics": {
                    "position": {"x": 300, "y": 50},
                    "boundingRadius":   22,
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
                "sprite": RenderObject.createFromConfig('uship', this.playerLayer),
                "physics": {
                    "position": {"x": 600, "y": 500},
                    "boundingRadius":   22,
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
            player.renderObject.applyConfig('engineStart');
            player.update();
        }

        this.changeMode('start');
    }

    run() {
        document.addEventListener('focus', Keyboard.resetAllKeys);
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
        this.renderer.viewPort.lookAtRect(
            new Rect(
                this.players[0].physicsModel.position.x,
                this.players[0].physicsModel.position.y,
                this.players[1].physicsModel.position.x,
                this.players[1].physicsModel.position.y
            ).expand(50,50)
        );

        this.physicsSystem.update(this.physicsFrameTime);
    }

    render(interoplate) {
        this.renderer.renderFrame();
    }

    changeMode(newMode) {
        switch (this.mode) {
            case 'start':
            case 'pause':
            case 'end':
                //this.statusText.remove();
                //this.statusText = null;
                break;
        }

        switch (newMode) {
            case 'start':
                this.nextRAF = this.startGameLoop;
                console.log('Get Ready...');
                //this.statusText = createRenderText('Get Ready...', 8).moveTo(30,50);
                break;
            case 'run':
                this.resetTiming();
                this.nextRAF = this.gameloop;
                console.log('Go!!');
                break;
            case 'pause':
                Keyboard.ignoreUntilReleased(Keyboard.KEY_ESC);
                this.nextRAF = this.pausedGameLoop
                console.log('Paused.');
                //this.statusText = createRenderText('Paused.', 8).moveTo(40,50);
                break;
            case 'end':
                this.nextRAF = this.endGameLoop;
                console.log('Game Over.');
                //this.statusText = createRenderText('Game Over.', 8).moveTo(35,50);
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
        this.render();
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
        //createRenderText(`Player ${playerIndex} died.`, 8).moveTo(35, 40);
        this.changeMode('end');
    }
}
