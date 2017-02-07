import {Point} from './point';
import {Vector2d} from './vector2d';

export class PositionVector {
    constructor(posX=0, posY=0, vectorX=0, vectorY=0) {
        this.position = new Point(posX, posY);
        this.vector = new Vector2d(vectorX, vectorY);
    }

    static createFromPoints(p1, p2) {
        return new PositionVector(
            p1.x, p1.y,
            p2.x - p1.x, p2.y - p1.y
        );
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
