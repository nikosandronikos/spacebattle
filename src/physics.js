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

    function toString() {
        return this.id;
    }
}
Hashable.nextId = 0;

function mod(v, m) {
    const r = v % m;
    return r < 0 ? r + m : r;
}

class Collidable {
    constructor() {
    }

    // Usually overridden.
    testCollision() {
        return false;
    }
}

class moveResolver {
    // API needed
    // - update 
    //  Move everything, work out collisions, update movement, do this recusively to fill time
    //  - newTimeSlice: resets everything
    //  - moveModel: convert move to a vector covering entirety of models movement
    // Internally need:
    // - PriorityQueue of collisions
    // - Get all collisions for a model (allow us to find other things that collide with a model and remove later collisions)

    constructor(physicsSystem) {
        this.system = physicsSystem;
        // The known models.
        // Each may have multiple collisions detected - but only the first
        // is used.
        this.models = {};

        // PriorityQueue of collisions so they can be resolved in time
        // order.
        this.collisions = new PriorityQueue((a, b) => a.time < b.time);

        // Lines - the borders of the world at the moment.
        // FIXME: Generalise this so it can support other things 
        // (e.g. planets) once I've worked out details.
        this.lines = [];
    }

    class TrackedModel implements Collidable {
        constructor(moveResolver, model) {
            this.moveResolver = moveResolver;
            this.model = model;
            this.hasCollisions = false;
            this.collisionTime = offset;
        }
        
        toString() { return model.toString(); }
        
        checkLineCollision(line) {
            model = this.model;
            const intersectPoint = model.motion.intersects(line);
            
            if (intersectPoint === false) return false;

            const vTravel =
                vector2dFromPoints(
                    model.motion.position,
                    intersectPoint
                );

            const offset = vTravel.length / model.motion.length; 
            
            this.hasCollision = true;
            this.collisionTime = offset;

            this.moveResolver.collisions.insert(new Collision(tracker, null, offset));
        }
    }

    _trackedModel(model) {
        tracker = this.models[model];
        if (undefined === tracker) {
            tracker = new TrackedModel(model);
            this.models[model] = tracker;
        }
        return tracker;
    }

    // Add objects that will be moving each turn
    register(model) {
        _trackedModel(model);
    }
    
    // Add static objects
    // Initially just border lines.
    // This will probably include planets, etc too
    registerLine(line) {
        if !(line instanceof PositionVector)
            throw "registerLine(): line must be a PositionVector";
        this.lines.push(line);
    }

    resolveMoves(timeDelta) {
        // 0. Reset anything that needs it

        // 1. Find first collision of each object - add to PriortyQueue

        // 2. Get first two collisions (they are one collision)

        // 3. Remove any other collisions involving these objects

        // 4. Resolve collision and make update to trajectory based on remaining time

        // 5. Recalculate collisions for updated models (with reduced time slice)

        // 6. If there are collisions in PriorityQueue, goto 2
    }

    class Collision {
        constructor(trackerA, trackerB, time) {
            this.a = trackerA;
            this.b = trackerB;
            this.time = time;
        }
    }

    class CollisionTracker {
        constructor() {
            // The known models.
            // Each may have multiple collisions detected - but only the first
            // is used.
            this.models = {};

            // PriorityQueue of collisions so they can be resolved in time
            // order.
            this.collisions = new PriorityQueue((a, b) => a.time < b.time);
        }

       function _trackedModel(model) {
            tracker = this.models[model];
            if (undefined === tracker) {
                tracker = {hasCollision: false, collisionTime: 0};
                this.models[model] = tracker;
            }
            return tracker;
        }

        function checkModelCollision(modelA, modelB) {
            a = _trackedModel(modelA);
            b = _trackedModel(modelB);
            return false;
        }

        function checkLineCollision(model, line) {
            tracker = _trackedModel(model);
            const intersectPoint = model.motion.intersects(line);
            
            if (intersectPoint === false) return false;

            const vTravel =
                vector2dFromPoints(
                    model.motion.position,
                    intersectPoint
                );

            const offset = vTravel.length / model.motion.length; 
            
            tracker.hasCollision = true;
            tracker.collisionTime = offset;

            this.collisions.insert(new Collision(tracker, null, offset));
        }
    }

    move() {
        const worlddim = this.system.dimensions;
        this.motion.position.translate(this.motion.vector);
        if (this.motion.position.x < worlddim.x1 || this.motion.position.x > worlddim.x2)
            this.motion.position.x = mod(this.motion.position.x, worlddim.width);
        if (this.motion.position.y < worlddim.y1 || this.motion.position.y > worlddim.y2)
            this.motion.position.y = mod(this.motion.position.y, worlddim.height);
    }


    resolveMoves() {
        // Return a value between 0..1 to indicate where in the time slice the
        // collision occurred.
        // Otherwise, return false if there is no collision.
        function checkCollision(a, b) {
            // FIXME: Avoid overhead of creating Rect objects here, just make a
            // function that takes aPos, aEnd, bPos, bEnd and determines collision.
            const aPos = a.motion.position;
            const aEnd = a.motion.endPoint();
            const collisionRectA =
                new Rect(
                    aPos.x + (aPos.x < aEnd.x ? -a.boundingCircleR : a.boundingCircleR),
                    aPos.y + (aPos.y < aEnd.y ? -a.boundingCircleR : a.boundingCircleR),
                    aEnd.x + (aPos.x < aEnd.x ? a.boundingCircleR : -a.boundingCircleR),
                    aEnd.y + (aPos.y < aEnd.y ? a.boundingCircleR : -a.boundingCircleR)
                );
            const bPos = b.motion.position;
            const bEnd = b.motion.endPoint();
            const collisionRectB =
                new Rect(
                    bPos.x + (bPos.x < bEnd.x ? -b.boundingCircleR : b.boundingCircleR),
                    bPos.y + (bPos.y < bEnd.y ? -b.boundingCircleR : b.boundingCircleR),
                    bEnd.x + (bPos.x < bEnd.x ? b.boundingCircleR : -b.boundingCircleR),
                    bEnd.y + (bPos.y < bEnd.y ? b.boundingCircleR : -b.boundingCircleR)
                );

            if (!collisionRectA.intersects(collisionRectB)) return false;

            // Work out exactly where during the time step the collision occurred.
            // This will guide how much motion to apply after the collision.
            const steps = 4;
            const step = 1 / (steps - 1)
            const combinedBounds = a.boundingCircleR + b.boundingCircleR;

            for (let i = 0, p = 0; i < steps; i++, p += step) {
                const aPoint = a.motion.pointAt(p);
                const bPoint = b.motion.pointAt(p);

                if (aPoint.distanceTo(bPoint) < combinedBounds) {
                    return step;
                }
            }

            return false;
        }
        // Determine any collisions and update movement vectors.

        // Move all objects
    }
}

class PhysicsSystem {
    constructor(dimensions) {
        this.models = [];
        this.dimensions =
            new Rect(dimensions.minX, dimensions.minY, dimensions.maxX, dimensions.maxY);
        this.boundaries = [
            positionVectorFromPoints(
                new Point(dimensions.minX, dimensions.minY),
                new Point(dimensions.maxX, dimensions.maxY)
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
    }

    dimensions(minX, minY, maxX, maxY) {
        this.dimensions = new Rect(minX, minY, maxX, maxY);
    }

    add(model) {
        this.models.push(model);
    }

    update(timeDelta) {
        function transferEnergy(a, b) {
            // momentum: p = mv
            // impulse-momentum change: F * t = mass * Delta v
            const temp = a.moveVector.copy();
            a.moveVector.add(b.moveVector);
            b.moveVector.add(temp);
        }

        function findPointOfCollision(a, b) {
             
        }

        for (let model of this.models) {
            model.update(timeDelta);
        }

        // check for collisions
        // FIXME: This is n^2, need to add a broad phase test around this
        // rather than running the check on every object pair.
        for (let model of this.models) {
            for (let other of this.models) {
                if (other === model) continue;
                if (model.checkCollision(other)) {
                    // change motion, transfer energy, do some damage, don't get stuck
                    console.log('collision');
                    transferEnergy(model, other); 
                }
            }
        }

        // move the objects
        for (let model of this.models) {
            model.move();
        }
    }
}

class Thruster {
    constructor(power, angle) {
        this._thrustVector = vector2d_from_angle(angle, power);
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

class PhysicsModel extends Hashable {
    constructor(system, boundingCircleR, mass, position) {
        this.system = system;
        this.motion = new PositionVector(position.x, position.y);
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

        this.otherForce.forEach(e => {
            forceVector.add(e.vector);
            e.duration -= timeDelta;
        });
        this.otherForce = this.otherForce.filter(e => e.duration > 0);

        for (let thruster of this.thrusters) {
            forceVector.add(thruster.thrustVector)
        }

        forceVector.divide(this.mass);
        forceVector.divide(1000 / timeDelta);

        this.rotateAngle += (this.rotateDirection/ (this.rotateRate / timeDelta));

        forceVector.rotate(this.rotateAngle);

        this.motion.vector.add(forceVector);

        if (this.motion.vector.length > maxSpeed) {
            this.motion.vector.normalise().multiply(maxSpeed);
        }
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
