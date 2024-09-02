class Keyboard {
    constructor() {
        // Load keymap from localstorage (local meaning browser)
        const storedData = localStorage.getItem('KeyBindings');
        if (storedData) {
            this.keymap = JSON.parse(storedData);
        }

        /*
        this.keymap = {
            49: 0x1, // 1 | 1
            50: 0x2, // 2 | 2
            51: 0x3, // 3 | 3
            52: 0xc, // 4 | C
            81: 0x4, // Q | 4
            87: 0x5, // W | 5
            69: 0x6, // E | 6
            82: 0xD, // R | D
            65: 0x7, // A | 7
            83: 0x8, // S | 8
            68: 0x9, // D | 9
            70: 0xE, // F | E
            90: 0xA, // Z | A
            88: 0x0, // X | 0
            67: 0xB, // C | B
            86: 0xF  // V | F
        }
        */
        
        console.log(this.keymap);

        this.keysPressed = [];
        this.onNextKeyPress = null;

        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }

    isKeyPressed(keyCode) {
        return this.keysPressed[keyCode];
    }

    onKeyDown(event) {
        let input = String.fromCharCode(event.which);
        let key = getKeyByValue(this.keymap, input)

        this.keysPressed[key] = true;

        if (this.onNextKeyPress !== null && key) {
            this.onNextKeyPress(parseInt(key));
            this.onNextKeyPress = null;
        }

        // Set button class to "pressed" to mirror keyboard input
        try {
            document.getElementById(`b${key}`).classList = "pressed";
        }
        catch {
            console.log("Not a valid key");
        }
    }

    onKeyUp(event) {
        let input = String.fromCharCode(event.which);
        let key = getKeyByValue(this.keymap, input)
        this.keysPressed[key] = false;

        // Remove class "pressed" from key to mirror keyboard input
        try {
            document.getElementById(`b${key}`).classList = "";
        }
        catch {
            console.log("Not a valid key");
        }
    }
    
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key =>
        object[key] === value);
}

export default Keyboard;