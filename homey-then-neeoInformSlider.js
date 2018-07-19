"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");
const neeoDatabase = require("./neeo-database");
const homeyTokens = require("./homey-tokens");
const tools = require("./tools");

let neeoInformSlider = new Homey.FlowCardAction("inform_slider");
neeoInformSlider.register().registerRunListener((args, state) => {
  if (args.value >= 0 && args.value <= 1) {
    const value = tools.percentage(args.value, args.capabilitie.range);
    neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, value);
    neeoDatabase.capabilitySetValue(args.device.adapterName, args.capabilitie.realname, value);
    homeyTokens.set(args.device.name, args.capabilitie.name, value);
    return true;
  } else {
    return false;
  }
});

let neeoInformSliderDevice = neeoInformSlider.getArgument("device");
neeoInformSliderDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.devices(query, args);
});

let neeoInformSliderCapability = neeoInformSlider.getArgument("capabilitie");
neeoInformSliderCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.capabilities(query, args, "range");
});
