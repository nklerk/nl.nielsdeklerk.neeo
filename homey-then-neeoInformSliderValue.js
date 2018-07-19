"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");
const neeoDatabase = require("./neeo-database");
const homeyTokens = require("./homey-tokens");
const tools = require("./tools");

let neeoInformSliderValue = new Homey.FlowCardAction("inform_slider_value");
neeoInformSliderValue.register().registerRunListener((args, state) => {
  neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
  neeoDatabase.capabilitySetValue(args.device.adapterName, args.capabilitie.realname, args.value);
  homeyTokens.set(args.device.name, args.capabilitie.name, args.value);
  return true;
});

let neeoInformSliderValueDevice = neeoInformSliderValue.getArgument("device");
neeoInformSliderValueDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.devices(query, args);
});

let neeoInformSliderValueCapability = neeoInformSliderValue.getArgument("capabilitie");
neeoInformSliderValueCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.capabilities(query, args, "range");
});
