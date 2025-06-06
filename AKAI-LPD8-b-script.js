// AKAILPD8b-script.js

var AKAILPD8b = {};


// The SysEx message to send to the controller to force the midi controller
// to send the status of every item on the control surface.
var ControllerStatusSysex = [0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x04, 0x05, 0x00, 0x03, 0x01, 0xF7]; //Sniffed from Rekordbox using PocketMIDI

// The SysEx message required to set the lights for the controller is pretty intense
// we need to write this out prior and then modify it depending on how we want to set
// the rgb. Format is : [PAD 1, PAD 1 PUSHED, PAD 2, PAD 2 PUSHED, ... , PAD 8, PAD 8 PUSHED]
//[0xF0, 0x47, 0x7F, 0x4C, 0x01, 0x01, 0x29, 0x00, 0x00, 0x02, 0x01, 0x00, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x25, 0x25, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x26, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x27, 0x27, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x28, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x29, 0x29, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x2A, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2B, 0x2B, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x7F, 0x25, 0x00, 0x00, 0x7F, 0x26, 0x00, 0x00, 0x7F, 0x27, 0x00, 0x00, 0x7F, 0x28, 0x00, 0x00, 0x7F, 0x29, 0x00, 0x00, 0x7F, 0x2A, 0x00, 0x00, 0x7F, 0x2B, 0x00, 0x00, 0x7F, 0xF7]

var lightProgram = [0xF0, 0x47, 0x7F, 0x4C, 0x01, 0x01, 0x29, 0x00, 0x00, 0x02, 0x01, 0x00, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x25, 0x25, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x26, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x27, 0x27, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x28, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x29, 0x29, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x2A, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2B, 0x2B, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x7F, 0x25, 0x00, 0x00, 0x7F, 0x26, 0x00, 0x00, 0x7F, 0x27, 0x00, 0x00, 0x7F, 0x28, 0x00, 0x00, 0x7F, 0x29, 0x00, 0x00, 0x7F, 0x2A, 0x00, 0x00, 0x7F, 0x2B, 0x00, 0x00, 0x7F, 0xF7]

// Specify which deck this is for in the software
var deckNum = "2";


// Store timer IDs
AKAILPD8b.timers = {};

var currentLightColors = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];//var currentLightColors = [pad 1, pad 1 pushed, ..., pad 8, pad 8 pushed] //array of arrays. Each array in the main array is structured [0x01, 0x7F, 0x01, 0x7F, 0x01, 0x7F]. This gives white. They are RRGGBB. Maximum value is 0x01, 0x7F one less is 0x00, 0x7F and minimum is 0x00, 0x00 which would make it black and turn the lights off
var lightsOff = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]; //Which lights are turned off


//
// CONSTANTS
//

AKAILPD8b.colors = {
    red: [0x01, 0x7F, 0x00, 0x00, 0x00, 0x00],
    green: [0x00, 0x00, 0x01, 0x75, 0x00, 0x00],
    blue: [0x00, 0x00, 0x00, 0x00, 0x01, 0x7F],
    white: [0x01, 0x7F, 0x01, 0x7F, 0x01, 0x7F],
    black: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    pink: [0x01, 0x7F, 0x00, 0x43, 0x01, 0x7F],
    magenta: [0x01, 0x7F, 0x00, 0x00, 0x01, 0x7F],
    cyan: [0x00, 0x00, 0x01, 0x7F, 0x01, 0x7F],
    yellow: [0x01, 0x7F, 0x01, 0x7F, 0x00, 0x00],
    darkred: [0x00, 0x43, 0x00, 0x00, 0x00, 0x00],
    orange: [0x01, 0x7F, 0x00, 0x40, 0x00, 0x00],
    limegreen: [0x00, 0x43, 0x01, 0x7F, 0x00, 0x00],
    darkgreen: [0x00, 0x00, 0x00, 0x43, 0x00, 0x00],
    turquoise: [0x00, 0x00, 0x00, 0x43, 0x00, 0x43],
    lightblue: [0x00, 0x00, 0x00, 0x43, 0x01, 0x7F],
    darkblue: [0x00, 0x00, 0x00, 0x00, 0x00, 0x43],
    darkpurple: [0x00, 0x20, 0x00, 0x00, 0x00, 0x3A],
    purple: [0x00, 0x54, 0x00, 0x00, 0x01, 0x7F],
    palegreen: [0x00, 0x00, 0x01, 0x7F, 0x00, 0x43],
    grey: [0x00, 0x20, 0x00, 0x20, 0x00, 0x20], 
    darkgrey: [0x00, 0x5, 0x00, 0x5, 0x00, 0x5],
};

AKAILPD8b.defaultLights = {
    pad1: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad2: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad3: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad4: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad5: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad6: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad7: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },
    pad8: {
        Static: AKAILPD8b.colors.darkgrey,
        Pushed: AKAILPD8b.colors.white,
    },    
};
//
// 
//


//
// TRACK PLAYING STROBE
//

//Configurable
// Calculation of time between steps: (60000 / bpm * AKAILPD8b.beatsPerCycle) / AKAILPD8b.totalDimmingSteps
// For a 125 BPM song, with totalDimmingSteps = 10 and beatsPerCycle = 1 this would equal 96 ms between steps.
// Answer should be no lower than around 50ms
AKAILPD8b.totalDimmingSteps = 20;  // Number of steps for smooth dimming
AKAILPD8b.beatsPerCycle = 4; //How many beats to cycle the dimming over. This is a full cycle
AKAILPD8b.dimAmount = 0.80; //Percent to dim by. 0.25 would dim it by 25%

//No touchie
AKAILPD8b.dimmingStep = 0;  // Current dimming step
AKAILPD8b.dimmingStartBeat = 0;  // Beat number when dimming starts
AKAILPD8b.dimmingInProgress = false;  // Track if dimming is in progress
AKAILPD8b.dimmingState = false;
AKAILPD8b.lastBeatPosition = 0; // Track the last beat position
AKAILPD8b.currentBPM = 0; // Store the current BPM

AKAILPD8b.startSmoothDimming = function() {
    // Get BPM from Mixxx
    AKAILPD8b.currentBPM = engine.getValue("[Channel" + deckNum + "]", "bpm");

    if (AKAILPD8b.currentBPM <= 0) {
        console.warn("BPM is zero or not valid, cannot start dimming.");
        return;
    }

    // Check if track is playing (position should only be valid when playing)
    const isTrackPlaying = engine.getValue("[Channel" + deckNum + "]", "play");
    if (isTrackPlaying === 0) {
        console.warn("Track is not playing, cannot start dimming.");
        return;
    }

    // Calculate the time interval for each dimming step based on BPM
    const msPerBeat = 60000 / AKAILPD8b.currentBPM;  // Milliseconds per beat
    const totalDuration = msPerBeat * AKAILPD8b.beatsPerCycle;  // Total duration (for full dimming cycle)
    const msPerStep = totalDuration / AKAILPD8b.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset dimming step
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingDirection = 'dim';  // Start with dimming
    AKAILPD8b.dimmingInProgress = true;  // Mark that dimming is in progress
    AKAILPD8b.lastBeatPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");

    // Store the current color brightness (starting at full brightness)
    AKAILPD8b.originalColors = currentLightColors;

    // Begin the timer to update dimming at intervals
    AKAILPD8b.timers["smoothDimming"] = engine.beginTimer(msPerStep, AKAILPD8b.updateSmoothDimming);
};

// This function handles each dimming step
AKAILPD8b.updateSmoothDimming = function() {
    if (!engine.getValue("[Channel" + deckNum + "]", "play")) {
        AKAILPD8b.stopSmoothDimming();
        return;
    }

    // Check if BPM has changed
    const newBPM = engine.getValue("[Channel" + deckNum + "]", "bpm");
    if (newBPM !== AKAILPD8b.currentBPM) {
        
        // Calculate new timing based on new BPM
        const msPerBeat = 60000 / newBPM;
        const totalDuration = msPerBeat * AKAILPD8b.beatsPerCycle;
        const newMsPerStep = totalDuration / AKAILPD8b.totalDimmingSteps;
        
        // Stop current timer
        engine.stopTimer(AKAILPD8b.timers["smoothDimming"]);
        
        // Start new timer with adjusted timing
        AKAILPD8b.timers["smoothDimming"] = engine.beginTimer(newMsPerStep, AKAILPD8b.updateSmoothDimming);
        
        AKAILPD8b.currentBPM = newBPM;
    }

    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    
    // Calculate beats passed since last update
    const beatsPassed = (currentPosition - AKAILPD8b.lastBeatPosition) * AKAILPD8b.currentBPM;
    AKAILPD8b.lastBeatPosition = currentPosition;

    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8b.dimmingStep / (AKAILPD8b.totalDimmingSteps / 2);

    // Determine the target brightness based on the current phase (dimming or brightening)
    let targetBrightness;
    if (AKAILPD8b.dimmingDirection === 'dim') {
        targetBrightness = 1 - stepFactor * AKAILPD8b.dimAmount;
    } else {
        targetBrightness = (1 - AKAILPD8b.dimAmount) + stepFactor * AKAILPD8b.dimAmount; // Brighten back to full brightness
    }

    // Calculate the new dimmed color based on the target brightness
    const updatedColors = AKAILPD8b.originalColors.map(function(color) {
        return color.map(function(channelValue) {
            return Math.floor(channelValue * targetBrightness);
        });
    });

    // Update the lights
    AKAILPD8b.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8b.dimmingStep++;

    // If we've completed one phase (dimming or brightening), switch direction
    if (AKAILPD8b.dimmingStep >= AKAILPD8b.totalDimmingSteps / 2) {
        AKAILPD8b.dimmingStep = 0; // Reset the step for the next phase
        AKAILPD8b.dimmingDirection = (AKAILPD8b.dimmingDirection === 'dim') ? 'brighten' : 'dim'; // Switch direction
    }
};

// Function to stop strobing when playback is paused and return to full brightness
AKAILPD8b.stopSmoothDimming = function() {
    engine.stopTimer(AKAILPD8b.timers["smoothDimming"]);
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingInProgress = false;  // Reset strobe state
    AKAILPD8b.dimmingDirection = 'dim';
    AKAILPD8b.setLights(currentLightColors);
};  

//RAINBOW ROTATING THROUGH ALL PADS SAME COLOR (Not using but it's totally usable)
/*AKAILPD8b.totalDimmingSteps = 30;  // Number of steps for smooth color transition (you can adjust this value)
AKAILPD8b.beatsPerCycle = 2; // Number of beats to cycle the rainbow over (full cycle)

AKAILPD8b.startRainbowCycle = function() {
    // Get BPM from Mixxx
    const bpm = engine.getValue("[Channel" + deckNum + "]", "bpm");

    if (bpm <= 0) {
        console.warn("BPM is zero or not valid, cannot start rainbow cycle.");
        return;
    }

    // Check if track is playing (position should only be valid when playing)
    const isTrackPlaying = engine.getValue("[Channel" + deckNum + "]", "play");
    if (isTrackPlaying === 0) {
        console.warn("Track is not playing, cannot start rainbow cycle.");
        return;
    }

    // Fetch the current position of the track (normalized from 0.0 to 1.0)
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    if (currentPosition === null || currentPosition === 0.0) {
        console.warn("Invalid position value, cannot start rainbow cycle.");
        return;
    }

    // Calculate the time interval for each color change based on BPM
    const msPerBeat = 60000 / bpm;  // Milliseconds per beat
    const totalDuration = msPerBeat * AKAILPD8b.beatsPerCycle;  // Total duration (for full rainbow cycle)
    const msPerStep = totalDuration / AKAILPD8b.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset the dimming step
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingDirection = 'forward';  // Start with forward cycling
    AKAILPD8b.dimmingInProgress = true;  // Mark that the rainbow effect is in progress

    // Begin the timer to update rainbow colors at intervals
    AKAILPD8b.timers["rainbowCycle"] = engine.beginTimer(msPerStep, AKAILPD8b.updateRainbowCycle);
};

// This function handles each rainbow color change step
AKAILPD8b.updateRainbowCycle = function() {
    if (!engine.getValue("[Channel" + deckNum + "]", "play")) {
        AKAILPD8b.stopRainbowCycle();
        return;
    }

    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8b.dimmingStep / AKAILPD8b.totalDimmingSteps;

    // Define the rainbow colors (only 7 colors)
    const rainbowColors = [
        AKAILPD8b.colors.red,        // Red
        AKAILPD8b.colors.orange,     // Orange
        AKAILPD8b.colors.yellow,     // Yellow
        AKAILPD8b.colors.green,      // Green
        AKAILPD8b.colors.lightblue,  // Light Blue (closest to Indigo)
        AKAILPD8b.colors.blue,       // Blue
        AKAILPD8b.colors.purple      // Purple (closest to Violet)
    ];

    // Determine the color indices for interpolation
    const totalColors = rainbowColors.length;
    const colorStep = stepFactor * totalColors;  // Find how far along the cycle we are
    const lowerIndex = Math.floor(colorStep);   // Get the lower index (current color)
    const upperIndex = (lowerIndex + 1) % totalColors;  // Wrap around to the first color after the last

    // Interpolate between the two colors (handle wrap-around between the last and first color)
    const factor = colorStep - lowerIndex;  // Factor for interpolation
    const targetColor = AKAILPD8b.interpolateColor(rainbowColors[lowerIndex], rainbowColors[upperIndex], factor);

    // Update the lights to the interpolated color
    const updatedColors = new Array(16).fill(targetColor);

    // Update the lights
    AKAILPD8b.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8b.dimmingStep++;

    // If we've completed the cycle, reset the step for the next cycle
    if (AKAILPD8b.dimmingStep >= AKAILPD8b.totalDimmingSteps) {
        AKAILPD8b.dimmingStep = 0;  // Reset the step for the next cycle
    }

    // If 4 beats have passed, stop the rainbow cycle
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    const beatProgress = (currentPosition * bpm) % AKAILPD8b.dimmingBeats;  // Track the song's progress in beats

    if (beatProgress === 0 && AKAILPD8b.dimmingStep === 0) {
        AKAILPD8b.dimmingInProgress = false;  // Stop the rainbow cycle
        engine.cancelTimer(AKAILPD8b.updateRainbowCycle);  // Stop the timer
    }
};

// Function to stop the rainbow effect when playback is paused and reset the lights
AKAILPD8b.stopRainbowCycle = function() {
    engine.stopTimer(AKAILPD8b.timers["rainbowCycle"]);
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingInProgress = false;  // Reset rainbow cycle state
    AKAILPD8b.setLights(currentLightColors, true);  // Reset to white color
};*/

//RAINBOW SCANNING THROUGH, ONE PAD LIT AT A TIME
AKAILPD8b.totalDimmingSteps = 31;  // Number of steps for smooth color transition (you can adjust this value)
AKAILPD8b.scanDuration = 2000; //2000 is 2 seconds

AKAILPD8b.startRainbowScan = function() {
    engine.beginTimer(AKAILPD8b.scanDuration, AKAILPD8b.stopRainbowScan,true);
    // Get BPM from Mixxx
    const bpm = engine.getValue("[Channel" + deckNum + "]", "bpm");

    // Calculate the time interval for each color change based on BPM
    const totalDuration = 1000;  // Total duration (for full rainbow cycle)
    const msPerStep = totalDuration / AKAILPD8b.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset the dimming step
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingDirection = 'forward';  // Start with forward cycling
    AKAILPD8b.dimmingInProgress = true;  // Mark that the rainbow effect is in progress

    // Begin the timer to update rainbow colors at intervals
    AKAILPD8b.timers["rainbowScan"] = engine.beginTimer(msPerStep, AKAILPD8b.updateRainbowScan);
};

// This function handles each rainbow color change step
AKAILPD8b.updateRainbowScan = function() {
    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8b.dimmingStep / AKAILPD8b.totalDimmingSteps;

    // Define the rainbow colors (only 7 colors)
    const rainbowColors = [
        AKAILPD8b.colors.red,        // Red
        AKAILPD8b.colors.orange,     // Orange
        AKAILPD8b.colors.yellow,     // Yellow
        AKAILPD8b.colors.green,      // Green
        AKAILPD8b.colors.lightblue,  // Light Blue (closest to Indigo)
        AKAILPD8b.colors.blue,       // Blue
        AKAILPD8b.colors.purple      // Purple (closest to Violet)
    ];

    // Determine the color indices for interpolation
    const totalColors = rainbowColors.length;
    const colorStep = stepFactor * totalColors;  // Find how far along the cycle we are
    const lowerIndex = Math.floor(colorStep);   // Get the lower index (current color)
    const upperIndex = (lowerIndex + 1) % totalColors;  // Wrap around to the first color after the last

    // Interpolate between the two colors (handle wrap-around between the last and first color)
    const factor = colorStep - lowerIndex;  // Factor for interpolation
    const targetColor = AKAILPD8b.interpolateColor(rainbowColors[lowerIndex], rainbowColors[upperIndex], factor);

    // Now, we need to "scan" through the pads, so we create a new array where each pad gets its own color
    const updatedColors = new Array(16).fill(AKAILPD8b.colors.darkgrey);  // Start with all pads black
    const numPads = updatedColors.length;

    // Calculate which pad should get the target color based on dimming step
    const padIndex = AKAILPD8b.dimmingStep % numPads;  // Use modulo to loop through pads
    updatedColors[padIndex] = targetColor;  // Set the target color on the current pad

    // Update the lights with the new colors
    AKAILPD8b.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8b.dimmingStep++;

    // If we've completed the cycle, reset the step for the next cycle
    if (AKAILPD8b.dimmingStep >= AKAILPD8b.totalDimmingSteps) {
        AKAILPD8b.dimmingStep = 0;  // Reset the step for the next cycle
    }

    // If 4 beats have passed, stop the rainbow cycle
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    const beatProgress = (currentPosition * bpm) % AKAILPD8b.dimmingBeats;  // Track the song's progress in beats

    if (beatProgress === 0 && AKAILPD8b.dimmingStep === 0) {
        AKAILPD8b.dimmingInProgress = false;  // Stop the rainbow cycle
        engine.cancelTimer(AKAILPD8b.updateRainbowCycle);  // Stop the timer
    }
};

// Function to stop the rainbow effect when playback is paused and reset the lights
AKAILPD8b.stopRainbowScan = function() {
    engine.stopTimer(AKAILPD8b.timers["rainbowScan"]);
    AKAILPD8b.dimmingStep = 0;
    AKAILPD8b.dimmingInProgress = false;  // Reset rainbow cycle state
    AKAILPD8b.setLights(currentLightColors, true);  // Reset to white color
};

AKAILPD8b.fadeDuration = 1000;
AKAILPD8b.chanceofFlicker = 0.2

AKAILPD8b.rainbowBurst = function(duration = AKAILPD8b.fadeDuration, fadeSteps = 30) {
    const rainbowColors = [
        AKAILPD8b.colors.red,
        AKAILPD8b.colors.orange,
        AKAILPD8b.colors.yellow,
        AKAILPD8b.colors.green,
        AKAILPD8b.colors.lightblue,
        AKAILPD8b.colors.blue,
        AKAILPD8b.colors.purple
    ];

    const evenIndices = Array.from({ length: 8 }, (_, i) => i * 2);

    // Pick 2 to 4 even pad indices randomly
    const padCount = Math.floor(Math.random() * 3) + 2; // 2–4 pads
    const selectedPads = evenIndices.sort(() => 0.5 - Math.random()).slice(0, padCount);

    const burstInfo = selectedPads.map(padIndex => ({
        padIndex,
        burstColor: rainbowColors[Math.floor(Math.random() * rainbowColors.length)],
        originalColor: currentLightColors[padIndex]
    }));

    // Decide if we should flicker (50% chance)
    const shouldFlicker = Math.random() < AKAILPD8b.chanceofFlicker;

    if (shouldFlicker) {
        // FLICKER + FADE
        const flickerArray = currentLightColors.slice();
        const flickerCount = Math.floor(Math.random() * 5) + 2; // 2–5 flickers
        let flickerStep = 0;
        const flickerInterval = duration / 6 / flickerCount;

        const flickerTimer = engine.beginTimer(flickerInterval, function () {
            flickerStep++;

            burstInfo.forEach(({ padIndex, burstColor }) => {
                // Toggle between color and black
                flickerArray[padIndex] = (flickerStep % 2 === 0)
                    ? burstColor
                    : AKAILPD8b.colors.black;
            });

            AKAILPD8b.setLights(flickerArray, true);

            if (flickerStep >= flickerCount * 2) {
                engine.stopTimer(flickerTimer);
                startFade();
            }
        });
    } else {
        // JUST FADE
        const burstArray = currentLightColors.slice();
        burstInfo.forEach(({ padIndex, burstColor }) => {
            burstArray[padIndex] = burstColor;
        });
        AKAILPD8b.setLights(burstArray, true);
        startFade();
    }

    function startFade() {
        let step = 0;
        const stepDuration = duration / fadeSteps;

        const fadeTimer = engine.beginTimer(stepDuration, function () {
            step++;

            const fadedArray = currentLightColors.slice();

            burstInfo.forEach(({ padIndex, burstColor, originalColor }) => {
                const fadeFactor = step / fadeSteps;
                fadedArray[padIndex] = AKAILPD8b.interpolateColor(
                    burstColor,
                    originalColor,
                    fadeFactor
                );
            });

            AKAILPD8b.setLights(fadedArray, true);

            if (step >= fadeSteps) {
                engine.stopTimer(fadeTimer);
            }
        });
    }
};

AKAILPD8b.startRainbowBurstLoop = function(duration = AKAILPD8b.fadeDuration) {
    const minDelay = 0.5 * duration;
    const maxDelay = 5 * duration;

    const scheduleNextBurst = () => {
        const nextDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        AKAILPD8b.timers["rainbowBurstLoop"] = engine.beginTimer(nextDelay, () => {
            AKAILPD8b.rainbowBurst(AKAILPD8b.fadeDuration);
            scheduleNextBurst(); // schedule the next one recursively
        }, true);
    };

    scheduleNextBurst(); // start the loop
};

//
//HELPERS
//

AKAILPD8b.initPadLights = function(status){
    const lights = AKAILPD8b.defaultLights
    AKAILPD8b.setLights([lights.pad1.Static, lights.pad1.Pushed, lights.pad2.Static, lights.pad2.Pushed, lights.pad3.Static, lights.pad3.Pushed, lights.pad4.Static, lights.pad4.Pushed, lights.pad5.Static, lights.pad5.Pushed, lights.pad6.Static, lights.pad6.Pushed, lights.pad7.Static, lights.pad7.Pushed, lights.pad8.Static, lights.pad8.Pushed]);
    AKAILPD8b.startRainbowScan();
    engine.beginTimer(AKAILPD8b.scanDuration, AKAILPD8b.startRainbowBurstLoop, true);
}

//
// Helper: interpolate between two 6-channel color arrays
//

AKAILPD8b.interpolateColor = function(color1, color2, factor) {
    return color1.map((val, i) =>
        Math.round(val + (color2[i] - val) * factor)
    );
};

AKAILPD8b.setLights = function(lightColors, temp = false) {
    if (lightColors.length === 2) { lightColors = Array.from({ length: 16 }, (_, i) => lightColors[i % 2]); }

    if (!temp) { currentLightColors = lightColors.map(color => [...color]); }

    var i;
    //Check to see if any lights are supposed to be off
    for (i = 0; i < lightsOff.length; i++) {
        if (lightsOff[i]) {
            lightColors[i] = AKAILPD8b.colors.black;
        }
    }

    lightProgram.splice(16, 6, ...lightColors[0]);
    lightProgram.splice(22, 6, ...lightColors[1]);
    lightProgram.splice(32, 6, ...lightColors[2]);
    lightProgram.splice(38, 6, ...lightColors[3]);
    lightProgram.splice(48, 6, ...lightColors[4]);
    lightProgram.splice(54, 6, ...lightColors[5]);
    lightProgram.splice(64, 6, ...lightColors[6]);
    lightProgram.splice(70, 6, ...lightColors[7]);
    lightProgram.splice(80, 6, ...lightColors[8]);
    lightProgram.splice(86, 6, ...lightColors[9]);
    lightProgram.splice(96, 6, ...lightColors[10]);
    lightProgram.splice(102, 6, ...lightColors[11]);
    lightProgram.splice(112, 6, ...lightColors[12]);
    lightProgram.splice(118, 6, ...lightColors[13]);
    lightProgram.splice(128, 6, ...lightColors[14]);
    lightProgram.splice(134, 6, ...lightColors[15]);
    
    midi.sendSysexMsg(lightProgram,lightProgram.length); 
};

// Function to change the color of a specific pad to any given color
AKAILPD8b.changePadColor = function(padIndex, color, pushed = false, temp = false) {
    // Validate the pad index to make sure it's within bounds
    if (padIndex < 1 || padIndex >= 8) {
        console.error("Invalid pad index. Must be between 1 and 8");
        return;
    }
    padIndex = (padIndex - 1) * 2;
    if (pushed) { padIndex = padIndex + 1; }

    // Clone the current light color array to preserve the other pad colors
    const updatedColors = currentLightColors.map(colors => [...colors]);

    // Set the color of the specified pad
    updatedColors[padIndex] = color;

    // Update the lights with the new color
    AKAILPD8b.setLights(updatedColors, temp);
};


AKAILPD8b.togglePadLight = function (padNum, pushed, off) { 
    var index = -1; 
    if (pushed) { 
        index = (padNum - 1) * 2 + 1;
    } else { 
        index = (padNum - 1) * 2;
    }
    lightsOff[index] = off ? true : false;
    console.log(lightsOff);
    AKAILPD8b.setLights(currentLightColors);
};

AKAILPD8b.getTrackColor = function () {
    trackColorBinary = engine.getParameter("[Channel" + deckNum + "]", "track_color");

    trackColor = ""
    if (trackColorBinary == "16711935") { trackColor = AKAILPD8b.colors["magenta"]; }
    else if (trackColorBinary == "16746751") { trackColor = AKAILPD8b.colors["pink"]; }
    else if (trackColorBinary == "16746496") { trackColor = AKAILPD8b.colors["orange"]; }
    else if (trackColorBinary == "16776960") { trackColor = AKAILPD8b.colors["yellow"]; }
    else if (trackColorBinary == "11141375") { trackColor = AKAILPD8b.colors["purple"]; }
    else if (trackColorBinary == "16711680") { trackColor = AKAILPD8b.colors["red"]; }
    else if (trackColorBinary == "8912896") { trackColor = AKAILPD8b.colors["darkred"]; }
    else {
        trackColor = AKAILPD8b.colors["darkgrey"];
    }
    return trackColor;
}

//
// INIT
//

AKAILPD8b.init = function() {
    AKAILPD8b.initPadLights();

    //Make connections for the stem mute and stem fx enable lights
    for (let i = 1; i <= 4; i++) {
        engine.makeConnection("[Channel" + deckNum + "_Stem" + i + "]", "mute", AKAILPD8b.stemMute);
        engine.makeConnection("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + i + "]]", "enabled", AKAILPD8b.stemFXOff);
    }

    engine.makeConnection("[Channel" + deckNum + "]", "track_color", AKAILPD8b.trackLoaded);
    engine.makeConnection("[Channel" + deckNum + "]", "play", AKAILPD8b.trackStarted);
    if (engine.getValue("[Channel" + deckNum + "]", "track_color")) { AKAILPD8b.trackLoaded(); }
    if (engine.getValue("[Channel" + deckNum + "]", "play")) { AKAILPD8b.trackStarted(); }
};

AKAILPD8b.setLightsTrackColor = function() {
    trackColor = AKAILPD8b.getTrackColor();
    if (trackColor) {
        lights = [trackColor, AKAILPD8b.colors.white]
        AKAILPD8b.setLights(lights); 
    }
    //Need to make sure the track colors are actually set, because demo might bleed into it
    if (!AKAILPD8b.timers["setLightsTrackColor"]) {AKAILPD8b.timers["setLightsTrackColor"] = engine.beginTimer(1000, AKAILPD8b.setLightsTrackColor, true); }
}

AKAILPD8b.trackLoaded = function() {
    engine.stopTimer(AKAILPD8b.timers["rainbowBurstLoop"]); //Stop the demos
    engine.stopTimer(AKAILPD8b.timers["rainbowScan"]);

    //Make sure all the pad lights are set correctly
    AKAILPD8b.setLightsTrackColor();

    AKAILPD8b.timers["stemmute"] = engine.beginTimer(50,AKAILPD8b.stemMute, true); //Need to run this again otherwise we get a race condition as this function will load at the same time as loading the track
    AKAILPD8b.timers["stemfxoff"] = engine.beginTimer(50,AKAILPD8b.stemFXOff, true); //Need to run this again otherwise we get a race condition as this function will load at the same time as loading the track
};

AKAILPD8b.trackStarted = function () {
    engine.stopTimer(AKAILPD8b.timers["rainbowBurstLoop"]);
    engine.stopTimer(AKAILPD8b.timers["rainbowScan"]);
    trackColor = AKAILPD8b.getTrackColor();
    if (trackColor) {
        lights = [trackColor, AKAILPD8b.colors.white]
        AKAILPD8b.setLights(lights); 
    }
    AKAILPD8b.startSmoothDimming();
}

AKAILPD8b.Shift = function(_channel, control, value, _status, group) {
    if (value) { AKAILPD8b.shiftButtonDown[group] = true; }
    else { AKAILPD8b.shiftButtonDown[group] = false; } 
};

AKAILPD8b.stemMute = function() { 
    for (let i = 1; i <= engine.getParameter("[Channel" + deckNum + "]", "stem_count"); i++) { //Get which stems are muted
        if (engine.getParameter("[Channel" + deckNum + "_Stem" + i + "]", "mute")) {
            index = (i - 1) * 2;
            lightsOff[index] = true;
        } else {
            index = (i - 1) * 2;
            lightsOff[index] = false;
        }
    }
    AKAILPD8b.setLightsTrackColor();
};

AKAILPD8b.stemFXOff = function() {
    for (let i = 1; i <= engine.getParameter("[Channel" + deckNum + "]", "stem_count"); i++) { //Get which stems are muted
        if (engine.getParameter("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + i + "]]", "enabled")) {
            index = (i - 1) * 2 + 8;
            lightsOff[index] = false;
        } else {
            index = (i - 1) * 2 + 8;
            lightsOff[index] = true;
        }
    }
    AKAILPD8b.setLightsTrackColor();
};

AKAILPD8b.changeStemFXChain = function(_channel, control, _value, _status, _group) {
    if (control <= 3) { 
        console.log("Setting prev_chain_preset for stem " + (control + 1));
        engine.setValue("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + (control + 1) +"]]", "prev_chain_preset", 1);
    } else if (control <= 7 && control >= 4) {
        console.log("Setting next_chain_preset for stem " + ((control - 4) + 1));
        engine.setValue("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + ((control - 4) + 1) +"]]", "next_chain_preset", 1);
    }
};

AKAILPD8b.StemVolume = function(_channel, _control, value, _status, group) { 
    engine.setParameter(group, "volume", value / 127)
};

AKAILPD8b.StemFXAmount = function(_channel, _control, value, _status, group) {
    engine.setParameter(group, "super1", value / 127)
}

//
// SHUTDOWN
//

AKAILPD8b.shutdown = function() {
    AKAILPD8b.setLights([AKAILPD8b.colors.black, AKAILPD8b.colors.black]);
    // stop the keepalive timer
    engine.stopTimer(AKAILPD8b.keepAliveTimer);
};