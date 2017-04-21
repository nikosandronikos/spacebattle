import {Keyboard} from '../src/2dGameUtils';
import {BulletObject, BigAsteroidObject, AsteroidObject, PlanetObject} from '../src/game/props.js';

export const gameData = {
   ships: {
        uship: {
            sprite: 'uship',
            physics: {
                boundingRadius:   22,
                mass:         10,
                maxSpeed:     8,
                rotateRate:   10,
                thrusters: [{power: 10, angle: 0}]
            },
            stats: {
                hp: 100
            }//,
            //modules: [cannon, tractor]
        },
        greenship: {
            sprite: 'greenship',
            physics: {
                "boundingRadius":   22,
                "mass":         15,
                "maxSpeed":     10,
                "rotateRate":   8,
                "thrusters": [
                    {"power": 10, "angle": 0},
                    {"power": 10, "angle": 180}
                ]
            },
            stats: {
                hp: 100
            }//,
            //modules: [cannon, tractor]
        }
    },
    bindings: [{
        thrusters:      [Keyboard.KEY_UP, Keyboard.KEY_DOWN],
        rotate_left:    Keyboard.KEY_LEFT,
        rotate_right:   Keyboard.KEY_RIGHT,
        module1:        Keyboard.KEY_SPACE,
        module2:        Keyboard.LEFT_SHIFT
        }, {
        thrusters:      Keyboard.KEY_W,
        rotate_left:    Keyboard.KEY_A,
        rotate_right:   Keyboard.KEY_D,
        module1:        Keyboard.KEY_F,
        module2:        Keyboard.KEY_G
    }],
    props: {
        StarBigRed:         { sprite: 'Stars_001-Big Red-0' },
        StarBigBlue:        { sprite: 'Stars_001-Big Blue-1' },
        StarBigBrightBlue:  { sprite: 'Stars_001-Big Bright Blue-2' },
        StarMedRed:         { sprite: 'Stars_001-Med Red-3' },
        StarMedLightBlue:   { sprite: 'Stars_001-Med Light Blue-4' },
        StarMedBrightBlue:  { sprite: 'Stars_001-Med Bright Blue-5' },
        StarMedGreen:       { sprite: 'Stars_001-Med Green-6' },
        StarMedYellow:      { sprite: 'Stars_001-Med Yellow-7' },
        StarMedPurple:      { sprite: 'Stars_001-Med Purple-8' },
        StarSmallBlue:      { sprite: 'Stars_001-Small Blue-9' },
        StarSmallWhite:     { sprite: 'Stars_001-Small White-10' },
        StarSmallLightBlue: { sprite: 'Stars_001-Small Light Blue-11' },
        bullet: {
            sprite: 'bullet',
            physics: {
                boundingRadius: 2,
                mass: 25,
                maxSpeed: 50 
            },
            controller: BulletObject,
            stats: {
                hp: 1
            }
        },
        bigAsteroid_001: {
            sprite: 'bigAsteroid_001',
            physics: {
                boundingRadius: 28,
                mass: 25,
                maxSpeed: 12
            },
            controller: BigAsteroidObject,
            stats: {
                hp: 100
            }
        },
        smallAsteroid_001: {
            sprite: 'smallAsteroid_001',
            physics: {
                boundingRadius: 14,
                mass: 12,
                maxSpeed: 14
            },
            controller: AsteroidObject,
            stats: {
                hp: 50 
            }
        },
        smallAsteroid_002: {
            sprite: 'smallAsteroid_002',
            physics: {
                boundingRadius: 14,
                mass: 12,
                maxSpeed: 14
            },
            controller: AsteroidObject,
            stats: {
                hp: 50 
            }
        },
        planet: {
            sprite: 'planet',
            physics: {
                boundingRadius: 64,
                mass: 2000,
                maxSpeed: 10
            },
            controller: PlanetObject,
            stats: {
                hp: Infinity
            }
        },
        nebula: {
            sprite: 'nebula--'
        }
    }
};

export const demoScenario = {
    bounds: {x: window.innerWidth*2, y: window.innerHeight*2},
    // generator: stars,    // Levels are basically the same, but different
                            // generators could provide varied options. Do later...
    seed: 1,
    mapLayers: [
        {name: 'far', parallax: 25},
        {name: 'mid', parallax: 50},
        {name: 'near', parallax: 100}
    ],
    map: [{
        type: 'prop',
        layer: 'far',
        prop: 'nebula',
        position: {x: 800, y: 200},
    }, {
        type: 'propField', // aka a starfield, but any prop could be used
        layer: 'near',
        prop: [
            'StarBigRed',
            'StarBigBlue',
            'StarBigBrightBlue',
            'StarMedRed',
            'StarMedLightBlue',
            'StarMedBrightBlue',
            'StarMedGreen',
            'StarMedYellow',
            'StarMedPurple',
            'StarSmallBlue',
            'StarSmallWhite',
            'StarSmallLightBlue'
        ],
        position: {x: window.innerWidth, y: window.innerHeight},
        spawnOffset: {x: window.innerWidth, y: window.innerHeight},
        number: 200
    }, {
        type: 'propField',
        layer: 'mid',
        prop: [
            'StarMedRed',
            'StarMedLightBlue',
            'StarMedBrightBlue',
            'StarMedGreen',
            'StarMedYellow',
            'StarMedPurple',
            'StarSmallBlue',
            'StarSmallWhite',
            'StarSmallLightBlue'
        ],
        position: {x: window.innerWidth, y: window.innerHeight},
        spawnOffset: {x: window.innerWidth, y: window.innerHeight},
        number: 400
    }, {
        type: 'propField',
        layer: 'far',
        prop: ['StarSmallBlue', 'StarSmallWhite', 'StarSmallLightBlue'],
        position: {x: window.innerWidth, y: window.innerHeight},
        spawnOffset: {x: window.innerWidth, y: window.innerHeight},
        number: 800
    }/*, {
        type: 'spawn',
        spawn: 'player',
        position: {"x": 500, "y": 500},
        maxCurrentSpawn: 1, // max number allowed at any one time
        maxTotalSpawn: 1,   // max number to spawn total
        spawnRate: 1,       // per second
        spawnOffset: {x: 0, y: 0}, // radius of spawn circle (it's ar ectangle)
        spawnDirection: {x: 1, y: 1},   // vector indicating spawn direction
        //spawnArc: 0                     // arc through which spawn can occur
    }, {
        type: 'spawn',
        spawn: 'player',
        position: {"x": 1500, "y": 1500},
        maxCurrentSpawn: 1,
        maxTotalSpawn: 1,
        spawnRate: 1,
        spawnOffset: {x: 0, y: 0},
        spawnDirection: {x: -1, y: -1} // magnitude indicates velocity
    }, {
        type: 'spawn',
        spawn: 'prop',
        layer: 'player',
        prop: 'bigAsteroid_001',
        position: {"x": 2500, "y": -500},   // outside bounds
        maxCurrentSpawn: 100,
        //maxTotalSpawn: 0,   // zero means no limit and is default
        spawnRate: 10,
        spawnOffset: {x: 100, y: 100},
        spawnDirection: {x: -1, y: -1}
    }*/, {
        type: 'spawn',
        spawn: 'prop',
        layer: 'player',
        prop: 'bigAsteroid_001',
        position: {"x": 1000, "y": 1000},
        spawnDirection: {x: -1, y: 0},
        maxTotalSpawn: 1,
        maxCurrentSpawn: 100,
        spawnRate: 10,
        spawnArc: 359
    }, {
        type: 'prop',
        layer: 'player',
        prop: 'planet',
        position: {x: 600, y: 1000},
        // motion: {x: 1, y: 1}     optional, this is the default
    }]
};

export const rendererAssets = {
 atlas: ['atlas.json'],
    templates: {
        'ushipBasic': {
            base: {
                type: 'sprite',
                sprite: 'USpaceShip--'
            }
        },
        'uship': {
            base: {
                //name: 'main'             // Name is optional, used to refer to nodes explicitly
                type: 'sprite',             // Can be container|sprite|animatedSprite
                sprite: 'USpaceShip--', // Only for type:sprite
                //animations: [],            // Only for type:animatedSprite
                //pivot: {x: 0.5, y: 0.5},   // Mid point is the default
                //rotation: 90,             // 0 is the default
                //visible: true             /// true|false, true is default
                children: [
                    {
                        name: 'engine',     // Give a name because we'll want to hide this
                        type: 'animatedSprite',
                        position: {x: -18, y: 0}, // Relative to pivot of parent
                        frames: ['USpaceShipEngine--0', 'USpaceShipEngine--1', 'USpaceShipEngine--2'],
                        //animationSpeed: 100      // ms per frame - default is 100
                    },
                    {
                        name: 'engineStart',
                        type: 'animatedSprite',
                        position: {x: -18, y: 0},
                        frames: ['USpaceShipEngine--0', 'USpaceShipEngine--1', 'USpaceShipEngine--2'],
                        visible: false,
                    }
                ]
            },
            configs: {
                engineStart: [
                    {name: 'engine', visible: false, animation: {control: 'stop'}} ,
                    {name: 'engineStart', visible: true, animation: {control: 'start', repeats: 1, onEnd: 'engineOn'}},
                ],
                engineOn: [
                    {name: 'engineStart', visible: false, animation: {control: 'stop'}},
                    {name: 'engine', visible: true, animation: {control: 'start', repeats: Infinity}} 
                ],
                engineOff: [
                    {name: 'engineStart', visible: false, animation: {control: 'stop'}},
                    {name: 'engine', visible: false, animation: {control: 'stop'}} 
                ],
            },
            initialConfig: 'engineOff'
        },
        'explosion': {
            base: {
                type: 'animatedSprite',
                pivot: {x: 0.5, y: 0.5},
                animations: []
            }
        },
        'bigAsteroid_001': {
            base: {
                type: 'sprite',
                sprite: 'asteroid--'
            }
        },
        'smallAsteroid_001': {
            base: {
                type: 'sprite',
                sprite: 'AsteroidSmall--0'
            }
        },
        'smallAsteroid_002': {
            base: {
                type: 'sprite',
                sprite: 'AsteroidSmall--1'
            }
        },
        'planet': {
            base: {
                type: 'sprite',
                sprite: 'planet--'
            }
        },
        'nebula': {
            base: {
                // Thanks to Luis Zeno for the gorgeous nebula graphic
                // https://www.patreon.com/ansimuz
                type: 'sprite',
                sprite: 'nebula--'
            }
        },
        'MarkerCenter': {
            base: {
                type: 'sprite',
                sprite: 'Markers-Center-0'
            }
        },
        'MarkerUL': {
            base: {
                type: 'sprite',
                sprite: 'Markers-UL-1'
            }
        },
        'MarkerUR': {
            base: {
                type: 'sprite',
                sprite: 'Markers-UR-2'
            }
        },
        'MarkerLL': {
            base: {
                type: 'sprite',
                sprite: 'Markers-LL-4'
            }
        },
        'MarkerLR': {
            base: {
                type: 'sprite',
                sprite: 'Markers-LR-3'
            }
        },
        'bullet': {
            base: {
                type: 'sprite',
                sprite: 'bullet--'
            }
        }
   }
};
