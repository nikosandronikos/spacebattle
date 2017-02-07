export class Vector2d {
    constructor(x = 0, y = 0) {
        this._x = x;
        this._y = y;
    }

    static vector2dFromAngle(thetaDegrees, length=1) {
        const thetaRadians = thetaDegrees * (Math.PI / 180);
        const v = new Vector2d(
            length * Math.cos(thetaRadians),
            length * Math.sin(thetaRadians)
        );
        return v;
    }    

    static createFromSum(a, b) {
        const r = new Vector2d(a.x, a.y);
        r.add(b);
        return r; 
    }

    static createFromDifference(a, b) {
        const r = new Vector2d(a.x, a.y);
        r.subtract(b);
        return r; 
    }

    static createFromPoints(p1, p2) {
        return new Vector2d(p2.x - p1.x, p2.y - p1.y);
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
        if (this.length == 0) return this;
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
        this.x = this.x / scalar;
        this.y = this.y / scalar;
        return this;
    }

    rotate(degrees) {
        const thetaRadians = degrees * (Math.PI / 180);
        const x = this._x;
        const y = this._y;
        this.x = x * Math.cos(thetaRadians) - y * Math.sin(thetaRadians);
        this.y = y * Math.cos(thetaRadians) + x * Math.sin(thetaRadians);
        return this;
    }

    angleTo(b) {
        const lengthProduct = this.length * b.length;
        if (lengthProduct === 0) return 0;
        return Math.acos(this.dot(b) / lengthProduct);
    }
}
