"use strict";
//const Homey = require("homey");
const neeoDatabase = require("./neeo-database");
const homeyTokens = require("./homey-tokens");
const neeoBrain = require("./neeo-brain");
const tools = require("./tools");
const neeoSliderChanged = require("./homey-if-neeoSliderChanged");
const neeoSwitchChanged = require("./homey-if-neeoSwitchChanged");
const neeoButtonPressed = require("./homey-if-neeoButtonPressed");

module.exports.db = function db(request) {
  let responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: ""
  };
  console.log(`[DATABASE]\tReceived request: ${request}.`);
  if (typeof request === "string" && request.substr(0, 9) === "search?q=") {
    const queery = request.replace("search?q=", "");
    const founddevices = neeoDatabase.deviceSearch(queery);
    responseData.content = JSON.stringify(founddevices);
  } else {
    const founddevice = neeoDatabase.deviceById(request);
    responseData.content = JSON.stringify(founddevice);
  }
  return responseData;
};

module.exports.dbAdapterDefenition = function dbAdapterDefenition(adapterName) {
  let responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: ""
  };
  console.log(`[DATABASE]\tReceived Adapter Defenition request: ${adapterName}.`);
  const founddevice = neeoDatabase.deviceByAdaptername(adapterName);
  responseData.content = JSON.stringify(founddevice);
  return responseData;
};

module.exports.device = function device(adapterName, deviceFunction, deviceParameter, brainIP) {
  let responseData = {
    code: 200,
    type: { "Content-Type": "application/json" },
    content: ""
  };
  const capability = neeoDatabase.capability(adapterName, deviceFunction);
  if (!capability.type) {
    capability.type = "error";
  }
  if (capability.type === "sensor") {
    if (deviceParameter === "base64") {
      let buf = Buffer.from(capability.sensor.base64, "base64");
      responseData = {
        code: 200,
        Type: { "Content-Type": "image" },
        content: buf
      };
    } else {
      //console.log(`DEBUG: returning value ${capability.sensor.value} as type ${typeof capability.sensor.value}`);
      responseData.content = JSON.stringify({ value: capability.sensor.value });
    }
  } else if (capability.type === "button") {
    console.log(`[EVENTS]\tButton pressed: ${adapterName}, ${deviceFunction}.`);
    neeoButtonPressed.trigger({}, { adapterName: adapterName, capabilitie: deviceFunction });
  } else if (capability.type === "slider") {
    console.log(`[EVENTS]\tSlider state changed: ${adapterName}, ${deviceFunction}.  Value: ${deviceParameter}`);
    deviceParameter = parseInt(deviceParameter, 10);
    const decimalvalue = tools.mathRound(deviceParameter / capability.slider.range[1], 2);
    neeoBrain.notifyStateChange(adapterName, `${deviceFunction}_SENSOR`, deviceParameter, () => {});
    homeyTokens.set(adapterName, deviceFunction, deviceParameter, () => {});
    neeoSliderChanged.trigger({ value: deviceParameter, decimalvalue: decimalvalue }, { adapterName: adapterName, capabilitie: deviceFunction });
    responseData.content = neeoDatabase.capabilitySetValue(adapterName, deviceFunction, deviceParameter);
  } else if (capability.type === "switch") {
    console.log(`[EVENTS]\tSwitch state changed: ${adapterName}, ${deviceFunction}.  Value: ${deviceParameter}`);
    if (deviceParameter === "true") {
      deviceParameter = true;
    }
    if (deviceParameter === "false") {
      deviceParameter = false;
    }
    neeoSwitchChanged.trigger({ value: deviceParameter }, { adapterName: adapterName, capabilitie: deviceFunction });
    homeyTokens.set(adapterName, deviceFunction, deviceParameter);
    neeoBrain.notifyStateChange(adapterName, `${deviceFunction}_SENSOR`, deviceParameter);
    responseData.content = neeoDatabase.capabilitySetValue(adapterName, deviceFunction, deviceParameter);
  } else if (deviceFunction === "subscribe") {
    console.log(`[NOTIFICATIONS]\t${adapterName} added to ${brainIP}.`);
    neeoBrain.downloadConfiguration();
  } else if (deviceFunction === "unsubscribe") {
    console.log(`[NOTIFICATIONS]\t${adapterName} removed from ${brainIP}.`);
    neeoBrain.downloadConfiguration();
  } else {
    console.log(``);
    console.log(` !! WARNING, DEVICE OR CAPABILITY DOES NOT EXIST !!`);
    console.log(` The folowing request from ${brainIP} isn't expected:`);
    console.log(` - adapterName:      ${adapterName}`);
    console.log(` - deviceFunction:   ${deviceFunction}`);
    console.log(` - deviceParameter:  ${deviceParameter}`);
    console.log(``);
    responseData.code = 400;
  }
  return responseData;
};

module.exports.subscribe = function subscribe(uriparts, brainIP) {
  console.log(`[NOTIFICATIONS]\tRequest for subscription from: ${brainIP}.`);
  const responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: '{"success":true}'
  };
  return responseData;
};

module.exports.unsubscribe = function unsubscribe(uriparts, brainIP) {
  console.log(`[NOTIFICATIONS]\tRequest for unsubscription from: ${brainIP}.`);
  const responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: '{"success":true}'
  };
  return responseData;
};

module.exports.capabilities = function capabilities(uriparts) {
  let responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: ""
  };
  const founddevice = neeoDatabase.deviceByAdaptername(uriparts[1]);
  responseData.content = JSON.stringify(founddevice.capabilities);
  return responseData;
};

module.exports.unknown = function unknown(uriparts, host) {
  console.log(`[ERROR]\t\tRECEIVED UNKNOWN REQUEST. ${uriparts} from ${host}`);
  const responseData = {
    code: 500,
    Type: { "Content-Type": "application/json" },
    content: '{"error": "Unknown request."}'
  };
  return responseData;
};
