import {Keyboard} from '../2dGameUtils';
import {Game} from '../2dGameUtils';
import {Rect} from '../2dGameUtils';

import {RenderObject, RenderText, Renderer} from '../renderer';

import {PhysicsSystem} from '../physics';

import {Scenario} from './scenario.js';

const textStyle = {
    fontFamily:     'Share Tech Mono, Serif',
    fontVariant:    'small-caps',
    fontSize:       64,
    fill:           0x2D6E54FF,
    strokeThickness: 4,
    align:          'center'
};

export class SpaceGame extends Game {
    constructor(renderer, gameData) {
        super();
        this.renderer = renderer;
        this.uiLayer = this.renderer.createScreenLayer();
        this.physicsSystem = new PhysicsSystem();
        this.gameData = gameData;
    }

    run(scenarioData) {
        this.scenario = new Scenario(this, this.gameData, scenarioData);

        const worldBounds = this.scenario.getBounds();
        this.renderer.setBounds(worldBounds.width, worldBounds.height);
        this.physicsSystem.setBoundaries(worldBounds);

        this.changeMode('start');

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
        this.scenario.update(this.physicsFrameTime);
        this.physicsSystem.update(this.physicsFrameTime);
    }

    render(interoplate) {
        this.scenario.updateRenderer();
        this.renderer.renderFrame();
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
                console.log('Get Ready...');
                this.statusText = new RenderText('Get Ready...', textStyle, this.uiLayer) .center(new Rect(0, 0, this.renderer.width, this.renderer.height));
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
                this.statusText = new RenderText('Paused.', textStyle, this.uiLayer) .center(new Rect(0, 0, this.renderer.width, this.renderer.height));
                break;
            case 'end':
                this.nextRAF = this.endGameLoop;
                console.log('Game Over.');
                this.statusText = new RenderText('Game Over.', textStyle, this.uiLayer) .center(new Rect(0, 0, this.renderer.width, this.renderer.height));
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
        this.render();
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
        this.render();
    }

    endGameLoop(time) {
        // Will only run once.
        console.log(`skipped updates (good) = ${this.skippedUpdates}`);
        console.log(`multi updates (bad) = ${this.multiUpdates}`);
        console.log(`max multi update = ${this.maxMultiUpdate}`);    
        this.render();
        this.end();
    }
}
