'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');


let neeoCommandButton = new Homey.FlowCardAction('command_button');
neeoCommandButton.register().registerRunListener((args, state)=>{	
    console.log  ('[HOMEY] \tPressing the "' + args.capabilitie.name + '" button of ' + args.device.name); 
    neeoBrain.commandButton(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key);
    return true;
});

let neeoCommandButtonRoom = neeoCommandButton.getArgument('room');
neeoCommandButtonRoom.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.rooms(query, args); });

let neeoCommandButtonDevice = neeoCommandButton.getArgument('device');
neeoCommandButtonDevice.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.roomDevices(query, args); });

let neeoCommandButtonCapabilitie = neeoCommandButton.getArgument('capabilitie');
neeoCommandButtonCapabilitie.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.macros(query, args); });


/* 		//command_button
		Homey.manager('flow').on('action.command_button.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.command_button.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_button.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.macros(args));
		});
		Homey.manager('flow').on('action.command_button', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tPressing the "' + args.capabilitie.name + '" button of ' + args.device.name); 
			neeoBrain.commandButton(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key);
			callback( null, true ); 
		}); */