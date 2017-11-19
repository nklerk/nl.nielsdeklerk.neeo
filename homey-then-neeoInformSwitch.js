'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const tools = require('./tools');

let neeoInformSwitch = new Homey.FlowCardAction('inform_switch');
neeoInformSwitch.register().registerRunListener((args, state)=>{	
    console.log ('[HOMEY FLOW]\taction.inform_switch');
    args.value = tools.stringToBoolean(args.value);
    neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
    neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
    homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
    return true;

});

let neeoInformSwitchDevice = neeoInformSwitch.getArgument('device');
neeoInformSwitchDevice.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.devices(query, args); });

let neeoInformSwitchCapabilitie = neeoInformSwitch.getArgument('capabilitie');
neeoInformSwitchCapabilitie.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.capabilities(query, args, "range"); });
/* 		//inform_switch
		Homey.manager('flow').on('action.inform_switch.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_switch.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "binary"));
		});
		Homey.manager('flow').on('action.inform_switch', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_switch');
			args.value = tools.stringToBoolean(args.value);
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		}); */