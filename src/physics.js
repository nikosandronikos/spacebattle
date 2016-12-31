"use strict";

/* Physics module
 * The key functionality of this module, is that given a set of control inputs,
 * a movement vector and list of collisions that occurred is output.
 */

const zeroVector = new Vector2d();

const maxSpeed = 1.5;

class Hashable {
    constructor() {
        this.id = Hashable.nextId++;
    }

    toString() {
        return this.id;
    }
}
Hashable.nextId = 0;

function mod(v, m) {
    const r = v % m;
    return r < 0 ? r + m : r;
}

class PhysicsSystem {
    constructor(dimensions) {
        this.collisionResolver = new CollisionResolver();
        this.models = [];
        this.dimensions =
            new Rect(dimensions.minX, dimensions.minY, dimensions.maxX, dimensions.maxY);
        this.boundaries = [
            positionVectorFromPoints(
                new Point(dimensions.minX, dimensions.minY),
                new Point(dimensions.maxX, dimensions.minY)
            ),
            positionVectorFromPoints(
                new Point(dimensions.maxX, dimensions.minY),
                new Point(dimensions.maxX, dimensions.maxY)
            ),
            positionVectorFromPoints(
                new Point(dimensions.maxX, dimensions.maxY),
                new Point(dimensions.minX, dimensions.maxY)
            ),
            positionVectorFromPoints(
                new Point(dimensions.minX, dimensions.maxY),
                new Point(dimensions.minX, dimensions.minY)
            )
        ];

        this.boundaries.forEach(line => this.collisionResolver.registerLine(line));
    }

    dimensions(minX, minY, maxX, maxY) {
        this.dimensions = new Rect(minX, minY, maxX, maxY);
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

class Thruster {
    constructor(power, angle) {
        this._thrustVector = vector2dFromAngle(angle, power);
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

class PhysicsModel extends Hashable {
    constructor(system, boundingCircleR, mass, position) {
        super();
        this.system = system;
        this.motion = new MotionTracker(position);
        this.boundingCircleR = boundingCircleR;
        this.mass = mass;
        this.thrusters = [];
        this.rotateRate = 10;
        this.rotateDirection = 0;
        this.rotateAngle = 0;
        this.otherForce = [];
    }

    createThruster(power, angle_vector) {
        const thruster = new Thruster(power, angle_vector);
        this.thrusters.push(thruster);
        return thruster;
    }

    update(timeDelta) {
        const forceVector = new Vector2d();

        this.motion.time = 1.0;

        this.otherForce.forEach(e => {
            forceVector.add(e.vector);
            e.duration -= timeDelta;
        });
        this.otherForce = this.otherForce.filter(e => e.duration > 0);

        for (let thruster of this.thrusters) {
            forceVector.add(thruster.thrustVector)
        }

            if (forceVector.length === 0) return;

        forceVector.divide(this.mass);
        forceVector.divide(1000 / timeDelta);

        this.rotateAngle += (this.rotateDirection/ (this.rotateRate / timeDelta));

        forceVector.rotate(this.rotateAngle);

        this.motion.vector.add(forceVector);

        if (this.motion.vector.length > maxSpeed) {
            this.motion.vector.normalise().multiply(maxSpeed);
        }
    }

    move() {
        const worlddim = this.system.dimensions;

        if (this.motion.vector.length > maxSpeed)
            this.motion.vector.normalise().multiply(maxSpeed);

        this.motion.position.translate(this.motion.vector.copy().multiply(this.motion.time));
        if (this.motion.position.x < worlddim.x1 || this.motion.position.x > worlddim.x2)
            this.motion.position.x = mod(this.motion.position.x, worlddim.width);
        if (this.motion.position.y < worlddim.y1 || this.motion.position.y > worlddim.y2)
            this.motion.position.y = mod(this.motion.position.y, worlddim.height);
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

class PhysicModelLoader {
    newPhysicsModel(config) {
        // get some variables from the asset file
        // const pm = new PhysicsModel();
        // set up all other paramters via functions
        //return pm;
    }
}
