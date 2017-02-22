import {Renderer} from '../renderer';
import {RendererAssets} from '../../assets/config.js';

import {SpaceGame} from './spacegame';

export const GameLoader = {
    init: function() {
        Renderer.init(window.innerWidth, window.innerHeight);
    },

    loadAssets: function(onCompleteFn) {
        Renderer.loadAssets(RendererAssets, onCompleteFn);
    },

    start: function() {
        this.game = new SpaceGame(Renderer);
        this.game.run();
    }
};
