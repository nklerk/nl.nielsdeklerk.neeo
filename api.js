"use strict";
const Homey = require("homey");

module.exports = [
  {
    description: "Discover NEEO Brains",
    method: "GET",
    path: "/discover/",
    fn: function(args, callback) {
      Homey.app.apiDiscover();
      callback(null, true);
    }
  },
  {
    description: "Brain Deleted",
    method: "GET",
    path: "/delete/",
    fn: function(args, callback) {
      Homey.app.apiDelete();
      callback(null, true);
    }
  },
  {
    description: "Register as device DB",
    method: "GET",
    path: "/register/",
    fn: function(args, callback) {
      Homey.app.apiRegister();
      callback(null, true);
    }
  },
  {
    description: "Upgrade to SDK version 1",
    method: "GET",
    path: "/upgradeToSDKv1/",
    fn: function(args, callback) {
      Homey.app.upgradeToSDKv1();
      callback(null, true);
    }
  }
];
