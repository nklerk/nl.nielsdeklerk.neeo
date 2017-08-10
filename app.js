/* global Homey */
'use strict'

const neeoServer = require('./neeo-server');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const tools = require('./tools');


module.exports = {
	apiDiscover: function(callback) {
		neeoBrain.discover();
	},
	init: function () {
		// Button pressed.
		Homey.manager('flow').on('trigger.button_pressed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.button_pressed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "button"));
		});
		Homey.manager('flow').on('trigger.button_pressed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log  ('[HOMEY] \tA flow is triggered by card "button_pressed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
		
		
		//switch_changed
		Homey.manager('flow').on('trigger.switch_changed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.switch_changed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "switch"));
		});
		Homey.manager('flow').on('trigger.switch_changed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log ('[HOMEY] \tA flow is triggered by card "switch_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			} else {
				callback(null, false);
			}
		});
		
		
		//slider_changed
		Homey.manager('flow').on('trigger.slider_changed.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('trigger.slider_changed.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "slider"));
		});
		Homey.manager('flow').on('trigger.slider_changed', function (callback, args, state) {
			if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
				Homey.log  ('[HOMEY] \tA flow is triggered by card "slider_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
				callback(null, true);
			}  else {
				callback(null, false);
			}
		});
		

		//recipe_active
    Homey.manager('flow').on('condition.recipe_active.room.autocomplete', function (callback, args) {
        callback(null, homeyAutocomplete.rooms(args));
    });
    Homey.manager('flow').on('condition.recipe_active.recipe.autocomplete', function (callback, args) {
        callback(null, homeyAutocomplete.recepies(args, 'launch'));
    });
		Homey.manager('flow').on('condition.recipe_active', function (callback, args) {
			neeoBrain.isRecipeActive(args.room.brainip, args.room.key, args.recipe.key, (answer)=>{
				callback (null, answer);
			});
		});


		
		//activate_recipe
		Homey.manager('flow').on('action.activate_recipe.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.activate_recipe.recipe.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.recepies(args, 'launch'));
		});
		Homey.manager('flow').on('action.activate_recipe', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tActivating recipe ' + args.recipe.name + '.'); 
			neeoBrain.executeRecipe(args.room.brainip, args.room.key, args.recipe.key);
			callback( null, true ); 
		});
		
		
		//poweroff_recipe
		Homey.manager('flow').on('action.poweroff_recipe.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.poweroff_recipe.recipe.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.recepies(args, 'poweroff'));
		});
		Homey.manager('flow').on('action.poweroff_recipe', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tPowering off recipe ' + args.recipe.name + '.'); 
			neeoBrain.executeRecipe(args.room.brainip, args.room.key, args.recipe.key);
			callback( null, true ); 
		});
		
		
		//Poweroff_all
		Homey.manager('flow').on('action.poweroff_all_recipes', function (callback) {
			Homey.log  ('[HOMEY] \tPowering off all recipes.'); 
			neeoBrain.shutdownAllRecipes();
			callback( null, true );
		});
		
		
		//command_button
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
		});
		
		
		//command_switch
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
		});
		
		
		//command_slider
		Homey.manager('flow').on('action.command_slider.room.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.rooms(args));
		});
		Homey.manager('flow').on('action.command_slider.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.roomDevices(args));
		});
		Homey.manager('flow').on('action.command_slider.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.sliders(args));
		});
		Homey.manager('flow').on('action.command_slider', function (callback, args, state) {
			Homey.log  ('[HOMEY] \tDragging slider "' + args.capabilitie.name + '" of ' + args.device.name + ' to ' + args.value); 
			neeoBrain.commandSlider(args.room.brainip, args.room.key, args.device.key, args.capabilitie.key, args.value);
			callback( null, true ); 
		});
		
		
		//inform_slider
		Homey.manager('flow').on('action.inform_slider.device.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.devices(args));
		});
		Homey.manager('flow').on('action.inform_slider.capabilitie.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.capabilities(args, "range"));
		});
		Homey.manager('flow').on('action.inform_slider', function (callback, args, state) {
			Homey.log ('[HOMEY FLOW]\taction.inform_slider');
			if (args.value >= 0 && args.value <= 1){
				const value = tools.percentage(args.value, args.capabilitie.range);
				neeoBrain.notifyStateChange(args.device.adapterName, args.capabilitie.realname, value);
				neeoDatabase.capabilitieSetValue(args.device.adapterName, args.capabilitie.realname, value);
				homeyTokens.set(args.device.name, args.capabilitie.name, value);
				callback( null, true );
			} else {
				callback( null, false );
			}
		});
		
		
		//inform_slider_value
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
		
		
		//inform_switch
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
		});
		
		
		//inform_textlabel
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
		});

		//neeobrain_blinkLED
		Homey.manager('flow').on('action.neeobrain_blinkLED.brain.autocomplete', function( callback, args ){
			callback(null, homeyAutocomplete.neeoBrains(args));
		});
		Homey.manager('flow').on('action.neeobrain_blinkLED', function (callback, args, state) {
			Homey.log  ('[HOMEY FLOW]\taction.neeobrain_blinkLED');
			neeoBrain.blinkLed(args.brain.ip, args.times);
			callback( null, true ); 
		});
	}
};