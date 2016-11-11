window.onload = function() {
    // Physics updates run at a fixed frequency, independent of rendering
    // frame rate.
    const physicsPerSecond = 25;
    const physicsFrameTime = 1000 / physicsPerSecond;
    const framesBeforeDrop = 5;

    let startTime = performance.now();
    let lastTime = startTime;
    let physicsFrameTimeAccumulator = startTime;

    // Performance metrics
    let skippedUpdates = 0;
    let multiUpdates = 0;
    let maxMultiUpdate = 0;

    // world
    const physicsSystem = new PhysicsSystem({minX: 0, minY:0, maxX:100, maxY:100});
    
    const players = [
        createPlayerFromConfig(physicsSystem, {
            "render": {
                "asset":        "tri",
                "size":         10
            },
            "physics": {
                "position": {"x": 30, "y": 50},
                "boundingRadius":   5,
                "mass":         10,
                "rotateRate":   10,
                "maxSpeed":     10,
                "thrusters": [
                    {"power": 10, "angle": 0},
                    {"power": 10, "angle": 180}
                ]
            },
            "control": {
                "thrust":       [Keyboard.KEY_UP, Keyboard.KEY_DOWN],
                "rotate_left":  Keyboard.KEY_LEFT,
                "rotate_right": Keyboard.KEY_RIGHT,
                "tractor":      Keyboard.KEY_SPACE
            }
        }),
        createPlayerFromConfig(physicsSystem, {
            "render": {
                "asset":        "tri",
                "size":         5
            },
            "physics": {
                "position": {"x": 60, "y": 50},
                "boundingRadius":   2.5,
                "mass":         5,
                "rotateRate":   20,
                "maxSpeed":     10,
                "thrusters": [
                    {"power": 10, "angle": 0}
                ]
            },
            "control": {
                "thrust":       [Keyboard.KEY_W],
                "rotate_left":  Keyboard.KEY_A,
                "rotate_right": Keyboard.KEY_D
            }
        })
    ];

    // fix targetting for now since there's only two ships
    players[0].target = players[1];
    players[1].target = players[0];

    for (player of players) {
        physicsSystem.add(player.physicsObject);
    }

    window.addEventListener('keydown', Keyboard.keydown_handler);
    window.addEventListener('keyup', Keyboard.keyup_handler);

    window.requestAnimationFrame(gameloop);

    function teardown() {
        window.removeEventListener('keydown', Keyboard.keydown_handler);
        window.removeEventListener('keyup', Keyboard.keyup_handler);
    }

    function gameloop(time) {
        const timeSinceStart = time - startTime;

        if (timeSinceStart <= 60000) {
            // run for one minute
            window.requestAnimationFrame(gameloop);
        } else {
            console.log(`skipped updates (good) = ${skippedUpdates}`);
            console.log(`multi updates (bad) = ${multiUpdates}`);
            console.log(`max multi update = ${maxMultiUpdate}`);    
            teardown();
            return;
        }

        const frameTime = time - lastTime;
        lastTime = time;

        let loops = 0;
        while (performance.now() > physicsFrameTimeAccumulator && loops < framesBeforeDrop) {
            // using a frameTime less than the full physicsFrameTime to get the 
            // hands behaving properly when an absurdly low physics fps is set.
            // Wouldn't bother in a proper game loop with a high physics fps.
            update(physicsFrameTime);
            physicsFrameTimeAccumulator += physicsFrameTime;
            loops ++;
        }

        // Log some performanc metrics
        if (loops === 0) skippedUpdates++;
        else if (loops > 1) {
            multiUpdates++;
            if (loops > maxMultiUpdate) maxMultiUpdate = loops;
        }

        // Run rendering update, pass the interpolate value, which indicates
        // (using a value between 0 and 1) how far between physics updates we are.
        render((performance.now() + physicsFrameTime - physicsFrameTimeAccumulator) / physicsFrameTime);
    }

    function update(time) {
        for (player of players) {
            player.update();
        }
        physicsSystem.update(physicsFrameTime);
    }

    function render(interoplate) {
        for (player of players) {
            player.renderObject.rotate(player.physicsObject.rotateAngle);
            player.renderObject.moveTo(player.physicsObject.position.x, player.physicsObject.position.y);
        }
    }
}
