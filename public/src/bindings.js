


document.addEventListener("DOMContentLoaded", function() {
    // Load keybinding settings
    const storedData = localStorage.getItem('KeyBindings');
    if (storedData) {
        const keyBindings = JSON.parse(storedData);

        // Loop through the keyBindings object and set the input values
        Object.keys(keyBindings).forEach(function(key) {
            const inputField = document.getElementById(`key${key}`);
            if (inputField) {
                inputField.value = keyBindings[key];
            }
        });
    }
});

function saveBinds() {
    // Create an empty object to store the key bindings
    const keyBindings = {};

    // Iterate over the inputs to collect the values
    for (let i = 0; i < 16; i++) {
        const input = document.getElementById(`key${i}`);
        if (input) {
            keyBindings[i] = input.value.toUpperCase();
        }
    }

    

    // Serialize the object to JSON
    const jsonData = JSON.stringify(keyBindings);

    // Save it to localStorage
    localStorage.setItem('KeyBindings', jsonData);

    // Refresh the main page (parent window)
    if (window.opener) {
        window.opener.location.reload();
    }
    // Optionally, close the popup window
    window.close();
}

function loadDefault() {
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
    localStorage.setItem('KeyBindings', jsonData);

    // Refresh the main page (parent window)
    if (window.opener) {
        window.opener.location.reload();
    }
    // Close the popup window
    window.close();
}