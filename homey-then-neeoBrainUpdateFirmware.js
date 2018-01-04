'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoBrainUpdateFirmware = new Homey.FlowCardAction('neeoBrainUpdateFirmware');
neeoBrainUpdateFirmware.register().registerRunListener((args, state)=>{	
	console.log  ('[HOMEY FLOW]\Homey.FlowCardAction(neeoBrainUpdateFirmware)');
	return neeoBrain.updateFirmware(args.brain.name);
});

let neeoBrainUpdateFirmwareBrain = neeoBrainUpdateFirmware.getArgument('brain');
neeoBrainUpdateFirmwareBrain.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.neeoBrains(query, args); });