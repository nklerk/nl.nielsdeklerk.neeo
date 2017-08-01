'use strict'

const homeyTokens = require('./homey-tokens');
const tools = require('./tools');
const neeoDatabase = require('./neeo-database');

const TCP_PORT = 6336;
const NEEO_CONNECT_INTERVAL= 60000;	//1 Min
const NEEO_RECONNECT_INTERVAL = 900000;	//15 Min
let neeoConnectionTries = 0;


module.exports.discover = function discover() {
	Homey.log ("[SERVER]\tSearching for NEEO brains... MUST.... EAT..... BRAINS .....!!!");
	const mdns = require('mdns-js');
	mdns.excludeInterface('0.0.0.0');
	let browser = mdns.createBrowser('_neeo._tcp');
	browser.on('ready', function () {
		browser.discover(); 
	});
	browser.on('update', function (data) {
		addNeeoBrainToDatabase(data);
	});
}


function addNeeoBrainToDatabase(foundbrain) {
	let neeoBrains = Homey.manager('settings').get( 'neeoBrains');
	if (!neeoBrains) {
		neeoBrains = [];
	}
	let exist = 0;
	for (const i in neeoBrains) {
		if (neeoBrains[i].host === foundbrain.host) {
			Homey.log('[SERVER]\tUpdating settings: '+foundbrain.host);
			neeoBrains[i].ip = foundbrain.addresses;
			exist = exist + 1;
		};
	}
	if (exist === 0) {
		Homey.log('[SERVER]\tNew NEEO Brain found: '+foundbrain.host);
		const neeoBrain = {host: foundbrain.host, ip: foundbrain.addresses};
		neeoBrains.push(neeoBrain);
		registerAsDeviceDatabase(neeoBrain);
		registerForwarderEvents(neeoBrain);
		downloadConfiguration(neeoBrain);
	}
	Homey.manager('settings').set('neeoBrains', neeoBrains);
}


module.exports.connect = function connect() {
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	if ((!neeoBrains || neeoBrains.length === 0 )&& neeoConnectionTries < 10) {
		discover();
		setTimeout(connect, NEEO_CONNECT_INTERVAL);
        neeoConnectionTries++;
	} else {
		console.log ('Debugg')
		for (let neeoBrain of neeoBrains) {
			Homey.log('[SERVER]\tConnecting: '+neeoBrain.host+' ('+neeoBrain.ip+')');
			registerAsDeviceDatabase(neeoBrain);
			registerForwarderEvents(neeoBrain);
			downloadConfiguration(neeoBrain);
			homeyTokens.setAll();
		}
	}
	setTimeout(connect, NEEO_RECONNECT_INTERVAL);
}


function registerAsDeviceDatabase(neeoBrain) {
	Homey.log ('[DRIVER]\t'+neeoBrain.host+', Registering Homey as NEEO device server...');
	const content = {
		name: 'Homey_Devicedatabase_'+tools.getLocalIp(), 
		baseUrl: 'http://'+tools.getLocalIp()+':'+TCP_PORT
	};
	const options = {
		hostname: neeoBrain.host,
		port: 3000,
		path: '/v1/api/registerSdkDeviceAdapter',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};
	tools.httpRequest(options, content, (response, responseData)=>{
		if (responseData === '{"success":true}'){
			Homey.log ('[DRIVER]\t'+neeoBrain.host+', Registration succesfull.');
		}
	});
}

function registerForwarderEvents(neeoBrain){
	Homey.log ('[EVENTS]\t'+neeoBrain.host+', Registering Homey as NEEO events receiver...');
	const content = {
		host: tools.getLocalIp(),
		port: TCP_PORT,
		path: '/Homey-By-Niels_de_Klerk'
	};
	const options = {
		hostname: neeoBrain.host,
		port: 3000,
		path: '/v1/forwardactions',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};
	tools.httpRequest(options, content, (response, responseData)=>{
		if (responseData === '{"success":true}'){
			Homey.log ('[EVENTS]\t'+neeoBrain.host+', Registration succesfull.');
		} else {
			Homey.log ('[EVENTS]\tERROR: '+neeoBrain.host+', Registration unsuccesfull!');
		}
	});
}

function downloadConfiguration(neeoBrainQ){
	Homey.manager('settings').set('downloading', true);
	let neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
	if (neeoBrains !== undefined && neeoBrains.length !== 0) {
		for (let neeoBrain of neeoBrains) {
			if (!neeoBrainQ || neeoBrain.host === neeoBrainQ.host) {
				Homey.log ('[DATABASE]\t'+neeoBrain.host+', Downloading configuration...');
				const options = {
					hostname: neeoBrain.host,
					port: 3000,
					path: '/v1/projects/home',
					method: 'GET',
					headers: {'Content-Type': 'application/json'}
				};
				tools.httpRequest(options, null, (response, responseData)=>{
					Homey.log ('[DATABASE]\t'+neeoBrain.host+', Download complete.');
						let brainConfiguration = JSON.parse(responseData);
						neeoBrain.brainConfiguration = brainConfiguration;
						Homey.manager('settings').set('neeoBrains', neeoBrains);
						neeoDatabase.refreshEventRegisters();
				});
			}
		}
	}
	Homey.manager('settings').set('downloading', false);
}
module.exports.downloadConfiguration = downloadConfiguration;

module.exports.notifyStateChange = function (adapterName, capabilities_name, value){
	const capabilitie = neeoDatabase.capabilitie(adapterName, capabilities_name)
	if (capabilitie && capabilitie.eventservers) {
		for (let eventserver of capabilitie.eventservers) {
			const content = {
				type: eventserver.eventKey, 
				data: value
			};
			const options = {
				hostname: eventserver.host,
				port: 3000,
				path: '/v1/notifications', 
				method: 'POST', 
				headers: {'Content-Type': 'application/json'}
			};
			tools.httpRequest(options, content, (response, responseData)=>{
				if (responseData === '{"success":true}'){
					Homey.log ('[NOTIFICATIONS]\tSuccesfully sent notification with value '+content.data+' to eventkey '+content.type+' @'+options.hostname);
				}
			});
		}
	} else {
		Homey.log('[ERROR]\t\tneeoBrain_sensor_notify('+adapterName+', '+capabilities_name+', '+value+')');
	}
}

module.exports.shutdownAllRecipes = function (){
	const neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
	for (const neeoBrain of neeoBrains){
		tools.httpRequest({ hostname: neeoBrain.host,	port: 3000,	path: '/v1/api/Recipes', method: 'GET', headers: {'Content-Type': 'application/json'}},	null,	(res, recipies)=>{
			if (typeof recipies !== 'undefined'){
				recipies = JSON.parse(recipies);
				for (const recipie of recipies) {
					if (recipie.isPoweredOn === true){
						Homey.log  (' - Powering off '+recipie.detail.devicename);
						const url=require('url');
						const a = url.parse(recipie.url.setPowerOff);
						tools.httpGetAndForget('GET', a.hostname, a.port, a.pathname);
					}
				}
			}
		});
	} 
}

module.exports.executeRecipe = function (brainIp, roomKey, recipeKey) {
	tools.httpGetAndForget('GET', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/recipes/'+recipeKey+'/execute');
}

module.exports.commandButton = function (brainIp, roomKey, deviceKey, capabilitieKey){
	tools.httpGetAndForget('GET', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/devices/'+deviceKey+'/macros/'+capabilitieKey+'/trigger');
}

module.exports.commandSwitch = function (brainIp, roomKey, deviceKey, capabilitieKey, value){
	tools.httpGetAndForget('PUT', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/devices/'+args.device.key+'/switches/'+capabilitieKey+'/'+value);
}

module.exports.commandSlider = function (brainIp, roomKey, deviceKey, capabilitieKey, value){
	tools.httpGetAndForget('PUT', brainIp, 3000, '/v1/projects/home/rooms/' + roomKey + '/devices/' + deviceKey + '/sliders/' + capabilitieKey, {value: value});
}