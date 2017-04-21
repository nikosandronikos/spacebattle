import {Vector2d} from '../2dGameUtils/';
import {PHYSICS_PER_SECOND} from '../2dGameUtils';
import {Log} from '../2dGameUtils';

import {GameObject} from './gameObject.js';

// The number of small asteroids to spawn when a large one is destroyed
const smallAsteroidsInBig = 3;

let bulletCounter = 0;

export class BulletObject extends GameObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        super(scenario, renderObject, physicsModel, stats);
        this.name = `Bullet_${bulletCounter++}`;
        this.updateRenderer();
        this.physicsModel.name = this.name;
        this.timeToDissapear = 4000; // ms
    }

    update(timeDelta, worldState) {
        console.log(this.timeToDissapear);
        if ((this.timeToDissapear -= timeDelta) < 1) {
            this.damage(this.stats.hp);
        }
    }
};

let asteroidCounter = 0;

export class AsteroidObject extends GameObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        super(scenario, renderObject, physicsModel, stats);
        this.name = `Asteroid_${asteroidCounter++}`;
        this.physicsModel.rotate(Math.random() * 2 - 1);
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
        this.physicsModel.name = this.name;
    }
};

export class BigAsteroidObject extends AsteroidObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        super(scenario, renderObject, physicsModel, stats);
    }

    die() {
        for(let i = 0; i < smallAsteroidsInBig; i++) {
            this.scenario.createProp(
                'smallAsteroid_001',
                this.physicsModel.position,
                this.physicsModel.moveVector.copy().rotate(
                    Math.random() * 160 - 80
                ),
                'player'
            );
        }
    }
};

let planetCounter = 0;

const planetGravityDist = 500;

export class PlanetObject extends GameObject {
    constructor(scenario, renderObject, physicsModel, stats) {
        super(scenario, renderObject, physicsModel, stats);
        this.name = `Planet_${planetCounter++}`;
        this.updateRenderer();
        Log.write('created', this.name, physicsModel.name);
        this.physicsModel.name = this.name;
    }

    update(timeDelta, worldState) {
        // add a force to any objects within range

        for (const obj of worldState.allObjectsIterator()) {
            if (obj === this) continue;
            const dist = this.physicsModel.position.distanceTo(obj.physicsModel.position);
            if (dist < planetGravityDist) {
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
                    ).normalise().multiply(1.5 * (1 - dist / planetGravityDist)).multiply(obj.physicsModel.mass),
                    1000 / PHYSICS_PER_SECOND // one physics frame. FIXME: support as default?
                );
            }
        }
    }
};
