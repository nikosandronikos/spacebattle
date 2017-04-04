import {Rect, Point, Vector2d} from '../2dGameUtils';
import {LinkedList} from '../2dGameUtils/';
import {Keyboard} from '../2dGameUtils/';

import {PhysicsModel} from '../physics/physics';
import {RenderObject} from '../renderer/';

import {AsteroidObject, PlanetObject} from './props.js';

import {createPlayerFromConfig} from './gameObject.js';
import {Spawner} from './spawner.js';

export class Player {
    constructor(name, bindings) {
        this.name = name;
        this.bindings = bindings;
    }

    getNextShip() {
        return 'uship';
    }
}

// Holds the current state of objects in the world and can be passed around
// to objects that need to know this information.
class WorldState {
    constructor() {
        this.players = []; //= new LinkedList();
        this.props = new LinkedList();
    }

    allObjectsIterator() {
        const iter = {};
        iter[Symbol.iterator] = (function* () {
            for (let obj of this.players) yield obj;
            for (let obj of this.props) yield obj;
        }).bind(this);
        return iter;
    }
}

// Scenario is like a world + timed events
export class Scenario {
    constructor(game, gameData, scenarioCfg) {
        this.game = game;
        this.gameData = gameData;
        this.config = scenarioCfg;
        this.worldState = new WorldState();

        // generate stars
        this.mainView = this.game.renderer.createViewPort(
            new Rect(0, 0, this.game.renderer.bounds.x, this.game.renderer.bounds.y)
        );

        this.layers = {};
        for (let layer of scenarioCfg.mapLayers) {
            this.layers[layer.name] = this.mainView.createSceneryLayer(layer.parallax);
        }

        this.playerLayer = this.mainView.createLayer();
        this.layers['player'] = this.playerLayer;

        this.worldState.players.push(
            createPlayerFromConfig(this.game.physicsSystem, {
                sprite: new RenderObject('uship', this.playerLayer),
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
                    "fireCannon":      Keyboard.KEY_SPACE,
                    "fireCannon":      Keyboard.LEFT_SHIFT
                },
                stats: {
                    hp: 100
                }
            })
        );
        this.worldState.players.push(
            createPlayerFromConfig(this.game.physicsSystem, {
                "sprite": new RenderObject('uship', this.playerLayer),
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
        );

        //FIXME: Death of anything is ending the game
        this.worldState.players[0].addObserver('death', this.playerDeathHandler, this, 0);
        this.worldState.players[1].addObserver('death', this.playerDeathHandler, this, 1);

        // fix targetting for now since there's only two ships
        this.worldState.players[0].target = this.worldState.players[1];
        this.worldState.players[1].target = this.worldState.players[0];

        this.spawns = [];

        for (let obj of scenarioCfg.map) {
            this.createMapObject(obj);
        }
    }

    createMapObject(cfg) {
        console.log(`createMapObject of type ${cfg.type}`);
        switch (cfg.type) {
            case 'spawn':
                this.spawns.push(new Spawner(this, cfg));
                break;
            case 'prop':
                this.createProp(
                    cfg.prop,
                    cfg.position,
                    'motion' in cfg ? cfg.motion : null,
                    cfg.layer
                ); 
                break;
            case 'propField':
                this.createPropField(cfg);
                break;
        }
    }

    createPropField(fieldCfg) {
        // FIXME: For some reason, if propField and props exist in the same 
        // layer, and the props are defined after the propField, then the
        // props do not show. I have no idea why.
        for (let i = 0; i < fieldCfg.number; i++) {
            const x = fieldCfg.position.x + Math.random() * (fieldCfg.spawnOffset.x * 2) - fieldCfg.spawnOffset.x;
            const y = fieldCfg.position.y + Math.random() * (fieldCfg.spawnOffset.y * 2) - fieldCfg.spawnOffset.y;
            let propName = fieldCfg.prop;

            if (Array.isArray(propName)) {
                propName = propName[~~(Math.random() * propName.length)];
            }
            const prop = this.gameData.props[propName];

            if ('physics' in prop) {
                // TODO: Support motion
                this.createProp(propName, {x, y}, {x:0, y:0}, fieldCfg.layer);
            } else {
                // If no physics, this is just a visual thing with no
                // update method and no stats at all.
                this.layers[fieldCfg.layer].addSprite(x, y, prop.sprite);
            }
        }
    }

    createProp(propName, position, motion, layerName) {
        const propCfg = this.gameData.props[propName];        
        console.log(`Creating prop ${propCfg.sprite} at ${position.x},${position.y} in ${layerName}`);
        if ('physics' in propCfg) {
            const gameObject =
                new propCfg.controller(
                    new RenderObject(propCfg.sprite, this.layers[layerName]),
                    new PhysicsModel(
                        this.game.physicsSystem,
                        propCfg.physics.boundingRadius,
                        propCfg.physics.mass,
                        position,
                        motion
                    ),
                    propCfg.stats
                );
            const linkedListNode = this.worldState.props.push(gameObject);
            gameObject.addObserver('death', this.propDeathHandler, this, linkedListNode);
        } else {
            console.log(`${position.x}, ${position.y}`);
            this.layers[layerName].addSprite(position.x, position.y, propCfg.sprite);
        }
    }

    getBounds() {
        return new Rect(0, 0, this.config.bounds.x, this.config.bounds.y);
    }

    removeObject(object) {
    }

    update(timeDelta) {
        for (let player of this.worldState.players) {
            player.update();
        }
        this.mainView.lookAtRect(
            new Rect(
                this.worldState.players[0].physicsModel.position.x,
                this.worldState.players[0].physicsModel.position.y,
                this.worldState.players[1].physicsModel.position.x,
                this.worldState.players[1].physicsModel.position.y
            ).expand(50,50)
        );

        for (const spawner of this.spawns) {
            spawner.update(timeDelta);
        }

        for (const obj of this.worldState.allObjectsIterator()) {
            obj.update(timeDelta, this.worldState);
        }
    }

    updateRenderer() {
        this.worldState.players.forEach(player => player.updateRenderer());
        for (const o of this.worldState.allObjectsIterator()) o.updateRenderer();
    }

    playerDeathHandler(playerIndex, oldHP, newHP) {
        console.log('someone died');
        //createRenderText(`Player ${playerIndex} died.`, 8).moveTo(35, 40);
        this.game.changeMode('end');
    }

    propDeathHandler(linkedListNode) {
        console.log(`got notification that ${linkedListNode.data.name} died.`);
        this.worldState.props.remove(linkedListNode);
    }
}

