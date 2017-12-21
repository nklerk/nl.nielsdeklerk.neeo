'use strict'
const Homey = require('homey');
const tools = require('./tools');

module.exports.refreshEventRegisters = function (neeoHost){
	let devices = Homey.ManagerSettings.get('myDevices');
	for (const a in devices) {
		const device = devices[a];
		for (const b in device.capabilities){
			const capability = device.capabilities[b];
			if (capability.type === 'sensor'){
				console.log('[DATABASE]\tUpdating Event registers of '+device.name+' sensor: '+capability.label);
				devices[a].capabilities[b].eventservers = findEventServers(device.adapterName, capability.name, neeoHost);
			}
		}
	}
	Homey.ManagerSettings.set('myDevices', devices);
}


function findEventServers (adapterName, capabilities_name, neeoHost){
	const neeoBrains = Homey.ManagerSettings.get( 'neeoBrains' );
	let foundEventregisters = [];
	for (const neeoBrain of neeoBrains) {
		if (neeoBrain.host == neeoHost && neeoBrain.brainConfiguration && neeoBrain.brainConfiguration.rooms) {
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
	const devices = Homey.ManagerSettings.get('myDevices');
	if (tools.isArray(devices)){
		return devices;
	} else{
		return [];
	}
}
module.exports.devices = allDevices;


module.exports.deviceSearch = function (queery){
	const queeries = queery.split(" ");
	const devices = allDevices();
	let founddevices = [];
	console.log('[DATABASE]\tGot queery for: ' +queery);
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
			console.log ('[DATABASE]\tReturned driver: "'+device.manufacturer+' '+device.name+'"  With score: '+maxScore);
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


module.exports.capabilitySetValue = function (adapterName, capabilities_name, newvalue, base64) {
	const devices = allDevices();
	capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,"");  
	for (let z in devices) {
		if (devices[z].adapterName == adapterName) {
			for (let y in devices[z].capabilities) {
				if (devices[z].capabilities[y].type ==='sensor' && devices[z].capabilities[y].name === capabilities_name + '_SENSOR') {
					console.log ('[DATABASE]\tUpdating database from old Value: ' + devices[z].capabilities[y].sensor.value + ' to new value: ' + newvalue);
					devices[z].capabilities[y].sensor.value = newvalue;
					if (base64) {
						devices[z].capabilities[y].sensor.base64 = base64;
					}
				}
			}
		}
	}
	Homey.ManagerSettings.set('myDevices', devices);
	let response = '{"success":true}';
	return response;
}


module.exports.capability = function (adapterName, capabilityName) {
	const devices = allDevices();
	let response = {};
	for (const device of devices) {
		if (device.adapterName == adapterName) {
			for (const capability of device.capabilities) {
				if (capability.name == capabilityName) {
					return capability;
				}
			}
		}
	}
	return {};
} 