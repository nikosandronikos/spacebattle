"use strict";

/* Physics module
 * The key functionality of this module, is that given a set of control inputs,
 * a movement vector and list of collisions that occurred is output.
 */

const zeroVector = new Vector2d();

const maxSpeed = 10;

function mod(v, m) {
    const r = v % m;
    return r < 0 ? r + m : r;
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distanceTo(p2) {
        const x = p2.x - this.x;
        const y = p2.y - this.y;
        return Math.sqrt(x * x + y * y);
    }

    // Translate by something that has co-ordinates (e.g. another point, or
    // a vector.
    translate(coord) {
        this.x += coord.x;
        this.y += coord.y;
        return this;
    }

    copy() {
        return new Point(this.x, this.y);
    }
}

class PositionVector {
    constructor(posX, posY, vectorX, vectorY) {
        this.position = new Point(posX, posY);
        this.vector = new Vector2d(vectorX, vectorY);
    }

    startPoint() {
        return this.position;
    }

    midPoint() {
        return this.vector.midPoint().translate(this.position);
    }

    endPoint() {
        return this.position.copy().translate(this.vector);
    }

    pointAt(i) {
        return this.vector.pointAt(i).translate(this.position);
    }
}

class Rect {
    constructor(x1, y1, x2, y2) {
        if (x2 < x1) {
            const temp = x2;
            x2 = x1;
            x1 = temp;
        }

        if (y2 < y1) {
            const temp = y2;
            y2 = y1;
            y1 = temp;
        }

        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }

    get width() {
        return this.x2 - this.x1;
    }

    get height() {
        return this.y2 - this.y1;
    }

    intersects(otherRect) {
        // No overlap if:
        // As right edge is to the left of Bs left edge
        // As left edge is to the right of Bs right edge
        // As bottom edge is above Bs top edge
        // As top edge is below Bs bottom edge
        if (this.x2 < otherRect.x1 || this.x1 > otherRect.x2 || this.y2 < otherRect.y1 || this.y1 > otherRect.y2)
            return false;
        return true;
    }
}

class PhysicsSystem {
    constructor(dimensions) {
        this.models = [];
        this.dimensions =
            new Rect(dimensions.minX, dimensions.minY, dimensions.maxX, dimensions.maxY);
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
            const modelPos = model.movePosition();
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

class PhysicsModel {
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
    }

    movePosition() {
        const worlddim = this.system.dimensions;
        const newP = this.motion.endPoint();
        if (newP.x < worlddim.x1 || newP.x > worlddim.x2)
            newP.x = mod(newP.x, worlddim.width);
        if (newP.y < worlddim.y1 || newP.y > worlddim.y2)
            newP.y = mod(newP.y, worlddim.height);

        return newP;
    }
        
    move() {
        const worlddim = this.system.dimensions;
        this.motion.position.translate(this.motion.vector);
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

    checkCollision(b) {
        // FIXME: Avoid overhead of creating Rect objects here, just make a
        // function that takes aPos, aEnd, bPos, bEnd and determines collision.
        const aPos = this.motion.position;
        const aEnd = this.motion.endPoint();
        const collisionRectA =
            new Rect(
                aPos.x + (aPos.x < aEnd.x ? -this.boundingCircleR : this.boundingCircleR),
                aPos.y + (aPos.y < aEnd.y ? -this.boundingCircleR : this.boundingCircleR),
                aEnd.x + (aPos.x < aEnd.x ? this.boundingCircleR : -this.boundingCircleR),
                aEnd.y + (aPos.y < aEnd.y ? this.boundingCircleR : -this.boundingCircleR)
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
        const combinedBounds = this.boundingCircleR + b.boundingCircleR;

        for (let i = 0, p = 0; i < steps; i++, p += step) {
            const aPoint = this.motion.pointAt(p);
            const bPoint = b.motion.pointAt(p);

            if (aPoint.distanceTo(bPoint) < combinedBounds) {
                return true;
            }
        }

        return false;
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
