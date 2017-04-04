import {Point, Vector2d} from '../2dGameUtils';

export class Spawner {
    constructor(scenario, spawnDfn) {
        this.scenario = scenario;
        this.spawn = spawnDfn.spawn;
        
        if (spawnDfn.spawn == 'player') {
            console.log('Ignoring player spawn');
            this.ignore = true;
            return;
        }
        // now assuming spawnDfn.spawn == prop

        this.layerName = spawnDfn.layer;

        this.propName = spawnDfn.prop;

        this.position = new Point(spawnDfn.position.x, spawnDfn.position.y);
        if ('spawnOffset' in spawnDfn)
            this.spawnOffset = spawnDfn.spawnOffset;
        else
            this.spawnOffset = null;

        if ('spawnDirection' in spawnDfn)
            this.spawnDirection = Vector2d.createFromPoint(spawnDfn.spawnDirection);
        else
            this.spawnDirection = new Vector2d();

        if ('spawnArc' in spawnDfn)
            this.randArcAngle = spawnDfn.spawnArc;
        else
            this.randArcAngle = null;

        // spawnDfn.spawnRate is per minute
        this.spawnDelayMs = 60000 / spawnDfn.spawnRate;
        this.accumTime = 0;

        this.maxTotalSpawn = spawnDfn.maxTotalSpawn;
        this.numSpawned = 0;

        this.maxCurrentSpawn = spawnDfn.maxCurrentSpawn;
        this.currentSpawned = 0;
    }

    update(timeDelta) {
        if (this.ignore) return;
        if (this.numSpawned >= this.maxTotalSpawn
            || this.currentSpawned >= this.maxCurrentSpawn
        ) return;

        this.accumTime += timeDelta;

        if (this.accumTime < this.spawnDelayMs) return;

        this.accumTime = 0;


        let     xOffset = 0,
                yOffset = 0;

        if (this.spawnOffset !== null) {
            xOffset += Math.random() * (this.spawnOffset.x * 2) - this.spawnOffset.x;
            yOffset += Math.random() * (this.spawnOffset.y * 2) - this.spawnOffset.y;
        }

        let direction;
        if (this.randArcAngle !== null) {
            // modify spawnDirection
            const modAngle = Math.random() * this.randArcAngle - this.randArcAngle / 2;
            direction = this.spawnDirection.copy().rotate(modAngle);
        } else {
            direction = this.spawnDirection;
        }

        this.scenario.createProp(
            this.propName,
            {x: this.position.x + xOffset,  y: this.position.y + yOffset},
            {x: direction.x,                y: direction.y},
            this.layerName
        );
    }
};

