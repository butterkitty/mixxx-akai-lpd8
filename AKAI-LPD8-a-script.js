// AKAILPD8a-script.js

var AKAILPD8a = {};


// The SysEx message to send to the controller to force the midi controller
// to send the status of every item on the control surface.
var ControllerStatusSysex = [0xF0, 0x00, 0x40, 0x05, 0x00, 0x00, 0x04, 0x05, 0x00, 0x03, 0x01, 0xF7]; //Sniffed from Rekordbox using PocketMIDI

// The SysEx message required to set the lights for the controller is pretty intense
// we need to write this out prior and then modify it depending on how we want to set
// the rgb. Format is : [PAD 1, PAD 1 PUSHED, PAD 2, PAD 2 PUSHED, ... , PAD 8, PAD 8 PUSHED]
//[0xF0, 0x47, 0x7F, 0x4C, 0x01, 0x01, 0x29, 0x00, 0x00, 0x02, 0x01, 0x00, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x25, 0x25, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x26, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x27, 0x27, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x28, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x29, 0x29, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x2A, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2B, 0x2B, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x7F, 0x25, 0x00, 0x00, 0x7F, 0x26, 0x00, 0x00, 0x7F, 0x27, 0x00, 0x00, 0x7F, 0x28, 0x00, 0x00, 0x7F, 0x29, 0x00, 0x00, 0x7F, 0x2A, 0x00, 0x00, 0x7F, 0x2B, 0x00, 0x00, 0x7F, 0xF7]

var lightProgram = [0xF0, 0x47, 0x7F, 0x4C, 0x01, 0x01, 0x29, 0x00, 0x00, 0x02, 0x01, 0x00, 0x24, 0x24, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x25, 0x25, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x26, 0x26, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x27, 0x27, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x28, 0x28, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x29, 0x29, 0x05, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A, 0x2A, 0x06, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2B, 0x2B, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x24, 0x00, 0x00, 0x7F, 0x25, 0x00, 0x00, 0x7F, 0x26, 0x00, 0x00, 0x7F, 0x27, 0x00, 0x00, 0x7F, 0x28, 0x00, 0x00, 0x7F, 0x29, 0x00, 0x00, 0x7F, 0x2A, 0x00, 0x00, 0x7F, 0x2B, 0x00, 0x00, 0x7F, 0xF7]

// Specify which deck this is for in the software
var deckNum = "1";


// Store timer IDs
AKAILPD8a.timers = {};

var currentLightColors = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];//var currentLightColors = [pad 1, pad 1 pushed, ..., pad 8, pad 8 pushed] //array of arrays. Each array in the main array is structured [0x01, 0x7F, 0x01, 0x7F, 0x01, 0x7F]. This gives white. They are RRGGBB. Maximum value is 0x01, 0x7F one less is 0x00, 0x7F and minimum is 0x00, 0x00 which would make it black and turn the lights off
var lightsOff = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]; //Which lights are turned off


//
// CONSTANTS
//

AKAILPD8a.colors = {
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

AKAILPD8a.defaultLights = {
    pad1: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad2: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad3: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad4: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad5: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad6: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad7: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },
    pad8: {
        Static: AKAILPD8a.colors.darkgrey,
        Pushed: AKAILPD8a.colors.white,
    },    
};
//
// 
//


//
// TRACK PLAYING STROBE
//

//Configurable
// Calculation of time between steps: (60000 / bpm * AKAILPD8a.beatsPerCycle) / AKAILPD8a.totalDimmingSteps
// For a 125 BPM song, with totalDimmingSteps = 10 and beatsPerCycle = 1 this would equal 96 ms between steps.
// Answer should be no lower than around 50ms
AKAILPD8a.totalDimmingSteps = 20;  // Number of steps for smooth dimming
AKAILPD8a.beatsPerCycle = 4; //How many beats to cycle the dimming over. This is a full cycle
AKAILPD8a.dimAmount = 0.80; //Percent to dim by. 0.25 would dim it by 25%

//No touchie
AKAILPD8a.dimmingStep = 0;  // Current dimming step
AKAILPD8a.dimmingStartBeat = 0;  // Beat number when dimming starts
AKAILPD8a.dimmingInProgress = false;  // Track if dimming is in progress
AKAILPD8a.dimmingState = false;

AKAILPD8a.startSmoothDimming = function() {
    // Get BPM from Mixxx
    const bpm = engine.getValue("[Channel" + deckNum + "]", "bpm");

    if (bpm <= 0) {
        console.warn("BPM is zero or not valid, cannot start dimming.");
        return;
    }

    // Check if track is playing (position should only be valid when playing)
    const isTrackPlaying = engine.getValue("[Channel" + deckNum + "]", "play");
    if (isTrackPlaying === 0) {
        console.warn("Track is not playing, cannot start dimming.");
        return;
    }

    // Fetch the current position of the track (normalized from 0.0 to 1.0)
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    if (currentPosition === null || currentPosition === 0.0) {
        console.warn("Invalid position value, cannot start dimming.");
        return;
    }

    // Calculate the time interval for each dimming step based on BPM
    const msPerBeat = 60000 / bpm;  // Milliseconds per beat
    const totalDuration = msPerBeat * AKAILPD8a.beatsPerCycle;  // Total duration (for full dimming cycle)
    const msPerStep = totalDuration / AKAILPD8a.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset dimming step
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingDirection = 'dim';  // Start with dimming
    AKAILPD8a.dimmingInProgress = true;  // Mark that dimming is in progress

    // Store the current color brightness (starting at full brightness)
    AKAILPD8a.originalColors = currentLightColors;

    // Begin the timer to update dimming at intervals
    AKAILPD8a.timers["smoothDimming"] = engine.beginTimer(msPerStep, AKAILPD8a.updateSmoothDimming);
};

// This function handles each dimming step
AKAILPD8a.updateSmoothDimming = function() {
    if (!engine.getValue("[Channel" + deckNum + "]", "play")) {
        AKAILPD8a.stopSmoothDimming();
        return;
    }
    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8a.dimmingStep / (AKAILPD8a.totalDimmingSteps / 2);

    // Determine the target brightness based on the current phase (dimming or brightening)
    let targetBrightness;
    if (AKAILPD8a.dimmingDirection === 'dim') {
        targetBrightness = 1 - stepFactor * AKAILPD8a.dimAmount;
    } else {
        targetBrightness = (1 - AKAILPD8a.dimAmount) + stepFactor * AKAILPD8a.dimAmount; // Brighten back to full brightness
    }

    // Calculate the new dimmed color based on the target brightness
    const updatedColors = AKAILPD8a.originalColors.map(function(color) {
        return color.map(function(channelValue, index) {
            const maxValue = 0x7F;
            return Math.floor(channelValue * targetBrightness);
        });
    });

    // Update the lights
    AKAILPD8a.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8a.dimmingStep++;

    // If we've completed one phase (dimming or brightening), switch direction
    if (AKAILPD8a.dimmingStep >= AKAILPD8a.totalDimmingSteps / 2) {
        AKAILPD8a.dimmingStep = 0; // Reset the step for the next phase
        AKAILPD8a.dimmingDirection = (AKAILPD8a.dimmingDirection === 'dim') ? 'brighten' : 'dim'; // Switch direction
    }

    // If 4 beats have passed, stop the dimming process
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    const beatProgress = (currentPosition * bpm) % AKAILPD8a.dimmingBeats;  // Track the song's progress in beats

    if (beatProgress === 0 && AKAILPD8a.dimmingDirection === 'dim' && AKAILPD8a.dimmingStep === 0) {
        AKAILPD8a.dimmingInProgress = false;  // Stop the dimming process
        engine.cancelTimer(AKAILPD8a.updateSmoothDimming);  // Stop the timer
    }
};

// Function to stop strobing when playback is paused and return to full brightness
AKAILPD8a.stopSmoothDimming = function() {
    engine.stopTimer(AKAILPD8a.timers["smoothDimming"]);
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingInProgress = false;  // Reset strobe state
    AKAILPD8a.dimmingDirection = 'dim';
    AKAILPD8a.setLights(currentLightColors);
};  

//RAINBOW ROTATING THROUGH ALL PADS SAME COLOR (Not using but it's totally usable)
/*AKAILPD8a.totalDimmingSteps = 30;  // Number of steps for smooth color transition (you can adjust this value)
AKAILPD8a.beatsPerCycle = 2; // Number of beats to cycle the rainbow over (full cycle)

AKAILPD8a.startRainbowCycle = function() {
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
    const totalDuration = msPerBeat * AKAILPD8a.beatsPerCycle;  // Total duration (for full rainbow cycle)
    const msPerStep = totalDuration / AKAILPD8a.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset the dimming step
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingDirection = 'forward';  // Start with forward cycling
    AKAILPD8a.dimmingInProgress = true;  // Mark that the rainbow effect is in progress

    // Begin the timer to update rainbow colors at intervals
    AKAILPD8a.timers["rainbowCycle"] = engine.beginTimer(msPerStep, AKAILPD8a.updateRainbowCycle);
};

// This function handles each rainbow color change step
AKAILPD8a.updateRainbowCycle = function() {
    if (!engine.getValue("[Channel" + deckNum + "]", "play")) {
        AKAILPD8a.stopRainbowCycle();
        return;
    }

    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8a.dimmingStep / AKAILPD8a.totalDimmingSteps;

    // Define the rainbow colors (only 7 colors)
    const rainbowColors = [
        AKAILPD8a.colors.red,        // Red
        AKAILPD8a.colors.orange,     // Orange
        AKAILPD8a.colors.yellow,     // Yellow
        AKAILPD8a.colors.green,      // Green
        AKAILPD8a.colors.lightblue,  // Light Blue (closest to Indigo)
        AKAILPD8a.colors.blue,       // Blue
        AKAILPD8a.colors.purple      // Purple (closest to Violet)
    ];

    // Determine the color indices for interpolation
    const totalColors = rainbowColors.length;
    const colorStep = stepFactor * totalColors;  // Find how far along the cycle we are
    const lowerIndex = Math.floor(colorStep);   // Get the lower index (current color)
    const upperIndex = (lowerIndex + 1) % totalColors;  // Wrap around to the first color after the last

    // Interpolate between the two colors (handle wrap-around between the last and first color)
    const factor = colorStep - lowerIndex;  // Factor for interpolation
    const targetColor = AKAILPD8a.interpolateColor(rainbowColors[lowerIndex], rainbowColors[upperIndex], factor);

    // Update the lights to the interpolated color
    const updatedColors = new Array(16).fill(targetColor);

    // Update the lights
    AKAILPD8a.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8a.dimmingStep++;

    // If we've completed the cycle, reset the step for the next cycle
    if (AKAILPD8a.dimmingStep >= AKAILPD8a.totalDimmingSteps) {
        AKAILPD8a.dimmingStep = 0;  // Reset the step for the next cycle
    }

    // If 4 beats have passed, stop the rainbow cycle
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    const beatProgress = (currentPosition * bpm) % AKAILPD8a.dimmingBeats;  // Track the song's progress in beats

    if (beatProgress === 0 && AKAILPD8a.dimmingStep === 0) {
        AKAILPD8a.dimmingInProgress = false;  // Stop the rainbow cycle
        engine.cancelTimer(AKAILPD8a.updateRainbowCycle);  // Stop the timer
    }
};

// Function to stop the rainbow effect when playback is paused and reset the lights
AKAILPD8a.stopRainbowCycle = function() {
    engine.stopTimer(AKAILPD8a.timers["rainbowCycle"]);
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingInProgress = false;  // Reset rainbow cycle state
    AKAILPD8a.setLights(currentLightColors, true);  // Reset to white color
};*/

//RAINBOW SCANNING THROUGH, ONE PAD LIT AT A TIME
AKAILPD8a.totalDimmingSteps = 31;  // Number of steps for smooth color transition (you can adjust this value)
AKAILPD8a.scanDuration = 2000; //2000 is 2 seconds

AKAILPD8a.startRainbowScan = function() {
    engine.beginTimer(AKAILPD8a.scanDuration, AKAILPD8a.stopRainbowScan,true);
    // Get BPM from Mixxx
    const bpm = engine.getValue("[Channel" + deckNum + "]", "bpm");

    // Calculate the time interval for each color change based on BPM
    const totalDuration = 1000;  // Total duration (for full rainbow cycle)
    const msPerStep = totalDuration / AKAILPD8a.totalDimmingSteps;  // Time for each step to complete for full cycle

    // Reset the dimming step
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingDirection = 'forward';  // Start with forward cycling
    AKAILPD8a.dimmingInProgress = true;  // Mark that the rainbow effect is in progress

    // Begin the timer to update rainbow colors at intervals
    AKAILPD8a.timers["rainbowScan"] = engine.beginTimer(msPerStep, AKAILPD8a.updateRainbowScan);
};

// This function handles each rainbow color change step
AKAILPD8a.updateRainbowScan = function() {
    // Calculate the step factor (a value between 0 and 1)
    const stepFactor = AKAILPD8a.dimmingStep / AKAILPD8a.totalDimmingSteps;

    // Define the rainbow colors (only 7 colors)
    const rainbowColors = [
        AKAILPD8a.colors.red,        // Red
        AKAILPD8a.colors.orange,     // Orange
        AKAILPD8a.colors.yellow,     // Yellow
        AKAILPD8a.colors.green,      // Green
        AKAILPD8a.colors.lightblue,  // Light Blue (closest to Indigo)
        AKAILPD8a.colors.blue,       // Blue
        AKAILPD8a.colors.purple      // Purple (closest to Violet)
    ];

    // Determine the color indices for interpolation
    const totalColors = rainbowColors.length;
    const colorStep = stepFactor * totalColors;  // Find how far along the cycle we are
    const lowerIndex = Math.floor(colorStep);   // Get the lower index (current color)
    const upperIndex = (lowerIndex + 1) % totalColors;  // Wrap around to the first color after the last

    // Interpolate between the two colors (handle wrap-around between the last and first color)
    const factor = colorStep - lowerIndex;  // Factor for interpolation
    const targetColor = AKAILPD8a.interpolateColor(rainbowColors[lowerIndex], rainbowColors[upperIndex], factor);

    // Now, we need to "scan" through the pads, so we create a new array where each pad gets its own color
    const updatedColors = new Array(16).fill(AKAILPD8a.colors.darkgrey);  // Start with all pads black
    const numPads = updatedColors.length;

    // Calculate which pad should get the target color based on dimming step
    const padIndex = AKAILPD8a.dimmingStep % numPads;  // Use modulo to loop through pads
    updatedColors[padIndex] = targetColor;  // Set the target color on the current pad

    // Update the lights with the new colors
    AKAILPD8a.setLights(updatedColors, true);

    // Increment the step
    AKAILPD8a.dimmingStep++;

    // If we've completed the cycle, reset the step for the next cycle
    if (AKAILPD8a.dimmingStep >= AKAILPD8a.totalDimmingSteps) {
        AKAILPD8a.dimmingStep = 0;  // Reset the step for the next cycle
    }

    // If 4 beats have passed, stop the rainbow cycle
    const currentPosition = engine.getValue("[Channel" + deckNum + "]", "playposition");
    const beatProgress = (currentPosition * bpm) % AKAILPD8a.dimmingBeats;  // Track the song's progress in beats

    if (beatProgress === 0 && AKAILPD8a.dimmingStep === 0) {
        AKAILPD8a.dimmingInProgress = false;  // Stop the rainbow cycle
        engine.cancelTimer(AKAILPD8a.updateRainbowCycle);  // Stop the timer
    }
};

// Function to stop the rainbow effect when playback is paused and reset the lights
AKAILPD8a.stopRainbowScan = function() {
    engine.stopTimer(AKAILPD8a.timers["rainbowScan"]);
    AKAILPD8a.dimmingStep = 0;
    AKAILPD8a.dimmingInProgress = false;  // Reset rainbow cycle state
    AKAILPD8a.setLights(currentLightColors, true);  // Reset to white color
};

AKAILPD8a.fadeDuration = 1000;
AKAILPD8a.chanceofFlicker = 0.2

AKAILPD8a.rainbowBurst = function(duration = AKAILPD8a.fadeDuration, fadeSteps = 30) {
    const rainbowColors = [
        AKAILPD8a.colors.red,
        AKAILPD8a.colors.orange,
        AKAILPD8a.colors.yellow,
        AKAILPD8a.colors.green,
        AKAILPD8a.colors.lightblue,
        AKAILPD8a.colors.blue,
        AKAILPD8a.colors.purple
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
    const shouldFlicker = Math.random() < AKAILPD8a.chanceofFlicker;

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
                    : AKAILPD8a.colors.black;
            });

            AKAILPD8a.setLights(flickerArray, true);

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
        AKAILPD8a.setLights(burstArray, true);
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
                fadedArray[padIndex] = AKAILPD8a.interpolateColor(
                    burstColor,
                    originalColor,
                    fadeFactor
                );
            });

            AKAILPD8a.setLights(fadedArray, true);

            if (step >= fadeSteps) {
                engine.stopTimer(fadeTimer);
            }
        });
    }
};

AKAILPD8a.startRainbowBurstLoop = function(duration = AKAILPD8a.fadeDuration) {
    const minDelay = 0.5 * duration;
    const maxDelay = 5 * duration;

    const scheduleNextBurst = () => {
        const nextDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        AKAILPD8a.timers["rainbowBurstLoop"] = engine.beginTimer(nextDelay, () => {
            AKAILPD8a.rainbowBurst(AKAILPD8a.fadeDuration);
            scheduleNextBurst(); // schedule the next one recursively
        }, true);
    };

    scheduleNextBurst(); // start the loop
};

//
//HELPERS
//

AKAILPD8a.initPadLights = function(status){
    const lights = AKAILPD8a.defaultLights
    AKAILPD8a.setLights([lights.pad1.Static, lights.pad1.Pushed, lights.pad2.Static, lights.pad2.Pushed, lights.pad3.Static, lights.pad3.Pushed, lights.pad4.Static, lights.pad4.Pushed, lights.pad5.Static, lights.pad5.Pushed, lights.pad6.Static, lights.pad6.Pushed, lights.pad7.Static, lights.pad7.Pushed, lights.pad8.Static, lights.pad8.Pushed]);
    AKAILPD8a.startRainbowScan();
    engine.beginTimer(AKAILPD8a.scanDuration, AKAILPD8a.startRainbowBurstLoop, true);
}

//
// Helper: interpolate between two 6-channel color arrays
//

AKAILPD8a.interpolateColor = function(color1, color2, factor) {
    return color1.map((val, i) =>
        Math.round(val + (color2[i] - val) * factor)
    );
};

AKAILPD8a.setLights = function(lightColors, temp = false) {
    if (lightColors.length === 2) { lightColors = Array.from({ length: 16 }, (_, i) => lightColors[i % 2]); }

    if (!temp) { currentLightColors = lightColors.map(color => [...color]); }

    var i;
    //Check to see if any lights are supposed to be off
    for (i = 0; i < lightsOff.length; i++) {
        if (lightsOff[i]) {
            lightColors[i] = AKAILPD8a.colors.black;
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
AKAILPD8a.changePadColor = function(padIndex, color, pushed = false, temp = false) {
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
    AKAILPD8a.setLights(updatedColors, temp);
};


AKAILPD8a.togglePadLight = function (padNum, pushed, off) { 
    var index = -1; 
    if (pushed) { 
        index = (padNum - 1) * 2 + 1;
    } else { 
        index = (padNum - 1) * 2;
    }
    lightsOff[index] = off ? true : false;
    console.log(lightsOff);
    AKAILPD8a.setLights(currentLightColors);
};

AKAILPD8a.getTrackColor = function () {
    trackColorBinary = engine.getParameter("[Channel" + deckNum + "]", "track_color");

    trackColor = ""
    if (trackColorBinary == "16711935") { trackColor = AKAILPD8a.colors["magenta"]; }
    else if (trackColorBinary == "16746751") { trackColor = AKAILPD8a.colors["pink"]; }
    else if (trackColorBinary == "16746496") { trackColor = AKAILPD8a.colors["orange"]; }
    else if (trackColorBinary == "16776960") { trackColor = AKAILPD8a.colors["yellow"]; }
    else if (trackColorBinary == "11141375") { trackColor = AKAILPD8a.colors["purple"]; }
    else if (trackColorBinary == "16711680") { trackColor = AKAILPD8a.colors["red"]; }
    else if (trackColorBinary == "8912896") { trackColor = AKAILPD8a.colors["darkred"]; }
    else {
        trackColor = AKAILPD8a.colors["darkgrey"];
    }
    return trackColor;
}

//
// Init 
//

AKAILPD8a.init = function() {
    AKAILPD8a.initPadLights();

    //Make connections for the stem mute and stem fx enable lights
    for (let i = 1; i <= 4; i++) {
        engine.makeConnection("[Channel" + deckNum + "_Stem" + i + "]", "mute", AKAILPD8a.stemMute);
        engine.makeConnection("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + i + "]]", "enabled", AKAILPD8a.stemFXOff);
    }

    engine.makeConnection("[Channel" + deckNum + "]", "track_color", AKAILPD8a.trackLoaded);
    engine.makeConnection("[Channel" + deckNum + "]", "play", AKAILPD8a.trackStarted);
};

AKAILPD8a.setLightsTrackColor = function() {
    trackColor = AKAILPD8a.getTrackColor();
    if (trackColor) {
        lights = [trackColor, AKAILPD8a.colors.white]
        AKAILPD8a.setLights(lights); 
    }
    //Need to make sure the track colors are actually set, because demo might bleed into it
    if (!AKAILPD8a.timers["setLightsTrackColor"]) {AKAILPD8a.timers["setLightsTrackColor"] = engine.beginTimer(1000, AKAILPD8a.setLightsTrackColor, true); }
}

AKAILPD8a.trackLoaded = function() {
    engine.stopTimer(AKAILPD8a.timers["rainbowBurstLoop"]); //Stop the demos
    engine.stopTimer(AKAILPD8a.timers["rainbowScan"]);

    //Make sure all the pad lights are set correctly
    AKAILPD8a.setLightsTrackColor();

    AKAILPD8a.timers["stemmute"] = engine.beginTimer(50,AKAILPD8a.stemMute, true); //Need to run this again otherwise we get a race condition as this function will load at the same time as loading the track
    AKAILPD8a.timers["stemfxoff"] = engine.beginTimer(50,AKAILPD8a.stemFXOff, true); //Need to run this again otherwise we get a race condition as this function will load at the same time as loading the track
};

AKAILPD8a.trackStarted = function () {
    engine.stopTimer(AKAILPD8a.timers["rainbowBurstLoop"]);
    engine.stopTimer(AKAILPD8a.timers["rainbowScan"]);
    trackColor = AKAILPD8a.getTrackColor();
    if (trackColor) {
        lights = [trackColor, AKAILPD8a.colors.white]
        AKAILPD8a.setLights(lights); 
    }
    AKAILPD8a.startSmoothDimming();
}

AKAILPD8a.Shift = function(_channel, control, value, _status, group) {
    if (value) { AKAILPD8a.shiftButtonDown[group] = true; }
    else { AKAILPD8a.shiftButtonDown[group] = false; } 
};

AKAILPD8a.stemMute = function() { 
    for (let i = 1; i <= engine.getParameter("[Channel" + deckNum + "]", "stem_count"); i++) { //Get which stems are muted
        if (engine.getParameter("[Channel" + deckNum + "_Stem" + i + "]", "mute")) {
            index = (i - 1) * 2;
            lightsOff[index] = true;
        } else {
            index = (i - 1) * 2;
            lightsOff[index] = false;
        }
    }
    AKAILPD8a.setLightsTrackColor();
};

AKAILPD8a.stemFXOff = function() {
    for (let i = 1; i <= engine.getParameter("[Channel" + deckNum + "]", "stem_count"); i++) { //Get which stems are muted
        if (engine.getParameter("[QuickEffectRack1_[Channel" + deckNum + "_Stem" + i + "]]", "enabled")) {
            index = (i - 1) * 2 + 8;
            lightsOff[index] = false;
        } else {
            index = (i - 1) * 2 + 8;
            lightsOff[index] = true;
        }
    }
    AKAILPD8a.setLightsTrackColor();
};

AKAILPD8a.StemVolume = function(_channel, control, value, _status, group) { 
    if (AKAILPD8a.shiftButtonDown[0]) {
        group = group.replace("Channel1", "Channel2");
    }
    engine.setParameter(group, "volume", value / 127)
};

AKAILPD8a.StemFXAmount = function(_channel, _control, value, _status, group) {
    if (AKAILPD8a.shiftButtonDown[0]) {
        group = group.replace("Channel1", "Channel2");
    }
    engine.setParameter(group, "super1", value / 127)
}

//
// Shutdown
//

AKAILPD8a.shutdown = function() {
    AKAILPD8a.setLights([AKAILPD8a.colors.black, AKAILPD8a.colors.black]);
    // stop the keepalive timer
    engine.stopTimer(AKAILPD8a.keepAliveTimer);
};
