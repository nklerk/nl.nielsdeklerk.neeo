'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');

let neeoInformTextlabel = new Homey.FlowCardAction('inform_textlabel');
neeoInformTextlabel.register().registerRunListener((args, state)=>{	
    console.log ('[HOMEY FLOW]\taction.inform_textlabel');
    neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
    neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
    homeyTokens.set(args.device.name, args.capabilitie.name, args.value);		
    return true;
});

let neeoInformTextlabelDevice = neeoInformTextlabel.getArgument('device');
neeoInformTextlabelDevice.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.devices(query, args); });

let neeoInformTextlabelCapabilitie = neeoInformTextlabel.getArgument('capabilitie');
neeoInformTextlabelCapabilitie.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.capabilities(query, args, "range"); });

/* 		//inform_textlabel
		Homey.manager('flow').on('action.inform_textlabel.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_textlabel.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "custom"));
		});
		Homey.manager('flow').on('action.inform_textlabel', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.inform_textlabel');
			neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, args.value);
			neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, args.value);
			homeyTokens.set(args.device.name, args.capabilitie.name, args.value);	
			callback( null, true ); 
		}); */