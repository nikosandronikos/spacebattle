import {Renderer} from '../renderer';
import {rendererAssets, gameData, demoScenario} from '../../assets/config.js';

import {SpaceGame} from './spacegame';

export const GameLoader = {
    init: function() {
        Renderer.init(window.innerWidth, window.innerHeight);
    },

    loadAssets: function(onCompleteFn) {
        Renderer.loadAssets(rendererAssets, onCompleteFn);
    },

    start: function() {
        this.game = new SpaceGame(Renderer, gameData);
        this.game.run(demoScenario);
    }
};
