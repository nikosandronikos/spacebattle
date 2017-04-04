function escapeXML(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function httpGetAsync(theUrl, callback, callback_data, page)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, callback_data);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function createSVGCircle(x, y, r, id=null) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', 'red');
    if (id !== null) circle.setAttribute('id', id);
    $('svg#world').appendChild(circle);
}

const $ = s => document.querySelector(s);

const colours = ['red', 'blue', 'green', 'cyan', 'black', 'purple'];

const modelNames = {};

function svgVector(pos, v, parent, colour='black', id=null) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${pos.x},${pos.y} l${v.x},${v.y}`);
    path.setAttribute('class', 'vector');
    path.setAttribute('stroke', colour);
    parent.appendChild(path);
}

function svgPositionVector(pv, parent, colour='black', id=null) {
    svgVector(pv.position, pv.motion, parent, colour, id);
}

function outputFrameModelData(logData, frame, modelName) {
    console.log(frame);
    console.log(modelName);
    const model = logData.frames[frame].events[modelName];
    console.log(model);
    const svg = $('svg#world');

     const position = model.motion.length > 0 ? model.motion[0].position : model.startPosition;

    for (let externalForce of model.externalForce) {
        svgVector(position, externalForce, svg, 'green');
    }
    for (let thruster of model.thruster) {
        svgVector(position, thruster, svg, 'blue');
    }
    for (let forceVector of model.forceVector) {
        svgVector(position, forceVector, svg, 'cyan');
    }
    for (let mv of model.motion) {
        console.log(mv);
        svgPositionVector(mv, svg, 'black');
    }
}

function outputPoints(logData) {
    const svg = $('svg#world');
    let nFrames = 0;
    for (let frame of logData.frames) {
        for (let modelName of Object.keys(frame.events)) {
            const model = frame.events[modelName];
            // motion is an array, but only ever has one element
            const position = model.motion.length > 0 ? model.motion[0].position : model.startPosition;
            createSVGCircle(
                position.x,
                position.y,
                1.5,
                `${nFrames}.${modelName}`
            )
        }
        nFrames++; 
    }
    $('#info > #frames').innerHTML = nFrames;
    svg.addEventListener('click', evt => {
        console.log(evt.target.id);
        console.log(evt.target.id.split('.'));
        const [frame, modelName] = evt.target.id.split('.');
        outputFrameModelData(logData, frame, modelName);
    });
    window.addEventListener('keyup', evt => {
        keyPress(evt, logData);
    });
}

function display(logData) {
    const svg = $('svg#world');
    resetSvgView(logData);
    outputPoints(logData);
}

function getLog(jsonFile) {
    const url = `http://localhost:8001/${jsonFile}`;
    httpGetAsync(
        url,
        responseText => display(JSON.parse(responseText))
    );
}

function resetSvgView(logData) {
    const svg = $('svg#world');
    svg.setAttribute(
        'viewBox', 
        `0 0 ${logData.worldSize.width} ${logData.worldSize.height}`
    );
}

function scrollSvg(scrollX, scrollY) {
    const svg = $('svg#world');
    let [x,y,w,h] = svg.getAttribute('viewBox').split(' ').map(v=>v|0);

    x += w / 10 * scrollX;
    y += h / 10 * scrollY;

    svg.setAttribute(
        'viewBox',
        `${x} ${y} ${w} ${h}`
    );
}

function zoomSvg(zoom) {
    const svg = $('svg#world');
    let [x,y,w,h] = svg.getAttribute('viewBox').split(' ').map(v=>v|0);
    
    const cx = x + w / 2, cy = y + h / 2;
    const newW = w * zoom, newH = h * zoom;
    
    svg.setAttribute(
        'viewBox',
        `${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`
    );
}

function keyPress(evt, logData) {
    switch(evt.keyCode) {
        case 87: // w
            scrollSvg(0, -1);
            break;
        case 65: // a
            scrollSvg(-1, 0);
            break;
        case 68: // d
            scrollSvg(1, 0);
            break;
        case 83: // s
            scrollSvg(0, 1);
            break;
        case 81: // q
            zoomSvg(2);
            break;
        case 69: // e
            zoomSvg(0.5);
            break;
        case 82: // r 
            resetSvgView(logData);
            break;
        default:
            console.log(evt.keyCode);
    }
}

window.onload = function() {
    getLog('out.json');
}

