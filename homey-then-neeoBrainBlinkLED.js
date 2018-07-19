"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoBrainBlinkLED = new Homey.FlowCardAction("neeobrain_blinkLED");
neeoBrainBlinkLED.register().registerRunListener((args, state) => {
  neeoBrain.blinkLed(args.brain.name, args.times);
  return true;
});

let neeoBrainBlinkLEDBrain = neeoBrainBlinkLED.getArgument("brain");
neeoBrainBlinkLEDBrain.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.neeoBrains(query, args);
});
