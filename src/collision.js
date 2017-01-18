class TrackedModel {
    constructor(physicsModel) {
        this.physicsModel = physicsModel;

        // Contains all objects that collide with this object, not including
        // the first collision, which is stored in the Collision object.
        this.collisionList = [];
    }
  
    addCollision(c) {
        this.collisionList.push(c);
    }

    emptyCollisionList() {
        this.collisionList = [];
    }

    toString() { return this.physicsModel.toString(); }
}

/*
An abstract class, specific collision classes need
to implement this interface to avoid errors.

class Collision {
    constructor();
    getConnectedCollisions();
    clearConnectedCollisions();
    resolve();
}
*/

class ModelCollision {
    constructor(trackerA, trackerB, time) {
        this.a = trackerA;
        this.b = trackerB;
        this.time = time;
    }

    getConnectedCollisions() {
        return [this.a.collisionList.concat(this.b.collisionList)];
    }

    clearConnectedCollisions() {
        this.a.emptyCollisionList();
        this.b.emptyCollisionList();
    }

    // returns an array of all objects affected by the resolution - those that 
    // need collisions to be recalculated for them.
    resolve() {
        const   a = this.a.physicsModel,
                b = this.b.physicsModel;
        let     aMoved = a.motion.pointAt(this.time),
                bMoved = b.motion.pointAt(this.time);

        const aOrigMotion = a.motion.copy();
        const bOrigMotion = b.motion.copy();

        // See http://vobarian.com/collisions/2dcollisions2.pdf for the maths.

        // Find unit normal to the surfaces of the objects at the collision point.
        // Also find tangent to unit normal.
        let     unitNormal = vector2dFromPoints(aMoved, bMoved);
        if (unitNormal.length == 0.0) {
            aMoved = a.motion.startPoint();
            bMoved = b.motion.startPoint();
            unitNormal = vector2dFromPoints(aMoved, bMoved);
            console.log('Had to fudge position for collision calculation.');
            if (unitNormal.length == 0.0) {
                throw 'Having trouble with this collision'
                return;
            }
        }
        unitNormal.normalise();

        const   unitTangent = new Vector2d(-unitNormal.y, unitNormal.x);

        // Project velocity vectors onto unit normal and unit tangent vectors.
        const   velocityANormal     = unitNormal.dot(a.motion.vector),
                velocityATangent    = unitTangent.dot(a.motion.vector),
                velocityBNormal     = unitNormal.dot(b.motion.vector),
                velocityBTangent    = unitTangent.dot(b.motion.vector);

        // Find the new normal velocities.
        const   newVA = (velocityANormal * (a.mass - b.mass) + 2 * b.mass * velocityBNormal) / (a.mass + b.mass),
                newVB = (velocityBNormal * (b.mass - a.mass) + 2 * a.mass * velocityANormal) / (a.mass + b.mass);

        // convert the scalar normal and tangential velocities into vectors.
        const   newAVector = unitNormal.copy().multiply(newVA).add(unitTangent.copy().multiply(velocityATangent)),
                newBVector = unitNormal.copy().multiply(newVB).add(unitTangent.copy().multiply(velocityBTangent));

        const remainingTime = 1 - this.time;

        a.motion.position = aMoved;
        a.motion.vector = newAVector;
        a.motion.time = remainingTime;

        b.motion.position = bMoved;
        b.motion.vector = newBVector;
        b.motion.time = remainingTime;

        a.notifyObservers('collision', b, aOrigMotion, a.motion);
        b.notifyObservers('collision', a, bOrigMotion, b.motion);

        return [this.a, this.b];
    }
}

class BoundaryCollision {
    // This isn't a general line collision teleporter, though it could have been.
    // Decided not to do that because the teleporter will likely have some subtle
    // differences so I'm keeping this as fast and specialised as possible.

    constructor(trackerA, line, time) {
        this.a = trackerA;
        this.line = line;
        this.time = time;
    }

    getConnectedCollisions() {
        return this.a.collisionList;
    }

    clearConnectedCollisions() {
        this.a.emptyCollisionList();
    }

    resolve() {
        const a = this.a.physicsModel;
        const collisionPoint = a.motion.pointAt(this.time);
        const endPoint = a.motion.endPoint();
        const newP = new Point(0,0);
        const sysDim = a.system.dimensions;

        if (this.line.vector.y == 0) {
            // horizontal boundary
            newP.x = collisionPoint.x;
            if (endPoint.y >= this.line.position.y) {
                // passing 'upwards' through the line
                newP.y = sysDim.y1 + BoundaryCollision.passThroughOffset;
            } else if (endPoint.y <= this.line.position.y) {
                newP.y =  sysDim.y2 - BoundaryCollision.passThroughOffset;
            } else {
                throw 'Do not seem to be passing through a horizontal boundary';
            }
        } else if (this.line.vector.x == 0) {
            // vertical boundary
            newP.y = collisionPoint.y;
            if (endPoint.x >= this.line.position.x) {
                newP.x = sysDim.x1 + BoundaryCollision.passThroughOffset;
            } else if (endPoint.x <= this.line.position.x) {
                newP.x = sysDim.x2 - BoundaryCollision.passThroughOffset;
            } else {
                throw 'Do not seem to be passing through a vertical boundary';
            }
        } else {
            throw 'Not a horizontal or vertical line.'
        }

        a.motion.position = newP;
        a.motion.time = 1 - this.time;

        return [this.a];
    }
}

BoundaryCollision.passThroughOffset = 0.001;

function createCollision(a, b, time) {
    if (b instanceof PositionVector){
        return new BoundaryCollision(a, b, time);
    } else if (b instanceof TrackedModel) {
        return new ModelCollision(a, b, time);
    }

    throw 'Unsupported type.'
}


class CollisionResolver {
    constructor() {
        // The known models.
        // Each may have multiple collisions detected - but only the first
        // is used.
        this.trackedModels = [];

        // PriorityQueue of collisions so they can be resolved in time
        // order.
        this.collisions = new PriorityQueue((a, b) => a.time < b.time);

        this.boundaryLines = [];

    }

    registerBoundary(boundaryPositionVector) {
        this.boundaryLines.push(boundaryPositionVector);
    }

    registerPhysicsModel(physicsModel) {
        const tracker = new TrackedModel(physicsModel);
        this.trackedModels.push(tracker);
        return tracker;
    }

    // Find collisions between all registered objects.
    _updateAllCollisions() {
        this._updateCollisions(this.trackedModels);
    }

    // Find collisions between all objects in the given iterable.
    _updateCollisions(iterable) {
        // This will result in a list of all collisions, with no duplicates,
        // though a model may be involved in more than one collision.

        for (let tracker of this.trackedModels)
            tracker.emptyCollisionList();

        for (let i = 0; i < this.trackedModels.length; i++) {
            const a = this.trackedModels[i];

            this._checkBoundaryCollisionsForModel(a);

            for (let j = i + 1; j < this.trackedModels.length; j++) {
                const b = this.trackedModels[j];
                const collisionResult =
                    CollisionResolver.checkModelCollision(a.physicsModel, b.physicsModel);
                if (collisionResult !== false) {
                    const c = createCollision(a, b, collisionResult);
                    this.collisions.insert(c);
                    a.addCollision(c);
                    b.addCollision(c);
                }
            }
        }
    }

    // Find collisions for one model (a) against all other models that have
    // been registered.
    _updateTrackedModelCollisions(a) {
        a.emptyCollisionList();
        this._checkBoundaryCollisionsForModel(a);

        for (let b of this.trackedModels) {
            if (a === b) continue;

             const collisionResult =
                CollisionResolver.checkModelCollision(a.physicsModel, b.physicsModel);
            if (collisionResult !== false) {
                const c = createCollision(a, b, collisionResult);
                this.collisions.insert(c);
                a.addCollision(c);
                b.addCollision(c);
            }
        }
    }

    _checkBoundaryCollisionsForModel(a) {
        if (!(a instanceof TrackedModel)) {
            console.log('blergh');
        }
        for (let line of this.boundaryLines) {
            const collisionResult = CollisionResolver.checkLineCollision(a.physicsModel, line);
            if (collisionResult !== false) {
                const c = createCollision(a, line, collisionResult);
                this.collisions.insert(c);
                a.addCollision(c);
            }
        }
    }

    update(timeDelta) {
        this.collisions.clear();

        this._updateAllCollisions();

        let i = 0;

        // Action collisions
        let collision = this.collisions.pop();
        while (collision) {
            if (i++ > 100) {
                // A guard in case we get stuck in a loop.
                console.log('aborting collision detection');
                return;
            }

            const timeLeft = 1.0 - collision.time;
            if (timeLeft <= 0.0) return;

            const moved = collision.resolve();

            // remove all other collisions for A and B from priority queue.
            // Those ones will never happen now that A and B are on a different
            // trajectory.
            collision.getConnectedCollisions().forEach(e => this.collisions.remove(e));

            // A and B have moved, but nothing else has.
            // So test each of A and B against all other objects

            // FIXME: This will currently result in a duplicate collision for
            // A and B (if they do indeed collide). This shouldn't be a problem
            // as the first instance will be resolved, then the second will
            // be discarded. But it might be nice to not have the duplicate at all.
            moved.forEach(e => this._updateTrackedModelCollisions(e));

            // Now the PriorityQueue is likely to have totally changed.
            // But we keep working our way through until it is empty.
            collision = this.collisions.pop();
        }
    }

    static checkModelCollision(a, b) {
        if (!a.collidable || !b.collidable) return false;

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
        const   aVelocity = a.motion.vector,
                bVelocity = b.motion.vector;

        const qa =
            Math.pow(bVelocity.x - aVelocity.x, 2) +
            Math.pow(bVelocity.y - aVelocity.y, 2);

        if (qa != 0.0) {
            const qb =
                2.0 *
                (
                    (bPos.x - aPos.x) * (bVelocity.x - aVelocity.x)
                    +
                    (bPos.y - aPos.y) * (bVelocity.y - aVelocity.y)
                );

            const qc =
                Math.pow(bPos.x - aPos.x, 2) +
                Math.pow(bPos.y - aPos.y, 2) -
                Math.pow(a.boundingCircleR + b.boundingCircleR, 2);

            const det = Math.pow(qb, 2) - 4 * qa * qc;

            const t = (-qb - Math.sqrt(det)) / (2.0 * qa);
            if (t >= 0.0 && t <= 1.0) {
                return t;
            }
        }

        return false;
    }

    static checkLineCollision(a, positionVector) {
        // Ignore a.collidable for now. Otherwise model won't wrap
        // to other side of the world.

        const intersectPoint = a.motion.intersects(positionVector);
        
        if (intersectPoint === false) return false;

        const vTravel =
            vector2dFromPoints(
                a.motion.position,
                intersectPoint
            );

        // Return the offset along the vector that the collision occured at.
        // Will be in the range 0..1
        return vTravel.length / a.moveVector.length; 
    }
}
