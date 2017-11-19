'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoCommandSwitch = new Homey.FlowCardAction('command_switch');
neeoCommandSwitch.register().registerRunListener((args, state)=>{	
    console.log  ('[HOMEY] \tFlip switch "' + args.capabilitie.name + '" of ' + args.device.name);
    neeoBrain.commandSwitch(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key, args.value);
    return true;
});

let neeoCommandSwitchRoom = neeoCommandSwitch.getArgument('room');
neeoCommandSwitchRoom.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.rooms(query, args); });

let neeoCommandSwitchDevice = neeoCommandSwitch.getArgument('device');
neeoCommandSwitchDevice.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.roomDevices(query, args); });

let neeoCommandSwitchCapabilitie = neeoCommandSwitch.getArgument('capabilitie');
neeoCommandSwitchCapabilitie.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.switches(query, args); });

/* 		//command_switch
		Homey.manager('flow').on('action.command_switch.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});	
		Homey.manager('flow').on('action.command_switch.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_switch.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.switches(args));
		});
		Homey.manager('flow').on('action.command_switch', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tFlip switch "' + args.capabilitie.name + '" of ' + args.device.name);
			neeoBrain.commandSwitch(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key, args.value);
			callback( null, true ); 
		}); */