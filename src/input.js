// Kind of like a singleton
const Keyboard  = {
    "KEY_UP": 38,
    "KEY_DOWN": 40,
    "KEY_LEFT": 37,
    "KEY_RIGHT": 39,
    "KEY_W": 87,
    "KEY_A": 65,
    "KEY_D": 68,
    "KEY_SPACE": 32,
    "keys": [],
    "keydown_handler": function(evt) {
        Keyboard.keys[evt.keyCode] = true; 
        if (evt.keyCode == Keyboard.KEY_UP ||
            evt.keyCode == Keyboard.KEY_DOWN ||
            evt.keyCode == Keyboard.KEY_LEFT ||
            evt.keyCode == Keyboard.KEY_RIGHT
        )
            evt.preventDefault();
    },
    "keyup_handler": function(evt) {
        //TODO: Remove from array to minimise memory consumption.
        Keyboard.keys[evt.keyCode] = false;
        if (evt.keyCode == Keyboard.KEY_UP ||
            evt.keyCode == Keyboard.KEY_DOWN ||
            evt.keyCode == Keyboard.KEY_LEFT ||
            evt.keyCode == Keyboard.KEY_RIGHT
        )
            evt.preventDefault();
    },
    "pressed": function(keyCode) {
        return Keyboard.keys[keyCode] === true;
    }
}