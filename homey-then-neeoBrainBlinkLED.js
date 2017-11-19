'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoBrainBlinkLED= new Homey.FlowCardAction('neeobrain_blinkLED');
neeoBrainBlinkLED.register().registerRunListener((args, state)=>{	
	console.log  ('[HOMEY FLOW]\taction.neeobrain_blinkLED');
	neeoBrain.blinkLed(args.brain.ip, args.times);
	return true;
});

let neeoBrainBlinkLEDBrain = neeoBrainBlinkLED.getArgument('brain');
neeoBrainBlinkLEDBrain.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.neeoBrains(query, args); });




/* 		//neeobrain_blinkLED
		Homey.manager('flow').on('action.neeobrain_blinkLED.brain.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.neeoBrains(args));
		});
		Homey.manager('flow').on('action.neeobrain_blinkLED', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.neeobrain_blinkLED');
			neeoBrain.blinkLed(args.brain.ip, args.times);
			callback( null, true ); 
		}); */

