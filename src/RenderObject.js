import {Vector2d} from './2dGameUtils/src/geometry';

export class RenderObject {
    constructor(domObject) {
        this.domObject = domObject;
        this.x = 50;
        this.y = 50;
        this.rotateAngle = 0;
        this.invertY = false;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle}) ${this.invertY?'scale(1,-1)':''}`);
    }

    move(vector2d) {
        this.x = this.x + vector2d.x;
        this.y = this.y + vector2d.y;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle}) ${this.invertY?'scale(1,-1)':''}`);
        return this;
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle}) ${this.invertY?'scale(1,-1)':''}`);
        return this;
    }

    rotate(angleDegrees) {
        // SVG coordinate system is flipped 
        this.rotateAngle = angleDegrees;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle}) ${this.invertY?'scale(1,-1)':''}`);
        return this;
    } 

    remove() {
        this.domObject.parentNode.removeChild(this.domObject);
        this.domObject = null;
        return this;
    }
}

const SvgNamespace = 'http://www.w3.org/2000/svg';

const colours = ['blue', 'red', 'green', 'pink', 'cyan', 'white', 'purple', 'hotpink', 'lime', 'mediumvioletred'];
let currentColour = 0;

export function createRenderObject(assetName, size) {
    const boundRadius = size / 2;
    switch (assetName) {
        case "randomColouredBall":
            {
                const domObject = document.createElementNS(SvgNamespace, 'circle');
                domObject.setAttribute('r', size);
                domObject.setAttribute('fill', colours[currentColour++ % 10]);
                document.querySelector('#gameobjects').appendChild(domObject);
                return new RenderObject(domObject);
            }
        case "tri":
            {
                const domObject = document.createElementNS(SvgNamespace, 'path');
                const p1 = Vector2d.createFromAngle(135, boundRadius);
                const p2 = Vector2d.createFromAngle(135+90, boundRadius);
                domObject.setAttribute('d', `M${boundRadius},0 L${p1.x},${p1.y} ${p2.x},${p2.y} z`);
                domObject.setAttribute('fill', 'red');
                document.querySelector('#gameobjects').appendChild(domObject);
                return new RenderObject(domObject);
            }
    }
}

export function createRenderText(str, size) {
    const domObject = document.createElementNS(SvgNamespace, 'text');
    domObject.innerHTML = str;
    domObject.setAttribute('font-size', size);
    domObject.setAttribute('fill', 'white');
    document.querySelector('#gameobjects').appendChild(domObject);
    const ro = new RenderObject(domObject);
    ro.invertY = true;
    return ro;
}