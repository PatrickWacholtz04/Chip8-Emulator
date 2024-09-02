let FREQ = 280;   // Freq at which "buzzer" is set too

class Speaker {
    constructor() {
        this.audioCtx = new window.AudioContext();
        this.audioCtx.resume();

        // Resume audio on window click / focus
        window.addEventListener('click', () => {
            this.audioCtx.resume;
        });
    }

    play() {
        if (this.audioCtx && !this.oscillator) {
            this.oscillator = this.audioCtx.createOscillator();
            this.oscillator.frequency.setValueAtTime(FREQ, this.audioCtx.currentTime);
            this.oscillator.type = "square";
            this.oscillator.connect(this.audioCtx.destination);
            this.oscillator.start();
        }
    }

    stop() {
        // Stop, disconnect, and delte oscillator
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator.disconnect();
            this.oscillator = null;
        }
    }

    setFreq(newFreq) {
        FREQ = newFreq;
    }

}

export default Speaker;