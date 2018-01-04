'use strict';

//Mandatory Homey App.
	const Homey = require('homey');

//NEEO Server
	const neeoServer = require('./neeo-server');

//Initiate Homey [If...] Cards.
	const neeoEventReceived = require('./homey-if-neeoEventReceived');
	const neeoButtonPressed = require('./homey-if-neeoButtonPressed');
	const neeoSliderChanged = require('./homey-if-neeoSliderChanged');
	const neeoSwitchChanged = require('./homey-if-neeoSwitchChanged');

//Initiate Homey [...And...] Cards.
	const neeoRecipeActive = require('./homey-and-neeoRecipeActive');
	const neeoUpdateAvailable = require('./homey-and-neeoUpdateAvailable');

//Initiate Homey [...Then] Cards.
	const neeoActivateRecipe = require('./homey-then-neeoActivateRecipe');
 	const neeoPowerOffRecipe = require('./homey-then-neeoPowerOffRecipe');
	const neeoPowerOffAll = require('./homey-then-neeoPowerOffAll');
	const neeoCommandButton = require('./homey-then-neeoCommandButton');
	const neeoCommandSwitch = require('./homey-then-neeoCommandSwitch');
	const neeoCommandSlider = require('./homey-then-neeoCommandSlider');
	const neeoInformSlider = require('./homey-then-neeoInformSlider');
	const neeoInformSliderValue = require('./homey-then-neeoInformSliderValue');
	const neeoInformSwitch = require('./homey-then-neeoInformSwitch')
	const neeoInformTextlabel = require('./homey-then-neeoInformTextlabel');
	const neeoBrainBlinkLED = require('./homey-then-neeoBrainBlinkLED');
	const neeoBrainUpdateFirmware = require('./homey-then-neeoBrainUpdateFirmware');

//Homey.App Extension class.
	class neeoAppV2 extends Homey.App {
		onInit() { 
			console.log('init neeoAppV2'); 
		}
		apiDiscover() {	
			const neeoBrain = require('./neeo-brain');
			neeoBrain.discover(); 
		}
		apiDelete() {	
			const neeoBrain = require('./neeo-brain');
			neeoBrain.brainDelete(); 
		}
	}
	module.exports = neeoAppV2;