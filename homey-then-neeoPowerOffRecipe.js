'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoPoweroffRecipe = new Homey.FlowCardAction('poweroff_recipe');
neeoPoweroffRecipe.register().registerRunListener((args, state)=>{	
    console.log ('[HOMEY] \tPowering off recipe ' + args.recipe.name + '.'); 
    neeoBrain.executeRecipe(args.room.brainip, args.room.key, args.recipe.key);	
    return true;
});

let neeoPoweroffRecipeRoom = neeoPoweroffRecipe.getArgument('room');
neeoPoweroffRecipeRoom.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.rooms(query, args); });

let neeoPoweroffRecipeRecipe= neeoPoweroffRecipe.getArgument('recipe');
neeoPoweroffRecipeRecipe.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.recipe(query, args, "poweroff"); });


/* 	//poweroff_recipe
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
    }); */