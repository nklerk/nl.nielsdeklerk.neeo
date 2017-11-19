'use strict';
const Homey = require('homey');
const homeyAutocomplete = require('./homey-autocomplete');
const neeoBrain = require('./neeo-brain');

let neeoRecipeActive = new Homey.FlowCardCondition('recipe_active');
neeoRecipeActive.register().registerRunListener((args, state)=>{	
	neeoBrain.isRecipeActive(args.room.brainip, args.room.key, args.recipe.key, (answer)=>{
		return answer;
	});
});

let neeoRecipeActiveRoom = neeoRecipeActive.getArgument('room');
neeoRecipeActiveRoom.registerAutocompleteListener(( query, args ) => { return homeyAutocomplete.rooms(query, args); });

let neeoRecipeActiveRecipe = neeoRecipeActive.getArgument('recipe');
neeoRecipeActiveRecipe.registerAutocompleteListener(( query, args ) => { return null, homeyAutocomplete.recepies(query, args, 'launch'); });
