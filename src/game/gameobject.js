import {mixin, ObservableMixin} from '../2dGameUtils';
import {Vector2d} from '../2dGameUtils';
import {Keyboard} from '../2dGameUtils';

import {PhysicsModel} from '../physics/physics';

// This is a specialsied player object, but ultimately I want to generalise
// this but allow input from different sources.
/*
class Universe {
    constructor() {
        this.players = [];
        this.robots = [];
        this.inanimate = [];
    }

    // pass in an object with the following keys:
    // { render: {asset, size}, physics: {mass}, controls: {}}
    function addPlayer(config) {
        const player =
            new PlayerObject(
                createRenderObject(config.render.asset, config.render.size),
                new PhysicsModel(config.render.size, config.physics.mass)
            );
        this.players.push(player);
    }
}
*/

export class GameObject {
    constructor(renderObject, physicsModel, stats) {
        this.renderObject = renderObject
        this.physicsModel = physicsModel;
        this.stats = stats;
    }

    update() {
    }

    damage(hp) {
        const oldHP = this.stats.hp;
        this.stats.hp -= hp;
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.notifyObservers('death', oldHP, this.stats.hp); 
            return;
        }
        this.notifyObservers('damage', oldHP, this.stats.hp); 
    }
}
mixin(GameObject, ObservableMixin);

class AIObject extends GameObject {
    constructor(renderObject, physicsModel, controllerFn, stats) {
        super(renderObject, physicsModel, stats);
        this.target = undefined;
        this.controllerFn = controllerFn.bind(this);

    }

    update() {
        this.controllerFn();
    }
}

class ControlledObject extends GameObject {
    constructor(renderObject, physicsModel, stats) {
        super(renderObject, physicsModel, stats);
        this.controlBindings = [];
        this.target = undefined;
    }

    bindKeyboardControl(key, actionFn, extraParams = []) {
        const boundActionFn = actionFn.bind(this, ...extraParams);
        this.controlBindings.push(
            function() {
                boundActionFn(Keyboard.pressed(key));
            }
        );
    }

    update() {
        this.physicsModel.rotate(0);

        for (let binding of this.controlBindings)
            binding();

        this.renderObject.rotate(this.physicsModel.rotateAngle);
        this.renderObject.moveTo(this.physicsModel.position.x, this.physicsModel.position.y);

     }
}

// methods in this class must be called with a ControlledObject bound
const PlayerControl = {
    "rotateLeft": function(keyState) {
        if (keyState) this.physicsModel.rotate(-1);
    },
    "rotateRight": function(keyState) {
        if (keyState) this.physicsModel.rotate(1);
    },
    "setThruster": function(i, keyState) {
        // If there's multiple thrusters, i specifies the
        // index of the thruster being controlled.
        if (i === 0) {
            // Only worry about the thruster out the back for rendering the engine effect
            const wasEngineOn = this.engineOn;
            this.engineOn = keyState;
            if (!wasEngineOn && this.engineOn)
                this.renderObject.applyConfig('engineStart');
            else if (wasEngineOn && !this.engineOn)
                this.renderObject.applyConfig('engineOff');
        }
        this.physicsModel.thruster(i).firing = keyState;
    },
    "fireCannon": function () {
    },
    "tractor": function(keyState) {
        if (keyState) {
            console.log('tractor beam engaged');
            this.target.physicsModel.addExternalForce(
                Vector2d.createFromPoints(this.target.physicsModel.position, this.physicsModel.position)
                .normalise()
                .multiply(0.1),
                1000
            );
        }
    }
}

// Must have a ControlledObject, or similar, bound.
function playerCollisionHandler(b, origMotion, newMotion) {
    let angleDiff = origMotion.vector.angleTo(newMotion.vector);
    if (angleDiff > Math.PI) angleDiff -= Math.PI;

    const v1 = origMotion.vector.length;
    const v2 = newMotion.vector.length;

    const maxV = Math.max(v1, v2);
    const minV = Math.min(v1, v2);

    const velocityDiff = minV === 0 ? maxV : maxV / minV;

    const massDiff = b.mass / this.physicsModel.mass;

    this.damage(10 * (angleDiff + 0.2) * velocityDiff * massDiff);
}

export function createPlayerFromConfig(physicsSystem, config) {
    const physics = config.physics;
    const control = config.control;
    const physicsModel = new PhysicsModel(physicsSystem, physics.boundingRadius, physics.mass, physics.position);

    for (let thruster of physics.thrusters) {
        physicsModel.createThruster(thruster.power, thruster.angle);
    }

    const player =
        new ControlledObject(
            config.sprite,
            physicsModel,
            config.stats
        );
    player.renderObject.moveTo(config.physics.position.x, config.physics.position.y);

    physicsModel.addObserver('collision', playerCollisionHandler, player);

    for (let key in control) {
        switch (key) {

            case "thrust":
                for (let i = 0; i < control.thrust.length; i++) {
                    player.bindKeyboardControl(
                        control.thrust[i],
                        PlayerControl.setThruster, [i]
                    );
                }
                break;
            case "rotate_left":
                player.bindKeyboardControl(control[key], PlayerControl.rotateLeft);
                break;
            case "rotate_right":
                player.bindKeyboardControl(control[key], PlayerControl.rotateRight);
                break;
            case "cannon":
                player.bindKeyboardControl(control[key], PlayerControl.fireCannon);
                break;
            case "tractor":
                player.bindKeyboardControl(control[key], PlayerControl.tractor);
                break;
        }
    }
 
    return player;
}
