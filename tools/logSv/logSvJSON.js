const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({port: 9000});

let nextMessageHandler = messageHandler;

const JSONObj = {};

const handlers = {
    created: createdHandler,
    world: worldHandler,
    physicsUpdate: physicsUpdateHandler,
    collision: collisionHandler,
    move: moveHandler,
    frame: frameHandler
};

let writeStream = null;

wss.on(
    'connection',
    ws => {
        writeStream = fs.createWriteStream('out.json');
        ws.on('message', message => {
            nextMessageHandler(message);
        });
        ws.on('close', evt => {
            finalise();
            writeStream.close();
            wss.close();
        });
    }
);

const gameObjects = {};

let buffered = [];

let currentFrame = 0;

let frameData = {};

function frameHandler(m) {
    currentFrame ++;
    frameData = {};
    JSONObj.frames.push({"time": m, "events": frameData});
    process.stdout.write(`${currentFrame}\r`);
    nextMessageHandler = messageHandler;
}

function createdHandler(m) {
    // Expects the following lines:
    // 1. gameObject id
    // 2. physicsModel id
    buffered.push(m);
    if (buffered.length < 2) return;

    gameObjects[buffered[0]] = buffered[1];
    nextMessageHandler = messageHandler;
}

function worldHandler(m) {
    dim = JSON.parse(m.split(';')[1]);
    JSONObj['worldSize'] = {"width": dim.x2, "height": dim.y2};
    JSONObj['frames'] = [];
    nextMessageHandler = messageHandler;
}

function finalise() {
    writeStream.write(JSON.stringify(JSONObj));
}

function vectorObj(v) {
    return {x: v._x, y: v._y};
}

function positionVectorObj(pv) {
    return {position: vectorObj(pv.position), motion: vectorObj(pv.vector)};
}

function getJSONData(m) {
    return JSON.parse(m.split(';')[1]);
}

function physicsUpdateHandler(m) {
    // Format:
    //   'physicsUpdate', model id
    //   ('externalForce' vector)*
    //   ('thruster', vector)*
    //   ('forceVector', vector)?
    //   ('motion', positionVector)?
    //   'endPhysicsUpdate

    buffered.push(m);

    if (m != 'endPhysicsUpdate')
        return;

    const name = buffered[0];

    if (buffered[1] != 'position') throw new Error('physicsUpdate without position');

    const updateObj = {
        name: name,
        startPosition: vectorObj(getJSONData(buffered[2])),
        externalForce: [],
        thruster: [],
        forceVector: [],
        motion: [],
    };

    for(let i = 3; i < buffered.length, buffered[i] !== 'endPhysicsUpdate'; i+=2) {
        const data = getJSONData(buffered[i+1]);
        switch(buffered[i]) {
            case 'externalForce':
            case 'thruster':
            case 'forceVector':
                updateObj[buffered[i]].push(vectorObj(data));
                break;
            case 'motion':
                updateObj[buffered[i]].push(positionVectorObj(data));
                break;
        }
    }

    frameData[name] = updateObj;

    nextMessageHandler = messageHandler;
}

function collisionHandler(m) {
    // Format:
    //   'collision', a id, b id
    //   'aMotion', forceVector
    //   'bMotion', forceVector

    buffered.push(m);
    if (buffered.length < 3) return;

    const   aId = buffered[0],
            bId = buffered[1],
            aMotion = buffered[3],
            bMotion = buffered[5];

    if (!('collision' in frameData[aId])) frameData[aId].collision = [];
    if (!('collision' in frameData[bId])) frameData[bId].collision = [];

    frameData[aId].collision.push(aMotion);
    frameData[bId].collision.push(bMotion);

    nextMessageHandler = messageHandler;
}

function moveHandler(m) {
    // Format:
    //   'move', model id
    //   'motion', positionVector
    //   'position', vector
    nextMessageHandler = messageHandler;

    buffered.push(m);
    if (buffered.length < 5) return;

    const id = buffered[0];
    const vector = JSON.parse(m.split(';')[1]);

    frameData[id].endPosition = vectorObj(vector);

    nextMessageHandler = messageHandler;
}

function messageHandler(m) {
    buffered = [];
    if (m in handlers) {
        nextMessageHandler = handlers[m];
        return;
    }
}
