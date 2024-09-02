import Monitor from "./Monitor.js";
import Keyboard from "./Keyboard.js";
import Speaker from "./Speaker.js";
import Chip8 from "./Chip8.js";

let FPS = 60;     // Chip8 runs at 60hz. Default option.
let loop, fpsInterval, startTime, now, then, elapsed;

// Populate table with register data
function fillRegisterTable(tableId, v) {
    var table = document.getElementById(tableId);
    var oldBody = table.tBodies[0];

    var t = "";
    for (var i = 0; i < v.length; i++) {
        var tr = "<tr>";
        tr += "<td>" + i.toString(16).toUpperCase() + "</td>";
        tr += "<td>" + v[i].toString(16).toUpperCase() + "</td>";
        tr += "</tr>";
        t += tr;
    }

    oldBody.innerHTML = t;
}

// Populate table with stack data
function fillStack(tableId, stack) {
    var table = document.getElementById(tableId);
    var oldBody = table.tBodies[0];

    var t = "";
    for (var i = 15; i >= 0; i--) {
        let value = (stack[i] == undefined) ? "" : stack[i].toString(16).toUpperCase();

        var tr = "<tr>";
        tr += "<td>" + value + "</td>";
        tr += "</tr>";
        t += tr;
    }

    oldBody.innerHTML = t;
}

// Create event listener for the reload button
const reloadButton = document.getElementById('reload');
reloadButton.addEventListener('click', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    console.log(rom);
    loadRom(rom);
});

// Create event listener for rom selector drop-down
const romSelector = document.getElementById('roms');
romSelector.addEventListener('change', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    console.log(rom);
    loadRom(rom);
});

// Create event listener for hz selector drop-down
const hzSelector = document.getElementById("hz");
hzSelector.addEventListener('change', () => {
    const rom = romSelector.options[romSelector.selectedIndex].value;
    FPS = hzSelector.options[hzSelector.selectedIndex].value;
    console.log(rom, FPS);
    loadRom(rom);
});


// Get the loading text element
const loadingText = document.getElementById("loading-text");

function loadRom(romName) {
    const monitor = new Monitor(document.getElementById("screen") );
    const keyboard = new Keyboard();
    const speaker = new Speaker();
    const chip8 = new Chip8(monitor, keyboard, speaker);

    const buzzerFreq = document.getElementById('buzzer-freq');
    let offPixel = document.getElementById('off-color');
    let onPixel = document.getElementById('on-color');


    window.cancelAnimationFrame(loop);

    function step() {
        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            chip8.cycle();
            chip8.sound();

            then = now;
        }
        
        chip8.monitor.setColors(offPixel.options[offPixel.selectedIndex].text,
                                onPixel.options[onPixel.selectedIndex].text);
        chip8.speaker.setFreq(buzzerFreq.value);

        fillRegisterTable("register-output", chip8.v);
        fillStack("stack-output", chip8.stack);

        loop = requestAnimationFrame(step);
    }

    const url = `/rom/${romName}`;
    fetch(url).then(res => res.arrayBuffer())
            .then(buffer => {
                    console.log(buffer.byteLength);
                    const program = new Uint8Array(buffer);
                    fpsInterval = 1000 / FPS;
                    then = Date.now();
                    startTime = then;
                    reloadButton.disabled = false;
                    chip8.loadSpritesIntoMemory();
                    chip8.loadProgramIntoMemory(program);
                    loop = requestAnimationFrame(step);
                    loadingText.innerHTML = `Playing ${romName} at ${FPS}hz.`;
    });

}

// On page load, check for keybindings local data
const storedData = localStorage.getItem('KeyBindings');
if (!storedData) {  // If there are no keybindings saved
    // Create default bindings
    const defaultBindigns = {
        0x0 : "X",
        0x1 : "1",
        0x2 : "2",
        0x3 : "3",
        0x4 : "Q",
        0x5 : "W",
        0x6 : "E",
        0x7 : "A",
        0x8 : "S",
        0x9 : "D",
        0xA : "Z",
        0xB : "C",
        0xC : "4",
        0xD : "R",
        0xE : "F",
        0xF : "V"
    }
    const jsonData = JSON.stringify(defaultBindigns);
    try {
        localStorage.setItem('KeyBindings', jsonData);
        console.log("success");
        alert("Default keybindings loaded");
    } catch (error) {
        alert(error);
    }
}

// Load default rom
loadRom("PICTURE");