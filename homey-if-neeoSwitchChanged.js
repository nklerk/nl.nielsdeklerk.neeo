'use strict';
const Homey = require('homey');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoSwitchChanged = new Homey.FlowCardTrigger('switch_changed');
neeoSwitchChanged.register().registerRunListener((args, state)=>{	
	if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
		console.log ('[HOMEY] \tA flow is triggered by card "switch_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
		return true;
	} else {
		return false;
	}
});

let neeoSwitchChangedDevice = neeoSwitchChanged.getArgument('device');
neeoSwitchChangedDevice.registerAutocompleteListener( ( query, args ) => {return homeyAutocomplete.devices(query, args);});

let neeoSwitchChangedCapabilitie = neeoSwitchChanged.getArgument('capabilitie');
neeoSwitchChangedCapabilitie.registerAutocompleteListener( ( query, args ) => {	return homeyAutocomplete.capabilities(query, args, "switch");});

module.exports.trigger = function (args, state){
    neeoSwitchChanged.trigger(args, state)
    .then( this.log )
    .catch( this.error );
}
