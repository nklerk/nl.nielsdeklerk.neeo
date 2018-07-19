"use strict";
const Homey = require("homey");
const tools = require("./tools");
const neeoDatabase = require("./neeo-database");

function set(adapterName, capabilityName, tokenValue) {
  capabilityName = capabilityName.replace(/(_SENSOR)/gm, "");
  const tokenId = adapterName + capabilityName;
  const tokenName = tools.stringNormalizeName(`${capabilityName}(${adapterName})`);
  const tokenType = typeof tokenValue;

  let neeoToken = new Homey.FlowToken(tokenId, {
    type: tokenType,
    title: tokenName
  });

  //Why cant i just update if the token exist. Now i unregister even if it doesn't exist.
  neeoToken
    .unregister()
    .then(() => {})
    .catch(err => {});
  neeoToken
    .register()
    .then(() => {
      neeoToken.setValue(tokenValue);
    })
    .catch(err => {
      console.log(`[HOMEY TOKEN]\tERROR: Set ${tokenName} -> ${tokenValue}`, err);
    });
  return true;
}
module.exports.set = set;

module.exports.setAll = function() {
  const devices = neeoDatabase.devices();
  if (devices.length > 0) {
    for (const device of devices) {
      for (const capability of device.capabilities) {
        if (capability.type === "sensor" && capability.sensor.value) {
          set(device.name, capability.name, capability.sensor.value);
        }
      }
    }
  }
  return true;
};
