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
        console.log(`distance from ${this.x},${this.y} to ${p2.x},${p2.y} = ${Math.sqrt(x * x + y * y)}`);
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
            const temp = vectorCopy(a.moveVector);
            a.moveVector.add(b.moveVector);
            b.moveVector.add(temp);
        }

        function findPointOfCollision(a, b) {
             
        }

        for (let model of this.models) {
            model.update(timeDelta);
        }

        // check for collisions
        for (let model of this.models) {
            const modelPos = model.movePosition();
            for (let other of this.models) {
                if (other === model) continue;
                const otherPos = other.movePosition();
                if (modelPos.distanceTo(otherPos) < model.boundingCircleR + other.boundingCircleR) {
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
        this.position = new Point(position.x, position.y);
        this.boundingCircleR = boundingCircleR;
        this.mass = mass;
        this.thrusters = [];
        this.rotateRate = 10;
        this.rotateDirection = 0;
        this.rotateAngle = 0;
        this._moveVector = new Vector2d();
        this.otherForce = new Set();
    }

    createThruster(power, angle_vector) {
        const thruster = new Thruster(power, angle_vector);
        this.thrusters.push(thruster);
        return thruster;
    }

    update(timeDelta) {
        const forceVector = new Vector2d();

        for (let other of this.otherForce) {
            if (other.duration > 0) {
                forceVector.add(other.vector);
                other.duration -= timeDelta;
            }
            // FIXME: Remove from the set
        }

        for (let thruster of this.thrusters) {
            forceVector.add(thruster.thrustVector)
        }

        forceVector.divide(this.mass);
        forceVector.divide(1000 / timeDelta);

        this.rotateAngle += (this.rotateDirection/ (this.rotateRate / timeDelta));

        forceVector.rotate(this.rotateAngle);

        this._moveVector.add(forceVector);
    }

    movePosition() {
        const worlddim = this.system.dimensions;
        const newP = new Point(this.position.x, this.position.y);
        newP.translate(this._moveVector);
        if (newP.x < worlddim.x1 || newP.x > worlddim.x2)
            newP.x = mod(newP.x, worlddim.width);
        if (newP.y < worlddim.y1 || newP.y > worlddim.y2)
            newP.y = mod(newP.y, worlddim.height);

        return newP;
    }
        
    move() {
        const worlddim = this.system.dimensions;
        this.position.translate(this._moveVector);
        if (this.position.x < worlddim.x1 || this.position.x > worlddim.x2)
            this.position.x = mod(this.position.x, worlddim.width);
        if (this.position.y < worlddim.y1 || this.position.y > worlddim.y2)
            this.position.y = mod(this.position.y, worlddim.height);
    }

    stop() {
        this._moveVector.zero();
    }

    rotate(direction) {
        this.rotateDirection = direction;
    }

    get moveVector() {
        return this._moveVector;
    }

    thruster(i) {
        return this.thrusters[i];
    }

    addExternalForce(v, duration) {
        this.otherForce.add({"vector": v, "duration": duration});
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
