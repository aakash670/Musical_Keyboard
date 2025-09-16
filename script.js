document.addEventListener('DOMContentLoaded', () => {
    // Fallback synth for when samples fail to load
    const fallbackSynth = new Tone.PolySynth(Tone.AMSynth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.7, release: 1.5 }
    }).toDestination();
    // Show loading message
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-message';
    loadingDiv.textContent = 'Loading piano sounds...';
    loadingDiv.style = 'font-size:1.2rem;margin-bottom:1rem;color:#fff;background:#2228;padding:0.5rem;border-radius:0.5rem;';
    document.getElementById('app').insertBefore(loadingDiv, document.getElementById('app').firstChild);

    // Get the container for the piano keys
    const pianoContainer = document.getElementById('piano');
    let isAudioReady = false;

    // Use Tone.js Sampler with real piano samples
    let isSamplerReady = false;
    let isSamplerFailed = false;
    const pianoSampler = new Tone.Sampler({
        'C3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/C3.mp3',
        'D3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/D3.mp3',
        'E3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/E3.mp3',
        'F3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/F3.mp3',
        'G3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/G3.mp3',
        'A3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/A3.mp3',
        'B3': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/B3.mp3',
        'C4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/C4.mp3',
        'D4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/D4.mp3',
        'E4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/E4.mp3',
        'F4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/F4.mp3',
        'G4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/G4.mp3',
        'A4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/A4.mp3',
        'B4': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/B4.mp3',
        'C5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/C5.mp3',
        'D5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/D5.mp3',
        'E5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/E5.mp3',
        'F5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/F5.mp3',
        'G5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/G5.mp3',
        'A5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/A5.mp3',
        'B5': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/B5.mp3',
        'C6': 'https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_grand_piano-mp3/C6.mp3',
    }, {
        release: 1,
        onload: () => {
            isSamplerReady = true;
            loadingDiv.textContent = 'Piano ready!';
            setTimeout(() => loadingDiv.remove(), 1200);
            console.log('Piano samples loaded!');
        },
        onerror: () => {
            isSamplerFailed = true;
            loadingDiv.textContent = 'Samples failed, using soft synth.';
            setTimeout(() => loadingDiv.remove(), 1200);
            console.warn('Piano samples failed to load, using fallback synth.');
        }
    }).toDestination();

    // Define all standard keyboard keys (letters, numbers, symbols)
    const qwertyRows = [
        ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ];
    // Flatten all keys for mapping
    const keys = qwertyRows.flat();
    // Generate notes for all keys (spread across 3 octaves)
    const baseNotes = [
        'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
        'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
        'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
        'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6'
    ];
    // Map keys to notes, looping notes if needed
    const keyNoteMap = {};
    keys.forEach((key, index) => {
        keyNoteMap[key] = baseNotes[index % baseNotes.length];
    });

    /**
     * This function generates the HTML for all the piano keys
     */
    function createPianoKeys() {
        // Clear container first
        pianoContainer.innerHTML = '';
        // Arrange keys in QWERTY rows
        qwertyRows.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            row.forEach(key => {
                const note = keyNoteMap[key];
                const keyElement = document.createElement('div');
                keyElement.className = 'key';
                keyElement.dataset.key = key;
                keyElement.innerHTML = `
                    <span class="key-label">${key === ' ' ? 'Space' : key.toUpperCase()}</span>
                    <span class="note-label">${note}</span>
                `;
                rowDiv.appendChild(keyElement);
            });
            pianoContainer.appendChild(rowDiv);
        });
    }

    /**
     * This function plays a note and animates the key
     * @param {string} key - The keyboard letter pressed (e.g., 'a')
     */
    async function playNote(key) {
        // Start the audio context on the very first user interaction
        if (!isAudioReady) {
            await Tone.start();
            isAudioReady = true;
            console.log('Audio context is ready.');
        }

        const note = keyNoteMap[key];
        const keyElement = document.querySelector(`.key[data-key='${key}']`);
        if (isSamplerReady && note && keyElement && pianoSampler._buffers._buffers[note]) {
            pianoSampler.triggerAttackRelease(note, '8n');
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 200);
        } else if (isSamplerFailed && note && keyElement) {
            fallbackSynth.triggerAttackRelease(note, '8n');
            keyElement.classList.add('pressed');
            setTimeout(() => {
                keyElement.classList.remove('pressed');
            }, 200);
        }
    }

    // --- EVENT LISTENERS ---

    // Listen for keyboard presses
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (keyNoteMap[key]) {
            playNote(key);
        }
    });

    // Listen for clicks on the virtual piano keys
    pianoContainer.addEventListener('click', (event) => {
        // Find the closest parent element with the 'key' class
        const keyElement = event.target.closest('.key');
        if (keyElement) {
            const key = keyElement.dataset.key;
            playNote(key);
        }
    });

    // Finally, create the piano!
    createPianoKeys();
});