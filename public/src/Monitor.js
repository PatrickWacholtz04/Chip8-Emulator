const COLS = 64;
const ROWS = 32;
const SCALE = 15;

let OFF = '#000';
let ON = '#FFF';

class Monitor {
    constructor(canvas) {
        // Define instance variables from consts
        this.cols = COLS;
        this.rows = ROWS;
        this.scale = SCALE;
        this.canvas = canvas;

        // Create array to hold screen pixel values and 
        this.display = new Array(this.rows * this.cols);
        
        // Define the canvas width/height
        this.canvas.width = this.cols * this.scale;
        this.canvas.height = this.rows * this.scale;
        
        // Set the canvas context to 2d
        this.canvasCtx = this.canvas.getContext("2d");
    }

    // Bitwise XOR pixel at (x, y)
    setPixel(x, y) {
        // Handle vertical wrapping
        if (x > this.cols)
            x -= this.cols;
        else if (x < 0)
            x += this.cols;
        // Handle horizontal wrapping
        if (y > this.rows)
            y -= this.rows;
        else if (y < 0)
            y += this.rows;
        
        // Bitwise XOR the passed pixel
        this.display[x + (y * this.cols)] ^= 1;
        return this.display[x + (y * this.cols)] != 1;
    }

    // Clear the entire screen
    clear() {
        // Clear the screen by setting the display to a new, empty array
        this.display = new Array(this.rows * this.cols);
    }

    paint() {
        // Set the background color and fill 
        this.canvasCtx.fillStyle = OFF;
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Loop through all pixel positions
        for (let i = 0; i < this.rows * this.cols; i++) {
            // Calculate the x/y positions
            let x = (i % this.cols) * this.scale;
            let y = Math.floor(i / this.cols) * this.scale;
            
            // Check if the pixel is set to 1 (on), if it is then fill white
            if (this.display[i] == 1) {
                this.canvasCtx.fillStyle = ON;
                this.canvasCtx.fillRect(x, y, this.scale, this.scale);
            }
        }
    }

    testRender() {
        this.setPixel(5, 5);
        this.setPixel(5, 3);
        this.paint();
    }

    setColors(offColor, onColor) {
        OFF = offColor;
        ON = onColor;
    }

}

export default Monitor;