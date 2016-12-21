"use strict";

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

/*********************************************************************/

class Vector2d {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    copy() {
        return new Vector2d(this._x, this._y);
    }

    set x(value) {
        if (value === undefined || isNaN(value))
            throw 'value is invalid.';
        this._x = value;
    }

    get x() {
        return this._x;
    }

    set y(value) {
        if (value === undefined || isNaN(value))
            throw 'value is invalid.';
        this._y = value;
    }

    get y() {
        return this._y;
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    midPoint() {
        return new Point(this._x / 2, this._y / 2);    
    }

    // Return a point along the vector. i must be a value between zero and one,
    // with zero being equivalent to the start of the vector and one equivalent
    // to the end of the vector.
    pointAt(i) {
        return new Point(this._x * i, this._y * i);
    }

    dot(b) {
        return this._x * b.x + this._y * b.y;
    }

    // Project this vector onto the vector 'b'  and return a new Vector2d
    // containing the result.
    projectOnto(b) {
        const r = b.copy().normalise();
        return r.multiply(this.dot(r));
    }

    zero() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    normalise() {
        this.divide(this.length);
        return this;
    }
    
    add(b) {
        this.x += b.x;
        this.y += b.y;
        return this;
    }

    subtract(b) {
        this.x -= b.x;
        this.y -= b.y;
        return this;
    }

    multiply(scalar) {
        this._x = this._x * scalar;
        this._y = this._y * scalar;
        return this;
    }

    divide(scalar) {
        this._x = this._x / scalar;
        this._y = this._y / scalar;
        return this;
    }

    rotate(degrees) {
        const thetaRadians = degrees * (Math.PI / 180);
        const x = this._x;
        const y = this._y;
        this._x = x * Math.cos(thetaRadians) - y * Math.sin(thetaRadians);
        this._y = y * Math.cos(thetaRadians) + x * Math.sin(thetaRadians);
        return this;
    }
}

function vector2dFromAngle(thetaDegrees, length=1) {
    const thetaRadians = thetaDegrees * (Math.PI / 180);
    const v = new Vector2d(
        length * Math.cos(thetaRadians),
        length * Math.sin(thetaRadians)
    );
    return v;
}    

function vector2dSum(a, b) {
    const r = new Vector2d(a.x, a.y);
    r.add(b);
    return r; 
}

function vector2dDifference(a, b) {
    const r = new Vector2d(a.x, a.y);
    r.subtract(b);
    return r; 
}

function vector2dFromPoints(p1, p2) {
    return new Vector2d(p2.x - p1.x, p2.y - p1.y);
}

/*********************************************************************/

class PositionVector {
    constructor(posX=0, posY=0, vectorX=0, vectorY=0) {
        this.position = new Point(posX, posY);
        this.vector = new Vector2d(vectorX, vectorY);
    }

    copy() {
        return new PositionVector(this.position.x, this.position.y, this.vector.x, this.vector.y);
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

    updatePosition() {
        this.position.translate(this.vector);
        
    }
    
    intersects(other) {
        // Algorithm from Graphics Gems
        const   x1 = this.position.x,
                y1 = this.position.y,
                x2 = this.position.x + this.vector.x,
                y2 = this.position.y + this.vector.y,
                x3 = other.position.x,
                y3 = other.position.y,
                x4 = other.position.x + other.vector.x,
                y4 = other.position.y + other.vector.y;

        const   a1 = y2 - y1,
                b1 = x1 - x2,
                c1 = x2 * y1 - x1 * y2;

        const   r3 = a1 * x3 + b1 * y3 + c1,
                r4 = a1 * x4 + b1 * y4 + c1;

        if (r3 != 0 && r4 != 0 && Math.sign(r3) == Math.sign(r4))
            return false;

        const   a2 = y4 - y3,
                b2 = x3 - x4,
                c2 = x4 * y3 - x3 * y4;
        
        const   r1 = a2 * x1 + b2 * y1 + c2,
                r2 = a2 * x2 + b2 * y2 + c2;

        if (r1 != 0 && r2 != 0 && Math.sign(r1) == Math.sign(r2))
            return false;

        console.log('PositionVector::intersects - intersection detected');

        const denom = a1 * b2 - a2 * b1;
        if (denom == 0) {
            // Can't collide with the boundary while travelling colinearly
            // to it, so don't really care about this case.
            // If it ever needs to be handled, replace this exception with
            // the handling code.
            throw 'PositionVector::intersects - colinear intersection';
        }

        const n1 = b1 * c2 - b2 * c1;
        const n2 = a2 * c1 - a1 * c2;

        return new Point(
            (b1 * c2 - b2 * c1) / denom,
            (a2 * c1 - a1 * c2) / denom
        );
    }
}

function positionVectorFromPoints(p1, p2) {
    return new PositionVector(
        p1.x, p1.y,
        p2.x - p1.y, p2.y - p1.y
    );
}

/*********************************************************************/

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


