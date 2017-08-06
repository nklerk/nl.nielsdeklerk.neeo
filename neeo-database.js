'use strict'

module.exports.refreshEventRegisters = function (){
	let devices = Homey.manager('settings').get('myDevices');
	for (const a in devices) {
		const device = devices[a];
		for (const b in device.capabilities){
			const capabilitie = device.capabilities[b];
			if (capabilitie.type === 'sensor'){
				Homey.log('[DATABASE]\tUpdating Event registers of '+device.name+' sensor: '+capabilitie.label);
				devices[a].capabilities[b].eventservers = findEventServers(device.adapterName, capabilitie.name);
			}
		}
	}
	Homey.manager('settings').set('myDevices', devices);
}


function findEventServers (adapterName, capabilities_name){
	const neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
	let foundEventregisters = [];
	for (const neeoBrain of neeoBrains) {
		if (neeoBrain.brainConfiguration && neeoBrain.brainConfiguration.rooms) {
			for (const a in neeoBrain.brainConfiguration.rooms) {
				const room = neeoBrain.brainConfiguration.rooms[a];
				for (const b in room.devices) {
					const device = room.devices[b];
					if (device.details.adapterName === adapterName){
						for (const c in device.sensors){
							const sensor = device.sensors[c];
							if (sensor.name === capabilities_name) {
								const foundEventregister = { host: neeoBrain.host, eventKey: sensor.eventKey };
								foundEventregisters.push(foundEventregister);
							}
						}
					}
				}
			}
		}
	}
	return foundEventregisters;
}
module.exports.findEventServers = findEventServers;


function allDevices () {
    return Homey.manager('settings').get('myDevices');
}
module.exports.devices = allDevices;


module.exports.deviceSearch = function (queery){
	const queeries = queery.split(" ");
	const devices = allDevices();
	let founddevices = [];
	Homey.log('[DATABASE]\tGot queery for: ' +queery);
	for (const device of devices) {
		let score = 0;
		let maxScore = 2;
		for (const queery of queeries) {
			if (device.name.toLowerCase().indexOf(queery.toLowerCase()) !== -1 ) {
				maxScore = maxScore + queery.length;
			}
			if (device.manufacturer.toLowerCase().indexOf(queery.toLowerCase()) !== -1 ) {
				maxScore = maxScore + queery.length;
			}
		}
		if (maxScore > 4) {
			Homey.log ('[DATABASE]\tReturned driver: "'+device.manufacturer+' '+device.name+'"  With score: '+maxScore);
			let fdevice = { item: device, score, maxScore};
			founddevices.push(fdevice);
		}
	}
	return founddevices;
}


module.exports.deviceById = function (id) {
	return allDevices().find((devices) => devices.id == id);
}


module.exports.deviceByAdaptername = function (adapterName){
	return allDevices().find((devices) => devices.adapterName == adapterName);
}


module.exports.capabilitieSetValue = function (adapterName, capabilities_name, newvalue) {
	const devices = allDevices();
	capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,"");  
	for (let z in devices) {
		if (devices[z].adapterName == adapterName) {
			for (let y in devices[z].capabilities) {
				if (devices[z].capabilities[y].type ==='sensor' && devices[z].capabilities[y].name === capabilities_name + '_SENSOR') {
					Homey.log ('[DATABASE]\tUpdating database from old Value: ' + devices[z].capabilities[y].sensor.value + ' to new value: ' + newvalue);
					devices[z].capabilities[y].sensor.value = newvalue;
				}
			}
		}
	}
	Homey.manager('settings').set('myDevices', devices);
	let response = '{"success":true}';
	return response;
}


module.exports.capabilitie = function (adapterName, capabilitieName) {
	const devices = allDevices();
	let response = {};
	if (devices) {
		for (const device of devices) {
			if (device.adapterName == adapterName) {
				for (const capabilitie of device.capabilities) {
					if (capabilitie.name == capabilitieName) {
						return capabilitie;
					}
				}
			}
		}
	}
	return {};
}