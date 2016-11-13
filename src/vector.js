"use strict";

function vectorCopy(v) {
    return new Vector2d(v.x, v.y);
}

class Vector2d {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    set x(value) {
        this._x = value;
    }

    get x() {
        return this._x;
    }

    set y(value) {
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

function vector2d_from_angle(thetaDegrees, length=1) {
    const thetaRadians = thetaDegrees * (Math.PI / 180);
    const v = new Vector2d(
        length * Math.cos(thetaRadians),
        length * Math.sin(thetaRadians)
    );
    return v;
}    

function vector2d_sum(a, b) {
    const r = new Vector2d(a.x, a.y);
    r.add(b);
    return r; 
}

function vector2d_difference(a, b) {
    const r = new Vector2d(a.x, a.y);
    r.subtract(b);
    return r; 
}

function vector2dFromPoints(p1, p2) {
    return new Vector2d(p2.x - p1.x, p2.y - p1.y);
}
