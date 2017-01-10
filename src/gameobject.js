"use strict";

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

class ControlledObject extends ObservableMixin(Object) {
    constructor(renderObject, physicsModel) {
        super();
        this.renderObject = renderObject;
        this.physicsModel = physicsModel;
        this.controlBindings = [];
        this.target = undefined;

        this.stats = {"hp": 100};
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

     damage(hp) {
        const oldHP = this.stats.hp;
        this.stats.hp -= hp;
        if (this.stats.p <= 0) {
            this.stats.hp = 0;
            this.notifyObservers('death', oldHP, this.stats.hp); 
            return;
        }
        this.notifyObservers('damage', oldHP, this.stats.hp); 
     }
}

// methods in this class must be called with a ControlledObject bound
const PlayerControl = {
    "rotateLeft": function(keyState) {
        if (keyState) this.physicsModel.rotate(1);
    },
    "rotateRight": function(keyState) {
        if (keyState) this.physicsModel.rotate(-1);
    },
    "setThruster": function(i, keyState) {
        this.physicsModel.thruster(i).firing = keyState;
    },
    "fireCannon": function () {
    },
    "tractor": function(keyState) {
        if (keyState) {
            console.log('tractor beam engaged');
            this.target.physicsModel.addExternalForce(
                vector2dFromPoints(this.target.physicsModel.position, this.physicsModel.position)
                .normalise()
                .multiply(0.1),
                1000
            );
        }
    }
}

// Must have a ControlledObject, or similar, bound.
function playerCollisionHandler(ctxt, b) {
    console.log(`${this.physicsModel.toString()} collided with object of mass ${b.mass}`);

    // collision between player and some other object is based
    // on the relative masses of the objects.

    // TODO: work out equation for this damage
    this.damage(b.mass * this.physicsModel.mass / b.mass);
}

function createPlayerFromConfig(physicsSystem, config) {
    const render = config.render;
    const physics = config.physics;
    const control = config.control;
    const physicsModel = new PhysicsModel(physicsSystem, physics.boundingRadius, physics.mass, physics.position);

    for (let thruster of physics.thrusters) {
        physicsModel.createThruster(thruster.power, thruster.angle);
    }

    const player =
        new ControlledObject(
            createRenderObject(render.asset, render.size),
            physicsModel
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
