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
