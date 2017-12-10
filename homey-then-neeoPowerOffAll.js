'use strict';
const Homey = require('homey');
const neeoBrain = require('./neeo-brain');

let neeoPoweroffAll = new Homey.FlowCardAction('poweroff_all_recipes');
neeoPoweroffAll.register().registerRunListener((args, state)=>{	
    console.log ('[HOMEY] \tPowering off all recipes.'); 
    neeoBrain.shutdownAllRecipes();	
    return true;
});

		