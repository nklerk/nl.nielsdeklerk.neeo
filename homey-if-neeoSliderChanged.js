'use strict';
const Homey = require('homey');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoSliderChanged = new Homey.FlowCardTrigger('slider_changed');
neeoSliderChanged.register().registerRunListener((args, state)=>{	
	if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie){
		console.log  ('[HOMEY] \tA flow is triggered by card "slider_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
		return true;
	} else {
		return false;
	}
});

let neeoSliderChangedDevice = neeoSliderChanged.getArgument('device');
neeoSliderChangedDevice.registerAutocompleteListener( ( query, args ) => {return homeyAutocomplete.devices(query, args);});

let neeoSliderChangedCapabilitie = neeoSliderChanged.getArgument('capabilitie');
neeoSliderChangedCapabilitie.registerAutocompleteListener( ( query, args ) => {	return homeyAutocomplete.capabilities(query, args, "slider");});

module.exports.Trigger = function (args, state){
    neeoSliderChanged.trigger(args, state)
    .then( this.log )
    .catch( this.error );
}
