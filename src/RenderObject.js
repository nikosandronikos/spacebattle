class RenderObject {
    constructor(domObject) {
        this.domObject = domObject;
        this.x = 50;
        this.y = 50;
        this.rotateAngle = 0;
    }

    move(vector2d) {
        this.x = this.x + vector2d.x;
        this.y = this.y + vector2d.y;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle})`);
    }

    moveTo(x, y) {
        this.x = x;
        this.y = y;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle})`);
    }

    rotate(angleDegrees) {
        // SVG coordinate system is flipped 
        this.rotateAngle = angleDegrees;
        this.domObject.setAttribute('transform', `translate(${this.x},${this.y}) rotate(${this.rotateAngle})`);
    } 
}

const colours = ['blue', 'red', 'green', 'pink', 'cyan', 'white', 'purple', 'hotpink', 'lime', 'mediumvioletred'];
currentColour = 0;

function createRenderObject(assetName, size) {
    const boundRadius = size / 2;
    switch (assetName) {
        case "randomColouredBall":
            {
                const domObject = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                domObject.setAttribute('r', size);
                domObject.setAttribute('fill', colours[currentColour++ % 10]);
                document.querySelector('#gameobjects').appendChild(domObject);
                return new RenderObject(domObject);
            }
        case "tri":
            {
                const domObject = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const p1 = vector2dFromAngle(135, boundRadius);
                const p2 = vector2dFromAngle(135+90, boundRadius);
                domObject.setAttribute('d', `M${boundRadius},0 L${p1.x},${p1.y} ${p2.x},${p2.y} z`);
                domObject.setAttribute('fill', 'red');
                document.querySelector('#gameobjects').appendChild(domObject);
                return new RenderObject(domObject);
            }
    }
}
