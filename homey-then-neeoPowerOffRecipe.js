"use strict";
const Homey = require("homey");
const neeoBrain = require("./neeo-brain");
const homeyAutocomplete = require("./homey-autocomplete");

let neeoPoweroffRecipe = new Homey.FlowCardAction("poweroff_recipe");
neeoPoweroffRecipe.register().registerRunListener((args, state) => {
  neeoBrain.executeRecipe(args.room.brainip, args.room.key, args.recipe.key);
  return true;
});

let neeoPoweroffRecipeRoom = neeoPoweroffRecipe.getArgument("room");
neeoPoweroffRecipeRoom.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.rooms(query, args);
});

let neeoPoweroffRecipeRecipe = neeoPoweroffRecipe.getArgument("recipe");
neeoPoweroffRecipeRecipe.registerAutocompleteListener((query, args) => {
  return homeyAutocomplete.recepies(query, args, "poweroff");
});
