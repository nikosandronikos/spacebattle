export class Rect {
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

    get x() {return this.x1};
    get y() {return this.y1};
    get width() {return this.x2 - this.x1;}
    get height() {return this.y2 - this.y1;}

    pointIn(x, y) {
        return x >= this.x1 && x <= this.x2 && y >= this.y1 && y <= this.y2;
    }

    quarter() {
        const midX = this.width() / 2 + this.x1;
        const midY = this.height() / 2 + this.y1;
        return [
            new Rect(this.x1, this.y1, midX, midY),
            new Rect(midX, this.y1, this.x2, midY),
            new Rect(this.x1, midY, midX, this.y2),
            new Rect(midX, midY, this.x2, this.y2)
        ];
    }

    midPoint() {
        return {x: (this.width  / 2) + this.x1, y: (this.height / 2) + this.y1};
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
