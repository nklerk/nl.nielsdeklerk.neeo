'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const tools = require('./tools');

let neeoInformSliderValue = new Homey.FlowCardAction('inform_slider_value');
neeoInformSliderValue.register().registerRunListener((args, state)=>{	
    console.log  ('[HOMEY FLOW]\taction.inform_slider_value');
    neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
    neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
    homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
    return true;
});

let neeoInformSliderValueDevice = neeoInformSliderValue.getArgument('device');
neeoInformSliderValueDevice.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.devices(query, args); });

let neeoInformSliderValueCapabilitie = neeoInformSliderValue.getArgument('capabilitie');
neeoInformSliderValueCapabilitie.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.capabilities(query, args, "range"); });

/* 		//inform_slider_value
		Homey.manager('flow').on('action.inform_slider_value.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_slider_value.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "range"));
		});
		Homey.manager('flow').on('action.inform_slider_value', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_slider_value');
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		});
		 */