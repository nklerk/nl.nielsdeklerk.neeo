'use strict'
const Homey = require('homey');
const homeyTokens = require('./homey-tokens');
const tools = require('./tools');
const neeoDatabase = require('./neeo-database');
const httpmin = require('http.min');

const TCP_PORT = 6336;
const NEEO_CONNECT_INTERVAL= 60000;	//1 Min
const NEEO_RECONNECT_INTERVAL = 900000;	//15 Min
let neeoConnectionTries = 0;
let neeoBrains;


function discover() {
	console.log ("[SERVER]\tSearching for NEEO brains... MUST.... EAT..... BRAINS .....!!!");
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
module.exports.discover = discover;


function addNeeoBrainToDatabase(foundbrain) {
	neeoBrains = Homey.ManagerSettings.get( 'neeoBrains');
	if (!neeoBrains) {
		neeoBrains = [];
	}
	let exist = 0;
	for (const i in neeoBrains) {
		if (neeoBrains[i].host === foundbrain.host) {
			console.log('[SERVER]\tUpdating settings: '+foundbrain.host);
			neeoBrains[i].ip = foundbrain.addresses;
			exist = exist + 1;
		};
	}
	if (exist === 0) {
		console.log('[SERVER]\tNew NEEO Brain found: '+foundbrain.host);
		console.log ("_____________________________________________");
		console.log (foundbrain);
		console.log ("_____________________________________________");
		const neeoBrain = {host: foundbrain.host, ip: foundbrain.addresses};
		neeoBrains.push(neeoBrain);
		registerAsDeviceDatabase(neeoBrain);
		registerForwarderEvents(neeoBrain);
		downloadConfiguration(neeoBrain);
		downloadSystemInfo(neeoBrain);
	}
	Homey.ManagerSettings.set('neeoBrains', neeoBrains);
}


function connect() {
	neeoBrains = Homey.ManagerSettings.get('neeoBrains');
	if (!neeoBrains || neeoBrains.length === 0 ) {
		discover();
		neeoConnectionTries++;
		if (neeoConnectionTries <= 10) {
			setTimeout(connect, NEEO_CONNECT_INTERVAL);
		} else {
			setTimeout(connect, NEEO_RECONNECT_INTERVAL);
		}
	} else {
		for (let neeoBrain of neeoBrains) {
			console.log('[SERVER]\tConnecting: '+neeoBrain.host+' ('+neeoBrain.ip+')');
			registerAsDeviceDatabase(neeoBrain);
			registerForwarderEvents(neeoBrain);
			downloadConfiguration(neeoBrain);
			downloadSystemInfo(neeoBrain);
			//homeyTokens.setAll();
		}
		homeyTokens.setAll();
	}
	setTimeout(connect, NEEO_RECONNECT_INTERVAL);
}
module.exports.connect = connect;


function registerAsDeviceDatabase(neeoBrain) {
	console.log ('[DRIVER]\t'+neeoBrain.host+', Registering Homey as NEEO device server...');
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
			console.log ('[DRIVER]\t'+neeoBrain.host+', device registration succesfull.');
		} else {
			console.log ('[EVENTS]\tERROR: '+neeoBrain.host+', device registration unsuccesfull!');
		}
	});
}

function registerForwarderEvents(neeoBrain){
	console.log ('[EVENTS]\t'+neeoBrain.host+', Registering Homey as NEEO events receiver...');
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
			console.log ('[EVENTS]\t'+neeoBrain.host+', events registration succesfull.');
		} else {
			console.log ('[EVENTS]\tERROR: '+neeoBrain.host+', events registration unsuccesfull!');
		}
	});
}

function downloadConfiguration(neeoBrainQ){
	Homey.ManagerSettings.set('downloading', true);
	//let neeoBrains = Homey.ManagerSettings.get( 'neeoBrains' );
	if (tools.isArray(neeoBrains) && neeoBrains.length !== 0) {
		for (let neeoBrain of neeoBrains) {
			if (!neeoBrainQ || neeoBrain.host === neeoBrainQ.host) {
				console.log ('[DATABASE]\t'+neeoBrain.host+', Downloading configuration...');

				httpmin.json('http://'+neeoBrain.host+':3000/v1/projects/home').then(brainConfiguration => {
					console.log ('[DATABASE]\t'+neeoBrain.host+', Download complete.');
					neeoBrain.brainConfiguration = brainConfiguration;
					Homey.ManagerSettings.set('neeoBrains', neeoBrains);
					neeoDatabase.refreshEventRegisters();	//need to be made a more elegant sol
				}).catch(error => {
					console.log ('[ERROR]\tDownloading configuration from: '+neeoBrain.host+', ERROR: '+ error);
				});
			}
		}
	}
	Homey.ManagerSettings.set('downloading', false);
}
module.exports.downloadConfiguration = downloadConfiguration;


function downloadSystemInfo(neeoBrainQ){
	//let neeoBrains = Homey.ManagerSettings.get( 'neeoBrains' );
	if (tools.isArray(neeoBrains) && neeoBrains.length !== 0) {
		for (let neeoBrain of neeoBrains) {
			if (!neeoBrainQ || neeoBrain.host === neeoBrainQ.host) {
				console.log ('[SYSTEM INFO]\t'+neeoBrain.host+', Getting System Information...');
				
				const options = {
					hostname: neeoBrain.host,
					port: 3000,
					path: '/v1/systeminfo',
					method: 'GET',
					headers: {'Content-Type': 'application/json'}
				};

				tools.httpRequest(options, null, (response, responseData)=>{
					console.log ('[SYSTEM INFO]\t'+neeoBrain.host+', Complete.');
					let systemInfo = {};
					try {
						systemInfo = JSON.parse(responseData);
						//neeoBrain.systemInfo = systemInfo;
						neeoBrain.ip = systemInfo.ip
						Homey.ManagerSettings.set('neeoBrains', neeoBrains);
					} catch (e) {
						Homey.log ('[EVENTS]\tERROR: '+e);
					}
				});
			}
		}
	}
}

module.exports.notifyStateChange = function (adapterName, capabilitieName, value){
	const capabilitie = neeoDatabase.capabilitie(adapterName, capabilitieName)
	if (capabilitie && capabilitie.eventservers) {
		for (let eventserver of capabilitie.eventservers) {
			httpmin.post('http://'+eventserver.host+':3000/v1/notifications',{type : eventserver.eventKey , data : value }).then(result => {
				if (result.data === '{"success":true}'){
					console.log ('[NOTIFICATIONS]\tSuccesfully sent notification with value '+value+' to eventkey '+eventserver.eventKey+' @'+eventserver.host);
				} else {
					console.log ('[ERROR]\t\tError sending notification with value '+value+' to eventkey '+eventserver.eventKey+' @'+eventserver.host+'. Got response: '+result.data);
				}
			});
		}
	} else {
		console.log('[ERROR]\t\tneeoBrain_sensor_notify('+adapterName+', '+capabilitieName+', '+value+')');
	}
}

module.exports.shutdownAllRecipes = function (){
	//const neeoBrains = Homey.ManagerSettings.get( 'neeoBrains' );
	for (const neeoBrain of neeoBrains){
		tools.httpRequest({ hostname: neeoBrain.host,	port: 3000,	path: '/v1/api/Recipes', method: 'GET', headers: {'Content-Type': 'application/json'}},	null,	(res, recipies)=>{
			if (typeof recipies !== 'undefined'){
				recipies = JSON.parse(recipies);
				for (const recipie of recipies) {
					if (recipie.isPoweredOn === true){
						console.log  ('[RECIPE]\tPowering off '+recipie.detail.devicename);
						const url=require('url');
						const a = url.parse(recipie.url.setPowerOff);
						tools.httpGetAndForget('GET', a.hostname, a.port, a.pathname);
					}
				}
			}
		});
	} 
}

module.exports.isRecipeActive = function (brainHostname, roomKey, recipeKey) {
	return httpmin.json('http://'+brainHostname+':3000/v1/projects/home/rooms/'+roomKey+'/recipes/'+recipeKey+'/isactive').then(result => {
		return result.active;
	});
}

module.exports.executeRecipe = function (brainIp, roomKey, recipeKey) {
	tools.httpGetAndForget('GET', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/recipes/'+recipeKey+'/execute');
}

module.exports.commandButton = function (brainIp, roomKey, deviceKey, capabilitieKey){
	tools.httpGetAndForget('GET', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/devices/'+deviceKey+'/macros/'+capabilitieKey+'/trigger');
}

module.exports.commandSwitch = function (brainIp, roomKey, deviceKey, capabilitieKey, value){
	tools.httpGetAndForget('PUT', brainIp, 3000, '/v1/projects/home/rooms/'+roomKey+'/devices/'+deviceKey+'/switches/'+capabilitieKey+'/'+value);
}

module.exports.commandSlider = function (brainIp, roomKey, deviceKey, capabilitieKey, value){
	tools.httpGetAndForget('PUT', brainIp, 3000, '/v1/projects/home/rooms/' + roomKey + '/devices/' + deviceKey + '/sliders/' + capabilitieKey, {value: value});
}

function blinkLed(brainIp, times){
	tools.httpGetAndForget('GET', brainIp, 3000, '/v1/systeminfo/identbrain');
	times--;
	if (times > 0){
		setTimeout(blinkLed, 2000, brainIp, times);
	}
}
module.exports.blinkLed = blinkLed;