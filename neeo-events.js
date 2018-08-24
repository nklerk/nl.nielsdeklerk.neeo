"use strict";
//const Homey = require("homey");
const neeoEventReceived = require("./homey-if-neeoEventReceived");

module.exports.handle = function(body, clientIp) {
  let responseData = {
    code: 200,
    Type: { "Content-Type": "application/json" },
    content: ""
  };
  const myjson = JSON.parse(body);
  console.log(`[EVENTS]\tNEEO event from ${clientIp}: ${body}`);
  let action = "",
    device = "",
    room = "",
    actionparameter = "";
  if (myjson.action) {
    action = myjson.action;
  }
  if (myjson.actionparameter) {
    actionparameter = myjson.actionparameter.toString();
  }
  if (myjson.recipe) {
    device = myjson.recipe;
  }
  if (myjson.device) {
    device = myjson.device;
  }
  if (myjson.room) {
    room = myjson.room;
  }
  neeoEventReceived.trigger({
    Action: action,
    Device: device,
    Room: room,
    Parameter: actionparameter,
    Json: body
  });
  return responseData;
};
