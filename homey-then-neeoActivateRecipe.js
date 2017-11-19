'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');
const homeyAutocomplete = require('./homey-autocomplete');

let neeoActivateRecipe= new Homey.FlowCardAction('activate_recipe');
neeoActivateRecipe.register().registerRunListener((args, state)=>{	
	console.log  ('[HOMEY] \tActivating recipe ' + args.recipe.name + '.'); 
	neeoBrain.executeRecipe(args.room.brainip, args.room.key, args.recipe.key);
	return true;
});

let neeoActivateRecipeRoom = neeoActivateRecipe.getArgument('room');
neeoActivateRecipeRoom.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.rooms(query, args); });

let neeoActivateRecipeRecipe = neeoActivateRecipe.getArgument('recipe');
neeoActivateRecipeRecipe.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.recepies(query, args, 'launch'); });
