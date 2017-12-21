'use strict';
const Homey = require('homey');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoBrain = require('./neeo-brain');

let neeoUpdateAvailable = new Homey.FlowCardCondition('UpdateAvailable');
neeoUpdateAvailable.register().registerRunListener((args, state)=>{	
	return neeoBrain.isUpdateAvaileble(args.brain.name);
});


let neeoUpdateAvailableBrain = neeoUpdateAvailable.getArgument('brain');
neeoUpdateAvailableBrain.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.neeoBrains(query, args); });

module.exports.trigger = function (state){
    neeoUpdateAvailable.trigger(state)
    .then( this.log )
    .catch( this.error );
}