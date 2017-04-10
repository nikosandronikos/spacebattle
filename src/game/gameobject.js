import {mixin, ObservableMixin} from '../2dGameUtils';
import {Vector2d} from '../2dGameUtils';
import {Keyboard} from '../2dGameUtils';
import {Log} from '../2dGameUtils';

import {PhysicsModel} from '../physics/physics';

// Must have a GameObject, or subclass, bound.
function gameObjectCollisionHandler(b, origMotion, newMotion) {
    console.log(`${this.name} and ${b.name} involved in collision.`);
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

export class GameObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        this.name = 'GameObject';
        this.scenario = scenario;
        this.renderObject = renderObject
        this.physicsModel = physicsModel;
        this.stats = stats;
        this.physicsModel.addObserver('collision', gameObjectCollisionHandler, this);
        this.physicsModel.name = this.name;
    }

    destroy() {
        this.physicsModel.destroy();
        this.renderObject.destroy();
    }

    damage(hp) {
        const oldHP = this.stats.hp;
        this.stats.hp -= hp;
        console.log(`${this.name} took ${hp} damage, now at ${this.stats.hp} hp.`);
        if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.notifyObservers('death', oldHP, this.stats.hp); 
            return;
        }
        this.notifyObservers('damage', oldHP, this.stats.hp); 
    }

    die() {
    }

    update() {
    }

    updateRenderer() {
        this.renderObject.rotate(this.physicsModel.rotateAngle);
        this.renderObject.moveTo(this.physicsModel.position.x, this.physicsModel.position.y);
    }
}
mixin(GameObject, ObservableMixin);

let aiCounter = 0;

class AIObject extends GameObject {
    constructor(scenario, renderObject, physicsModel, controllerFn, stats) {
        super(scenario, renderObject, physicsModel, stats);
        this.name = `AI_${aiCounter++}`;
        this.target = undefined;
        this.controllerFn = controllerFn.bind(this);
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
        this.physicsModel.name = this.name;
    }

    update() {
        this.controllerFn();
    }
}

let controlledCounter = 0;

class ControlledObject extends GameObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        super(scenario, renderObject, physicsModel, stats);
        this.name = `Player_${controlledCounter++}`;
        this.controlBindings = [];
        this.target = undefined;
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
        this.physicsModel.name = this.name;
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
        if (keyState) this.fireCannon();
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

export function createPlayerFromConfig(scenario, physicsSystem, config) {
    const physics = config.physics;
    const control = config.control;
    const physicsModel = new PhysicsModel(physicsSystem, physics.boundingRadius, physics.mass, physics.position);

    for (let thruster of physics.thrusters) {
        physicsModel.createThruster(thruster.power, thruster.angle);
    }

    const player =
        new ControlledObject(
            scenario,
            config.sprite,
            physicsModel,
            config.stats
        );

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
