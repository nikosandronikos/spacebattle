"use strict"

function drawSegment(s, colour) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${s.position.x},${s.position.y} l${s.vector.x},${s.vector.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', colour);
    path.setAttribute('stroke-width', '0.1');
    path.setAttribute('marker-end', 'url(#arrow)');
    document.querySelector('#gameobjects').appendChild(path);
}

function drawPoint(point, colour) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', '0.12');
    circle.setAttribute('fill', colour);
    document.querySelector('#gameobjects').appendChild(circle);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '0');
    text.setAttribute('y', '0');
    text.setAttribute('font-size', '0.03');
    text.setAttribute('transform', `scale(1,-1) translate(${point.x+0.15},-${point.y-0.1})`);
    text.setAttribute('fill', colour);
    text.innerHTML = `(${point.x.toFixed(2)},${point.y.toFixed(2)})`;
    document.querySelector('#gameobjects').appendChild(text);
}

function drawBoundary(position, colour) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', position.x);
    circle.setAttribute('cy', position.y);
    circle.setAttribute('r', boundingRadius);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', colour);
    circle.setAttribute('stroke-width', '0.05');
    document.querySelector('#gameobjects').appendChild(circle);
}

function drawRect(rect, colour) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    e.x.baseVal.value = rect.x1;
    e.y.baseVal.value = rect.y1;
    e.width.baseVal.value = rect.width;
    e.height.baseVal.value = rect.height;
    e.setAttribute('fill', 'none');
    e.setAttribute('stroke', colour);
    e.setAttribute('stroke-width', '0.05');
    document.querySelector('#gameobjects').appendChild(e);
}

function drawText(str, point, size) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('font-size', size);
    let y = -point.y - 0.1;
    text.setAttribute('transform', `scale(1,-1) translate(${point.x+0.15},${y})`);
    text.innerHTML = str;
    document.querySelector('#gameobjects').appendChild(text);
}
