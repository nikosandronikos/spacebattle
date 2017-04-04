import {Rect, Point, Vector2d, PositionVector} from '../2dGameUtils';
import {mixin, ObservableMixin} from '../2dGameUtils';
import {Log} from '../2dGameUtils';
import {CollisionResolver} from './collision';

/* Physics module
 * The key functionality of this module, is that given a set of control inputs,
 * a movement vector and list of collisions that occurred is output.
 */

const zeroVector = new Vector2d();

const maxSpeed = 5;

function mod(v, m) {
    const r = v % m;
    return r < 0 ? r + m : r;
}

export class PhysicsSystem {
    constructor(dimensionsRect=null) {
        this.collisionResolver = new CollisionResolver();
        this.models = [];
        if (dimensionsRect !== null) this.setBoundaries(dimensionsRect);
    }

    setBoundaries(dimensionsRect) {
        // Boundaries must all point in clockwise direction as
        // various routines depend on this for optimisations.
        // The Rect class does ensure that the points are oriented
        // correctly for this to be always true.
        this.boundaries = [
            PositionVector.createFromPoints(
                new Point(dimensionsRect.x1, dimensionsRect.y1),
                new Point(dimensionsRect.x2, dimensionsRect.y1)
            ),
            PositionVector.createFromPoints(
                new Point(dimensionsRect.x2, dimensionsRect.y1),
                new Point(dimensionsRect.x2, dimensionsRect.y2)
            ),
            PositionVector.createFromPoints(
                new Point(dimensionsRect.x2, dimensionsRect.y2),
                new Point(dimensionsRect.x1, dimensionsRect.y2)
            ),
            PositionVector.createFromPoints(
                new Point(dimensionsRect.x1, dimensionsRect.y2),
                new Point(dimensionsRect.x1, dimensionsRect.y1)
            )
        ];

        this.collisionResolver.clearBoundaries();
        this.boundaries.forEach(line => this.collisionResolver.registerBoundary(line));
    }

    getBoundary(name) {
        switch (name) {
            case 'top': return this.boundaries[0];
            case 'bottom': return this.boundaries[2];
            case 'left': return this.boundaries[1];
            case 'right': return this.boundaries[3];
        }
        return null;
    }

    add(model) {
        this.models.push(model);
        this.collisionResolver.registerPhysicsModel(model);
    }

    update(timeDelta) {
        for (let model of this.models) {
            model.update(timeDelta);
        }

        this.collisionResolver.update(timeDelta);

        // move the objects
        for (let model of this.models) {
            model.move();
        }
    }
}

export class Thruster {
    constructor(power, angle) {
        this._thrustVector = Vector2d.createFromAngle(angle, power);
        this.isFiring = false;
    }

    set firing(isFiring) {
        this.isFiring = isFiring === true;
    }

    get thrustVector() {
        if (this.isFiring) {
            return this._thrustVector;
        }
        return zeroVector;
    }
}

class MotionTracker extends PositionVector {
    constructor(position, vector=null) {
        // Tracks position and velocity via PositionVector.
        if (vector !== null)
            super(position.x, position.y, vector.x, vector.y);
        else
            super(position.x, position.y);

        // Also tracks what portion of a timeslice this motion
        // accounts for - as due to collisions a model may have 
        // multiple changes of trajectory.
        this.time = 1.0;
    }
}

let physicsModelCount = 0;

export class PhysicsModel {
    constructor(system, boundingCircleR, mass, position, motion=null) {
        this.system = system;
        this.motion = new MotionTracker(position, motion);
        this.boundingCircleR = boundingCircleR;
        this.mass = mass;
        this.thrusters = [];
        this.rotateRate = 10;
        this.rotateDirection = 0;
        this.rotateAngle = 0;
        this.otherForce = [];
        this.collidable = true;
        this.system.add(this);
        this.name = `PhysicsModel_${physicsModelCount++}`;
    }

    createThruster(power, angle_vector) {
        const thruster = new Thruster(power, angle_vector);
        this.thrusters.push(thruster);
        return thruster;
    }

    update(timeDelta) {
        Log.write('physicsUpdate', this.name);

        Log.write('position', this.motion.position);

        const forceVector = new Vector2d();

        this.motion.time = 1.0;

        this.otherForce.forEach(e => {
            Log.write('externalForce', e.vector);
            forceVector.add(e.vector);
            e.duration -= timeDelta;
        });
        this.otherForce = this.otherForce.filter(e => e.duration > 0);

        for (let thruster of this.thrusters) {
            Log.write('thruster', thruster.thrustVector);
            forceVector.add(thruster.thrustVector)
        }

        this.rotateAngle += (this.rotateDirection/ (this.rotateRate / timeDelta));
        forceVector.rotate(this.rotateAngle);

        if (forceVector.length !== 0) {
            forceVector.divide(this.mass);
            forceVector.divide(1000 / timeDelta);

            Log.write('forceVector', forceVector);

            this.motion.vector.add(forceVector);

            if (this.motion.vector.length > maxSpeed) {
                this.motion.vector.normalise().multiply(maxSpeed);
            }

            Log.write('motion', this.motion);
        }

        Log.write('endPhysicsUpdate');
    }

    move() {
        Log.write('move', this.name);
        if (this.motion.vector.length > maxSpeed)
            this.motion.vector.normalise().multiply(maxSpeed);

        Log.write('motion', this.motion);
        this.motion.position.translate(this.motion.vector.copy().multiply(this.motion.time));
        Log.write('position', this.motion.position);
    }

    stop() {
        this.motion.vector.zero();
    }

    rotate(direction) {
        this.rotateDirection = direction;
    }

    get position() {
        return this.motion.position;
    }

    get moveVector() {
        return this.motion.vector;
    }

    thruster(i) {
        return this.thrusters[i];
    }

    addExternalForce(v, duration) {
        this.otherForce.push({"vector": v, "duration": duration});
    }
}
mixin(PhysicsModel, ObservableMixin);

class PhysicModelLoader {
    newPhysicsModel(config) {
        // get some variables from the asset file
        // const pm = new PhysicsModel();
        // set up all other paramters via functions
        //return pm;
    }
}
