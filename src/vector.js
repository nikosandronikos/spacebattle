class Vector2d {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
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
    
    add(vector2d_b) {
        this.x += vector2d_b.x;
        this.y += vector2d_b.y;
    }

    subtract(vector2d_b) {
        this.x -= vector2d_b.x;
        this.y -= vector2d_b.y;
    }
}

function vector2d_from_angle(theta_degrees, length=1) {
    const theta_radians = theta_degrees * (Math.PI / 180);
    const v = new Vector2d(
        length * Math.cos(theta_radians),
        length * Math.sin(theta_radians)
    );
    return v;
    

function vector2d_sum(a, b) {
    const r = new Vector2d(a.x, a.y);
    r.add(b);
    return r; 
}

