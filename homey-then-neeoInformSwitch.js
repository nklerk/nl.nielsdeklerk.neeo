"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");
const neeoDatabase = require("./neeo-database");
const homeyTokens = require("./homey-tokens");
const tools = require("./tools");

let neeoInformSwitch = new Homey.FlowCardAction("inform_switch");
neeoInformSwitch.register().registerRunListener((args, state) => {
  args.value = tools.stringToBoolean(args.value);
  neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
  neeoDatabase.capabilitySetValue(args.device.adapterName, args.capabilitie.realname, args.value);
  homeyTokens.set(args.device.name, args.capabilitie.name, args.value);
  return true;
});

let neeoInformSwitchDevice = neeoInformSwitch.getArgument("device");
neeoInformSwitchDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.devices(query, args);
});

let neeoInformSwitchCapability = neeoInformSwitch.getArgument("capabilitie");
neeoInformSwitchCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.capabilities(query, args, "binary");
});
