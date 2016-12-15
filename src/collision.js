class TrackedModel {
    constructor(physicsModel) {
        this.physicsModel = physicsModel;

        // Contains all objects that collide with this object, not including
        // the first collision, which is stored in the Collision object.
        this.collisionList = [];

        // The first collision this model is involved in. This is the one that
        // has an effect and is stored in the PriorityQueue of the
        // CollisionResolver.
        this.firstCollision = null;
    }
  
    useCollision(time) {
        // FIXME: Stop ignoring three way collisions.
        return (this.firstCollision === null || this.firstCollision > time);
    }
 
    addCollision(c) {
        this.collisionList.push(c);
    }

    emptyCollisionList() {
        this.collisionList = [];
    }
 
    toString() { return this.physicsModel.toString(); }
}


class Collision {
    constructor(trackerA, trackerB, time) {
        this.a = trackerA;
        this.b = trackerB;
        this.time = time;

        if (trackerB.model instanceof PositionVector)
            this.resolve = _resolveLine;
        else if (trackerB.model instanceof PhysicsModel)
            this.resolve = _resolveModel;
    }

    updatePhysics() {
        this.a.physicsModel.motion.vector.rotate(180);
        this.b.physicsModel.motion.vector.rotate(180);
    }

    _resolveLine() {
        // for now, let's bounce off the vector
        
        // update this.a.motion.vector to reflect the effect of the
        // collision
    }

    _resolveModel() {
    }
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

        // Lines - the borders of the world at the moment.
        // FIXME: Generalise this so it can support other things 
        // (e.g. planets) once I've worked out details.
        this.lines = [];

    }

    registerPhysicsModel(physicsModel) {
        const tracker = new TrackedModel(physicsModel);
        console.log(`CollisionResolver now tracking ${physicsModel.toString()}`);
        this.trackedModels.push(tracker);
        return tracker;
    }

    // Find collisions between all registered objects.
    _updateAllCollisions() {
        // FIXME: Need to incorporate collision checking with the
        // boundary of the space
        for (line of this.lines) {
        }

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
            for (let j = i + 1; j < this.trackedModels.length; j++) {
                const b = this.trackedModels[j];
                const collisionResult =
                    CollisionResolver.checkModelCollision(a.physicsModel, b.physicsModel);
                if (collisionResult !== false) {
                    const c = new Collision(a, b, collisionResult);
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

        for (let b of this.trackedModels) {
            if (a === b) continue;

             const collisionResult =
                CollisionResolver.checkModelCollision(a.physicsModel, b.physicsModel);
            if (collisionResult !== false) {
                const c = new Collision(a, b, collisionResult);
                this.collisions.insert(c);
                a.addCollision(c);
                b.addCollision(c);
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
            if (i > 100) {
                // A guard in case we get stuck in a loop.
                console.log('aborting collision detection');
                return;
            }

            const timeLeft = 1.0 - collision.time;
            console.log(timeLeft);
            if (timeLeft <= 0.0) return;

            collision.updatePhysics(timeLeft);

            // remove all other collisions for A and B from priority queue.
            // Those ones will never happen now that A and B are on a different
            // trajectory.
            console.log(collision.a.collisionList.length);
            collision.a.collisionList.forEach(e => {console.log('removing'); this.collisions.remove(e)});
            collision.b.collisionList.forEach(e => this.collisions.remove(e));

            // A and B have moved, but nothing else has.
            // So test each of A and B against all other objects

            // FIXME: This will currently result in a duplicate collision for
            // A and B (if they do indeed collide). This shouldn't be a problem
            // as the first instance will be resolved, then the second will
            // be discarded. But it might be nice to not have the duplicate at
            // all if at all possible. 
            this._updateTrackedModelCollisions(collision.a);
            this._updateTrackedModelCollisions(collision.b);

            // Now the PriorityQueue is likely to have totally changed.
            // But we keep working our way through until it is empty.
            collision = this.collisions.pop();
        }
    }

    static checkModelCollision(a, b) {
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

    static checkLineCollision(a, line) {
        const intersectPoint = a.physicsModel.motion.intersects(line);
        
        if (intersectPoint === false) return false;

        const vTravel =
            vector2dFromPoints(
                a.physicsModel.motion.position,
                intersectPoint
            );

        // Return the offset along the vector that the collision occured at.
        // Will be in the range 0..1
        return vTravel.length / a.physicsModel.motion.length; 
    }
}
