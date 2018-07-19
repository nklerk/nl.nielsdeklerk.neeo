"use strict";
const Homey = require("homey");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoSwitchChanged = new Homey.FlowCardTrigger("switch_changed");
neeoSwitchChanged.register().registerRunListener((args, state) => {
  if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
    return true;
  } else {
    return false;
  }
});

let neeoSwitchChangedDevice = neeoSwitchChanged.getArgument("device");
neeoSwitchChangedDevice.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.devices(query, args);
});

let neeoSwitchChangedCapability = neeoSwitchChanged.getArgument("capabilitie");
neeoSwitchChangedCapability.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.capabilities(query, args, "switch");
});

module.exports.trigger = function(args, state) {
  neeoSwitchChanged
    .trigger(args, state)
    .then(this.log)
    .catch(this.error);
};
