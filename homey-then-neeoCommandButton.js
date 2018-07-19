"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoCommandButton = new Homey.FlowCardAction("command_button");
neeoCommandButton.register().registerRunListener((args, state) => {
  neeoBrain.commandButton(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key);
  return true;
});

let neeoCommandButtonRoom = neeoCommandButton.getArgument("room");
neeoCommandButtonRoom.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.rooms(query, args);
});

let neeoCommandButtonDevice = neeoCommandButton.getArgument("device");
neeoCommandButtonDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.roomDevices(query, args);
});

let neeoCommandButtonCapability = neeoCommandButton.getArgument("capabilitie");
neeoCommandButtonCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.macros(query, args);
});
