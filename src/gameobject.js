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
class ControlledObject {
    constructor(renderObject, physicsObject) {
        this.renderObject = renderObject;
        this.physicsObject = physicsObject;
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
        this.physicsObject.rotate(0);

        for (let binding of this.controlBindings)
            binding();

     }
}

// methods in this class must be called with a ControlledObject bound
const PlayerControl = {
    "rotateLeft": function(keyState) {
        if (keyState) this.physicsObject.rotate(1);
    },
    "rotateRight": function(keyState) {
        if (keyState) this.physicsObject.rotate(-1);
    },
    "setThruster": function(i, keyState) {
        this.physicsObject.thruster(i).firing = keyState;
    },
    "fireCannon": function () {
    },
    "tractor": function(keyState) {
        if (keyState) {
            console.log('tractor beam engaged');
            this.target.physicsObject.addExternalForce(
                vector2dFromPoints(this.target.physicsObject.position, this.physicsObject.position)
                .normalise()
                .multiply(0.1),
                1000
            );
        }
    }
}

function createPlayerFromConfig(physicsSystem, config) {
    const render = config.render;
    const physics = config.physics;
    const control = config.control;
    const physicsObject = new PhysicsModel(physicsSystem, physics.boundingRadius, physics.mass, physics.position);

    for (let thruster of physics.thrusters) {
        physicsObject.createThruster(thruster.power, thruster.angle);
    }

    const player =
        new ControlledObject(
            createRenderObject(render.asset, render.size),
            physicsObject
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
