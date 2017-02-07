import {Rect} from '../geometry';

export class QuadTree {
    constructor(boundary, min) {
        this.boundary = boundary;
        this.min = min;
        this.root = new QTNode(this, boundary);
    }

    insert(x, y, data) {
        this.root.insert(x, y, data);
    }

    fetch(rect) {
        return this.root.fetch(rect);
    }
}

class QTNode {
    constructor(root, boundary) {
        this.root = root;
        this.boundary = boundary;
        if (boundary.width() <= root.min) {
            this.isLeaf = true;
            this.data = [];
        } else {
            this.isLeaf = false;
            this.children = [];
            this._subdivide();
        }
    }

    _subdivide() {
        this.boundary.quarter().forEach(
            q => this.children.push(new QTNode(this.root, q))
        );
    }

    insert(x, y, data) {
        if (!this.boundary.pointIn(x, y)) return false;

        if (this.isLeaf) {
            this.data.push(data);
            return true;
        }

        this.children.forEach(
            child => { if (child.insert(x, y, data)) return true; }
        );

        return false;
    }

    fetch(rect) {
        let data = [];
        if (this.boundary.intersects(rect)) {
            if (this.isLeaf) return this.data;
            else this.children.forEach(c => data.push(...c.fetch(rect)));
        }
        return data;
    }
}
