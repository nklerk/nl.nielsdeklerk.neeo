"use strict";

//Mandatory Homey App.
const Homey = require("homey");

//NEEO Server
require("./neeo-server");

//Initiate Homey [If...] Cards.
require("./homey-if-neeoEventReceived");
require("./homey-if-neeoButtonPressed");
require("./homey-if-neeoSliderChanged");
require("./homey-if-neeoSwitchChanged");

//Initiate Homey [...And...] Cards.
require("./homey-and-neeoRecipeActive");
require("./homey-and-neeoUpdateAvailable");

//Initiate Homey [...Then] Cards.
require("./homey-then-neeoActivateRecipe");
require("./homey-then-neeoPowerOffRecipe");
require("./homey-then-neeoPowerOffAll");
require("./homey-then-neeoCommandButton");
require("./homey-then-neeoCommandSwitch");
require("./homey-then-neeoCommandSlider");
require("./homey-then-neeoInformSlider");
require("./homey-then-neeoInformSliderValue");
require("./homey-then-neeoInformSwitch");
require("./homey-then-neeoInformTextlabel");
require("./homey-then-neeoBrainBlinkLED");
require("./homey-then-neeoBrainUpdateFirmware");

//Homey.App Extension class.
class neeoAppV2 extends Homey.App {
  onInit() {
    console.log("init neeoAppV2");
  }
  apiDiscover() {
    const neeoBrain = require("./neeo-brain");
    neeoBrain.discover();
  }
  apiDelete() {
    const neeoBrain = require("./neeo-brain");
    neeoBrain.brainDelete();
  }
}
module.exports = neeoAppV2;
