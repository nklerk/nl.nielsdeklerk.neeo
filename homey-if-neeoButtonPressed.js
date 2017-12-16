'use strict';
const Homey = require('homey');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoButtonPressed = new Homey.FlowCardTrigger('button_pressed');
neeoButtonPressed.register().registerRunListener((args, state)=>{	
	if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie){
		console.log  ('[HOMEY] \tA flow is triggered by card "button_pressed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
		return true;
	} else {
		return false;
	}
});

let neeoButtonPressedDevice = neeoButtonPressed.getArgument('device');
neeoButtonPressedDevice.registerAutocompleteListener( ( query, args ) => {return homeyAutocomplete.devices(query, args);});

let neeoButtonPressedCapability = neeoButtonPressed.getArgument('capabilitie');
neeoButtonPressedCapability.registerAutocompleteListener( ( query, args ) => {	return homeyAutocomplete.capabilities(query, args, "button");});

module.exports.trigger = function (args, state){
    neeoButtonPressed.trigger(args, state)
    .then( this.log )
    .catch( this.error );
}