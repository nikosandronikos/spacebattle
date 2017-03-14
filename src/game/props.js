import {Vector2d} from '../2dGameUtils/';
import {PHYSICS_PER_SECOND} from '../2dGameUtils';
import {Log} from '../2dGameUtils';

import {GameObject} from './gameObject.js';

let asteroidCounter = 0;

export class AsteroidObject extends GameObject {
    constructor(renderObject, physicsModel, stats) {
        super(renderObject, physicsModel, stats);
        this.name = `Asteroid_${asteroidCounter++}`;
        this.physicsModel.rotate(Math.random() * 2 - 1);
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
    }

    update(timeDelta, worldState) {
    }
};

let planetCounter = 0;

const planetGravityDist = 500;

export class PlanetObject extends GameObject {
    constructor(renderObject, physicsModel, stats) {
        super(renderObject, physicsModel, stats);
        this.name = `Planet_${planetCounter++}`;
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
    }

    update(timeDelta, worldState) {
        // add a force to any objects within range

        for (const obj of worldState.allObjectsIterator()) {
            if (obj === this) continue;
            const dist = this.physicsModel.position.distanceTo(obj.physicsModel.position);
            if (dist < planetGravityDist) {
                console.log(obj.name);
                console.log(`planet at: ${this.physicsModel.position.x}, ${this.physicsModel.position.y}`);
                console.log(`${obj.name} at: ${obj.physicsModel.position.x}, ${obj.physicsModel.position.y}`);
                // Multiplying force by mass to cancel out the effect of mass
                // when applying the forice to the model (because gravity
                // shouldn't be affected by mass).
                // FIXME: May want to support an alternate way of applying
                // a force that isn't part of the thrust calculations.
                // FIXME: Have gravity drop off as distance increases.
                obj.physicsModel.addExternalForce(
                    Vector2d.createFromPoints(
                        obj.physicsModel.position,
                        this.physicsModel.position
                    ).normalise().multiply(Math.max(20)).multiply(obj.physicsModel.mass), //200, planetGravityDist - dist)),
                    1000 / PHYSICS_PER_SECOND // one physics frame. FIXME: support as default?
                );
            }
        }
    }
};
