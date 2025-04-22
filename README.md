# Mixxx-Akai-LPD8
This holds the files for the controller Akai LPD8 for Mixxx

Designed to operate 2 in tandem with each other, but can operate with just one. This will allow work with the upcoming [Mixxx stems epic](https://github.com/mixxxdj/mixxx/issues/13116).

Watch it in action:

[![Watch it in action](https://img.youtube.com/vi/eao6AcOTAN0/0.jpg)](https://www.youtube.com/watch?v=eao6AcOTAN0) 

## MIDI Color Info
**In what I believe to be a first, the full RGB lighting using MIDI sysex has been mapped and is being used in these files.**

This command was found by loading up the Akai software and using it to set the lights to different options. Started by setting the static lights, the lights that are always on, to all white, and the lights when the pads are pushed to black. Then we did the opposing settings. This allowed visibility into what was changing for each option.

### Details
Preamble identifying manufacturer, model, etc, then defining the channel I believe, which is set to 1, and defining which settings we're modifying. In this case, the lighting and rotary settings. 
The pad lighting for each pad starts with a 2 digit HEX denoting which pad the lighting is for, and it's repeated twice. Pad 1 is HEX 24. Then each pad takes an RRGGBB value, for both when they're not pushed and when they are pushed. This RRGGBB value maxes at 01 7F for each color and minimums at 00 00. So if I wanted to make the color red, I would enter 01 7F 00 00 00 00

Rotary options are declared after the final pad declaration is finished. The final pad being 2B. Again, this uses HEX 24 to denote the first rotary. I haven't explored these much at all, but when I was putting everything together I accidentally messed with these settings and at one point it was able to turn the rotary into a 1 to 10 instead of 0 to 127.


For example, setting all the pads to black, but light up white when pushed:
```
F0 47 7F 4C 01 01 29 00 00 02 01 00 //Preamble
24 24 00 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
25 25 01 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
26 26 02 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
27 27 03 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
28 28 04 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
29 29 05 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
2A 2A 06 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
2B 2B 07 00 00 00 00 00 00 00 01 7F 01 7F 01 7F //Pad 1
24 00 00 7F //Rotary 1
25 00 00 7F //Rotary 2
26 00 00 7F //Rotary 3
27 00 00 7F //Rotary 4
28 00 00 7F //Rotary 5
29 00 00 7F //Rotary 6
2A 00 00 7F //Rotary 7
2B 00 00 7F //Rotary 8
F7 //End Sysex
```
