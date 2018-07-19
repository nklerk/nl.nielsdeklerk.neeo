"use strict";
const Homey = require("homey");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoSliderChanged = new Homey.FlowCardTrigger("slider_changed");
neeoSliderChanged.register().registerRunListener((args, state) => {
  if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
    return true;
  } else {
    return false;
  }
});

let neeoSliderChangedDevice = neeoSliderChanged.getArgument("device");
neeoSliderChangedDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.devices(query, args);
});

let neeoSliderChangedCapability = neeoSliderChanged.getArgument("capabilitie");
neeoSliderChangedCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.capabilities(query, args, "slider");
});

module.exports.trigger = function(args, state) {
  neeoSliderChanged
    .trigger(args, state)
    .then(this.log)
    .catch(this.error);
};
