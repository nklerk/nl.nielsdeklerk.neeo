"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoCommandSlider = new Homey.FlowCardAction("command_slider");
neeoCommandSlider.register().registerRunListener((args, state) => {
  neeoBrain.commandSlider(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key, args.value);
  return true;
});

let neeoCommandSliderRoom = neeoCommandSlider.getArgument("room");
neeoCommandSliderRoom.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.rooms(query, args);
});

let neeoCommandSliderDevice = neeoCommandSlider.getArgument("device");
neeoCommandSliderDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.roomDevices(query, args);
});

let neeoCommandSliderCapability = neeoCommandSlider.getArgument("capabilitie");
neeoCommandSliderCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.sliders(query, args);
});
