const MEMORY_SIZE = 4096 // 4kb of ram
const NUM_REGISTERS = 16;

class Chip8 {
    constructor(monitor, keyboard, speaker) {
        // Hardware simulation
        this.memory = new Uint8Array(MEMORY_SIZE);
        this.v = new Uint8Array(NUM_REGISTERS);
        this.index = 0;         // Register index
        this.pc = 0x200;        // Program counter. Registers 0x000 - 0x1FF are reserved for the interpreter
        this.stack = [];        // Create stack
        this.sp = 0;            // Stack pointer
        this.delayTimer = 0;    
        this.soundTimer = 0;
        
        this.monitor = monitor;     // Assign monitor from constructor param
        this.keyboard = keyboard;   // Assign keyboard from constructor param
        this.speaker = speaker;     // Assign speaker from constructor param

        this.paused = false;        // Set the paused state to false, not paused
        this.speed = 10;            // CPU cycle speed
    }

    loadSpritesIntoMemory() {
        const sprites = [
            0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ];

        for (let i = 0; i < sprites.length; i++) {
            this.memory[i] = sprites[i];
        }
    }

    loadProgramIntoMemory(program) {
        for (let i = 0; i < program.length; i++) {
            this.memory[0x200 + i] = program[i];
        }
    }

    cycle() {
        for (let i = 0; i < this.speed; i++) {
            if (!this.paused) {
                let opcode = (this.memory[this.pc] << 8 | this.memory[this.pc + 1]);
                this.interpretInstruction(opcode);
            }
        }
        
        // Decrement timers
        if (!this.paused) {
            this.updateTimers();
            this.sound();
        }
        // Display
        this.monitor.paint();
    }

    updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer -= 1;
        }
        if (this.soundTimer > 0) {
            this.soundTimer -= 1;
        }
    }

    sound() {
        if (this.soundTimer > 0) {
            this.speaker.play();
        }
        else {
            this.speaker.stop();
        }
    }

    interpretInstruction(instruction) {
        // Increment program counter by two 
        this.pc += 2;

        // X, Y, and kk are used in a lot of the instructions, so we will go ahead and grab them
        // If the instructions use x/y, they will always be formatted ?XY?. 
        // Use bitwise AND to extract x and y.
        let x = (instruction & 0x0F00) >> 8; // Shift right 8 bits to remove trailing 0s
        let y = (instruction & 0x00F0) >> 4; // Shift right 4 bits to remove trailing 0s

        // Use switch statment to select the correct behavior
        switch(instruction & 0xF000) {  // First, compare the first byte
            case 0x0000:    // Instructions formatted 0???
                switch (instruction) {
                    case 0x00E0:
                        // CLS, clear the display
                        this.monitor.clear();
                        break;
                    case 0x00EE:
                        // RET, return from subroutine
                        this.pc = this.stack.pop();
                        break;
                }
                break;
            case 0x1000:    // Instructions formatted 1???
                // JP addr, jump to address nnn (1nnn)
                this.pc = (instruction & 0xFFF);
                break;
            case 0x2000:    // Instructions formatted 2???
                // CALL addr, call subroutine at nnn (2nnn)
                this.stack.push(this.pc);
                this.pc = (instruction & 0xFFF);
                break;
            case 0x3000:     // Instructions formatted 3???
                // SE Vx, byte, skip next instruction if Vx = kk (3xkk)
                if(this.v[x] === (instruction & 0xFF))
                    this.pc += 2;
                break;
            case 0x4000:    // Instructions formatted 4???
                //SNE Vx, byte, skip next instruction if Vx != kk (4xkk)
                if (this.v[x] != (instruction & 0xFF)) {
                    this.pc += 2;
                }
                break;
            case 0x5000:    // Instructions formatted 5???
                // SE Vx, Vy, skip next instruction if Vx = Vy (5xy0)
                if (this.v[x] === this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0x6000:    // Instructions formatted 6???
                // LD Vx, byte, set Vx = kk (6xkk)
                this.v[x] = (instruction & 0xFF); // LD Vx, byte
                break;
            case 0x7000:    // Instructions formatted 7???
                // Add Vx, byte, set Vx = Vx + kk (7xkk)
                this.v[x] += (instruction & 0xFF); // ADD Vx, byte
                break;
            case 0x8000:    // Instructions formatted 8???
                // All of this instruction set is formatted 8xy?
                switch(instruction & 0xF) {
                    case 0x0:    // Instruction 8xy0
                        // LD Vx, Vy, set Vx = Vy
                        this.v[x] = this.v[y];
                        break;
                    case 0x1:    // Instruction 8xy1
                        // OR Vx, Vy, set Vx = Vx OR Vy
                        this.v[x] |= this.v[y];
                        break;
                    case 0x2:    // Instruction 8xy2
                        // AND Vx, Vy, set Vx = Vx AND Vy
                        this.v[x] &= this.v[y];
                        break;
                    case 0x3:    // Instruction 8xy3
                        // XOR Vx, Vy, set Vx = Vx XOR Vy
                        this.v[x] ^= this.v[y];
                        break;
                    case 0x4:    // Instruction 8xy4
                        // ADD Vx, Vy, set Vx = Vx + Vy, set VF = carry
                        let sum = (this.v[x] += this.v[y]);  // add Vx, Vy
                        this.v[0xF] = 0;    // set VF, 0

                        if (sum > 0xFF) {   // 0xFF is the maximum size for two bytes, so if its larger it has overflown
                            this.v[0xF] = 1;
                        }

                        this.v[x] = sum;

                        break;
                    case 0x5:    // Instruction 8xy5
                        // SUB Vx, Vy, set Vx = Vx - Vy, set VF = NOT borrow

                        this.v[0xF] = 0;            
                        if(this.v[x] > this.v[y])
                            this.v[0xF] = 1;
                        
                        this.v[x] -= this.v[y];
                        break;
                    case 0x6:    // Instruction 8xy6
                        // SHR Vx {, Vy}, set Vx = Vx SHR 1
                        this.v[0xF] = this.v[x] & 0x1   // If the least-significant bit of Vx is 1, then VF is set to 1, otherwise 0
                        this.v[x] >>= 1;

                        break;
                    case 0x7:    // Instruction 8xy7
                        // SUBN Vx, Vy, set Vx = Vy - Vx, set VF = NOT borrow
                        this.v[0xF] = 0;       
                        if(this.v[y] > this.v[x])
                            this.v[0xF] = 1;

                        this.v[x] = this.v[y] - this.v[x];
                        break;
                    case 0xE:    // Instruction 8xyE
                        // SHL Vx {, Vy}, set Vx = Vx SHL 1
                        this.v[0xF] = this.v[x] & 0x80;
                        this.v[x] <<= 1;
                        break;
                    default:
                        throw new Error(`BAD OPCODE ${instruction.toString(16)}`);
                }
                break;
            case 0x9000:    // Instructions formatted 9???
                // Skip next instruction if Vx != Vy 9xy0
                if (this.v[x] != this.v[y]) {
                    this.pc += 2;
                }
                break;
            case 0xA000:    // Instructions formatted A???
                // Set I = nnn  Annn
                this.index = instruction & 0x0FFF;
                break;
            case 0xB000:    // Instructions formatted B???
                // Jump to location nnn + V0, Bnnn
                this.pc = (instruction & 0x0FFF) + this.v[0];
                break;
            case 0xC000:    // Instructions formatted C???
                // RND Vx, byte, Set Vx = random byte and kk, Cxkk
                let rnd = Math.floor(Math.random() * 0xFF);
                this.v[x] = rnd & (instruction & 0xFF);
                break;
            case 0xD000:    // Instructions formatted D???
                let width = 8; // DRW Vx, Vy, nibble
                let height = (instruction & 0xF);
                
                this.v[0xF] = 0;

                for(let row = 0; row < height; row++) {
                    let sprite = this.memory[this.index + row];

                    for(let col = 0; col < width; col++) {
                        if((sprite & 0x80) > 0) {
                            if(this.monitor.setPixel(this.v[x] + col, this.v[y] + row)) {
                                this.v[0xF] = 1;
                            }
                        }
                        sprite <<= 1;
                    }
                }

                break;
            case 0xE000:    // Instructions formatted E???
                switch (instruction & 0xFF) { // Ex??
                    case 0x9E: // Ex9E
                        // SKIP Vx, skip next instruction if key with value of Vx is pressed
                        if (this.keyboard.isKeyPressed(this.v[x])) {
                            this.pc += 2;
                        }
                        break;
                    case 0xA1: // ExA1
                        // SKNP Vx, skip next instruction if key with value of Vx is not pressed
                        if (!this.keyboard.isKeyPressed(this.v[x])) {
                            this.pc += 2;
                        }
                        break;
                    default:
                        throw new Error(`BAD OPCODE ${instruction.toString(16)}`);
                }
                break;
            case 0xF000:    // Instructions formatted F???
                switch (instruction & 0xFF) { // Fx??
                    case 0x07:    // Fx07
                        // LD Vx, DT, set Vx = delay timer
                        this.v[x] = this.delayTimer;
                        break;
                    case 0x0A:    // Fx0A
                        // LD Vx, K, wait for a key press, store the value of the key in Vx
                        this.paused = true;     // Wait

                        let nextKeyPress = (key) => {   // Save keypress to Vx and unpause
                            this.v[x] = key;
                            this.paused = false;
                        }

                        this.keyboard.onNextKeyPress = nextKeyPress.bind(this);
                        
                        break;
                    case 0x15:    // Fx15
                        // LD DT, Vx, set delay timer = Vx
                        this.delayTimer = this.v[x];
                        break;
                    case 0x18:    // Fx18
                        // LD ST, Vx, set sound timer = Vx
                        this.soundTimer = this.v[x];
                        break;
                    case 0x1E:    // Fx1E
                        // ADD I, Vx, set I = I + Vx
                        this.index += this.v[x];
                        break;
                    case 0x29:    // Fx29
                        // LD F, Vx, set I = location of sprite for digit Vx
                        this.index = this.v[x] * 5;
                        break;
                    case 0x33:    // Fx33
                        // LD B, Vx, store BCD representation of Vx in memory locations I, I+1, and I+2
                        this.memory[this.index] = parseInt(this.v[x] / 100);
                        this.memory[this.index + 1] = parseInt((this.v[x] % 100) / 10);
                        this.memory[this.index + 2] = parseInt(this.v[x] % 10);
                        break;
                    case 0x55:    // Fx55
                        // LD[I], Vx, store registers V0 through Vx in memory starting at location I
                        for (let ri = 0; ri <= x; ri++) {
                            this.memory[this.index + ri] = this.v[ri];
                        } 

                        break;
                    case 0x65:    // Fx65
                        // LD Vx, [I], read registers V0-Vx from memory starting at location I
                        for (let ri = 0; ri <= x; ri++) {
                            this.v[ri] = this.memory[this.index + ri];
                        }

                        break;
                    default:
                        throw new Error(`BAD OPCODE ${instruction.toString(16)}`);
                }
                break;
            default:
                throw new Error(`BAD OPCODE ${instruction.toString(16)}`);
        }



    }
}

export default Chip8;