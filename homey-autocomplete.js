'use strict'

const tools = require('./tools');
const neeoBrain = require('./neeo-brain');


module.exports.capabilities = function(args, type){
	const query = tools.stringCleanForMatch(args.query); 
	const devices = Homey.manager('settings').get('myDevices');
	let foundcapa = [];
	for (const device of devices) {
		if (device.adapterName == args.args.device.adapterName){
			for (const capabilitie of device.capabilities) {
				const capabilitieQ = tools.stringCleanForMatch(capabilitie.label);
				if (capabilitieQ.indexOf(query) !== -1 ) {
					if (capabilitie.sensor && capabilitie.sensor.type === type || capabilitie.type == type){
						if (capabilitie.sensor.type === 'range'){
							foundcapa.push({name: capabilitie.label, realname: capabilitie.name, range: capabilitie.sensor.range});
						} else {
							foundcapa.push({name: capabilitie.label, realname: capabilitie.name});
						}
					}
				}
			}
		}
	}
	return(foundcapa);
}


module.exports.rooms = function(args){
	if (Homey.manager('settings').get('downloading') != true) {
        neeoBrain.downloadConfiguration();
    }
	const query = tools.stringCleanForMatch(args.query)
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundrooms = [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			const roomQ = tools.stringCleanForMatch(room.name);
			if (roomQ.indexOf(query) !== -1) {
				const item = {
					name: room.name,
					key: room.key,
					brainip: neeoBrain.host
				};
				foundrooms.push(item);
			}
		}
	}
	return foundrooms;
}


module.exports.neeoBrains = function(args){
	if (Homey.manager('settings').get('downloading') != true) {
  	neeoBrain.downloadConfiguration();
  }
	const query = tools.stringCleanForMatch(args.query);
  const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundBrains = [];
	for (const neeoBrain of neeoBrains) {
		if (neeoBrain.host.indexOf(query) !== -1) {
			const item = {
				name: neeoBrain.host,
				ip: neeoBrain.ip[0]
			};
			foundBrains.push(item);
		}
	}
	return foundBrains;
}


module.exports.roomDevices = function(args){
	if (Homey.manager('settings').get('downloading') != true) {
  	neeoBrain.downloadConfiguration();
  }
	const query = tools.stringCleanForMatch(args.query);
  const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let founddevices = [];
    for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.devices) {
					const device = room.devices[i];
					const deviceQ = tools.stringCleanForMatch(device.name);
					if (deviceQ.indexOf(query) !== -1) {
						const item = {
							name: device.name,
							key: device.key
						};
						founddevices.push(item);
					}
				}
			}
		}
	}
	return founddevices;
}


module.exports.devices = function(args){
	const query = tools.stringCleanForMatch(args.query);
	const devices = Homey.manager('settings').get('myDevices');
	let founddevices = [];
	for (const device of devices) {
		const deviceQ = tools.stringCleanForMatch(device.manufacturer + device.name);
		if (deviceQ.indexOf(query) !== -1 ) {
			const item = {
				name: device.manufacturer+", "+device.name,
				adapterName: device.adapterName
			};
			founddevices.push(item);
		}
	}
	return founddevices;
}


module.exports.macros = function (args){
	if (Homey.manager('settings').get('downloading') != true) {
        neeoBrain.downloadConfiguration();
    }
	const query = tools.stringCleanForMatch(args.query);
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundmacros= [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.devices) {
					const device = room.devices[i];
					if (device.key === args.args.device.key) {
						for (const i in device.macros) {
							const macro = device.macros[i];
							const macroQ = tools.stringCleanForMatch(macro.name);
							if (macroQ.indexOf(query) !== -1) {
								const item = {
									name: macro.name,
									key: macro.key
								};
								foundmacros.push(item);
							}
						}
					};
				}
			}
		}
	}
	return foundmacros;
}


module.exports.sliders = function(args){
	if (Homey.manager('settings').get('downloading') != true) {
        neeoBrain.downloadConfiguration();
    }
	const query = tools.stringCleanForMatch(args.query);
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundsliders= [];
	for (const neeoBrain of neeoBrains) {
	for (const i in neeoBrain.brainConfiguration.rooms) {
		const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.devices) {
					const device = room.devices[i];
					if (device.key === args.args.device.key) {
						for (const i in device.sliders) {
							const slider = device.sliders[i];
							const sliderQ = tools.stringCleanForMatch(slider.name);
							if (sliderQ.indexOf(query) !== -1) {
								const item = {
									name: slider.name,
									key: slider.key
								};
								foundsliders.push(item);
							};
						};
					};
				};
			};
		};
	};
	return foundsliders;
}; 


module.exports.switches = function(args){
	if (Homey.manager('settings').get('downloading') != true) {
        neeoBrain.downloadConfiguration();
    }
	const query = (args.query);
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundswitches= [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.devices) {
					const device = room.devices[i];
					if (device.key === args.args.device.key) {
						for (const i in device.switches) {
							const switche = device.switches[i];
							const switchQ = tools.stringCleanForMatch(switche.name);
							if (switchQ.indexOf(query) !== -1) {
								const item = {
									name: switche.name,
									key: switche.key
								};
								foundswitches.push(item);
							}
						}
					};
				}
			}
		}
	}
	return foundswitches;
}


module.exports.recepies = function(args, stype){
	if (Homey.manager('settings').get('downloading') != true) {
        neeoBrain.downloadConfiguration();
    }
	const query = tools.stringCleanForMatch(args.query);
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundrecipes = [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.recipes) {
					const recipe = room.recipes[i];
					const recipeQ = tools.stringCleanForMatch(recipe.name);
					if (recipeQ.indexOf(query) !== -1 && recipe.type == stype) {
						const item = {
							name: recipe.name,
							key: recipe.key
						};
						foundrecipes.push(item);
					}
				}
			}
		}
	}
	return foundrecipes;
}