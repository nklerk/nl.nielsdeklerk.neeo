"use strict";
const Homey = require("homey");

let neeoEventReceived = new Homey.FlowCardTrigger("received_event");
neeoEventReceived.register().registerRunListener(state => {
  return true;
});

module.exports.trigger = function(state) {
  neeoEventReceived
    .trigger(state)
    .then(this.log)
    .catch(this.error);
};
