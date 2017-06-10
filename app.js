/* global Homey */
////////////////////////////////////////
// CODE
////////////////////////////////////////
'use strict'
const http = require('http');

const NEEO_LOGGING = true;
const NEEO_SERVER_PORT = 6336;
const NEEO_CONNECT_INTERVAL= 60000;	//1 Min
const NEEO_RECONNECT_INTERVAL = 900000;	//15 Min

let neeoConnectionTries = 0;

const neeoBrain_sdk = http.createServer((req, res) => {
	let response_data = {code: 200, type: { 'Content-Type': 'application/json' }};
	const uriparts = decodeURI(req.url).split('/');

	if (req.method == 'GET') {
		//What kind of request is comming in?
		if (uriparts[1] === 'db') {	
			response_data = neeoBrain_request_db(uriparts[2]);
		} else if (uriparts[1] === 'device') { 
			response_data = neeoBrain_request_device(uriparts[2],uriparts[3],uriparts[5]);
		} else if (uriparts[2] === 'subscribe') {
			response_data = neeoBrain_request_subscribe(uriparts, req.connection.remoteAddress);
		} else if (uriparts[2] === 'capabilities') {
			response_data = neeoBrain_request_capabilities(uriparts);
		} else {
			response_data = neeoBrain_request_unknown(uriparts);
		};

		res.writeHead(response_data.code, response_data.type);
    	res.end(response_data.content);

	} else if (req.method == 'POST') {
        let body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
			 if (uriparts[1] === 'Homey-By-Niels_de_Klerk') {	
				response_data = neeoBrain_posts_event(body);
				res.writeHead(response_data.code, response_data.type);
    			res.end(response_data.content);
			};
		}); 
	}
});

neeoBrain_sdk.listen(NEEO_SERVER_PORT, function() {
	tools_log (' NEEO Service running on port: ' + NEEO_SERVER_PORT );										//Start the server and listen on the NEEO Default port NEEO_SERVER_PORT.
	tools_log ('-------------------------------------------------');
	neeoBrain_connect();
	test();
});

function test() {
	//Used for fast debugging.
}

////////////////////////////////////////
// Exports.
////////////////////////////////////////

module.exports = {
	api_neeo_discover: function(callback) {
		neeoBrain_discover();
	},
	init: init()
};

////////////////////////////////////////
// Functions NEEO Brain
////////////////////////////////////////

function neeoBrain_request_db(request){
	let response_data = {
		code: 200,
		Type: {'Content-Type': 'application/json'},
		content: ''
	};
	tools_log('[DATABASE]\tReceived request: '+request);
	if (typeof request === 'string' && request.substr(0,9) === 'search?q=') {
		const queery = request.replace('search?q=','');
		const founddevices = database_device_search(queery);
		response_data.content = JSON.stringify(founddevices);
	} else { 
		const founddevice = database_device_getbyid(request);
		response_data.content = JSON.stringify(founddevice);
	}

	return (response_data);
} // NEEO request database for devices.

function neeoBrain_request_device(deviceName, deviceFunction, deviceParameter){

	let responseData = {
		code: 200,
		type: {'Content-Type': 'application/json'},
		content: ''
	};

	const capabilitie = database_capabilitie_get(deviceName, deviceFunction);
	if (!capabilitie.type){
		capabilitie.type = 'error';
	}

	if (capabilitie.type === 'sensor') { 
		responseData.content = JSON.stringify({value: capabilitie.sensor.value});
		tools_log ('[SENSOR]\tReceived request for sensor: ' + deviceName + ', ' + deviceFunction + '.  Responded: ' + capabilitie.sensor.value);
	}
	else if (capabilitie.type === 'button') {
		tools_log ('[EVENTS]\tButton pressed: ' + deviceName + ', ' + deviceFunction + '.');
		Homey.manager('flow').trigger( 'button_pressed', {}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){
			if( err ) return Homey.error(err);
		});
	}
	else if (capabilitie.type === 'slider') {
		tools_log ('[EVENTS]\tSlider state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		deviceParameter = parseInt(deviceParameter, 10); // Make sure its an integer
		const decimalvalue = tools_math_round(deviceParameter / capabilitie.slider.range[1],2);
		neeoBrain_sensor_notify(deviceName, deviceFunction + '_SENSOR', deviceParameter, () => { });
		homey_system_token_set(deviceName, deviceFunction, deviceParameter, () => { });
		Homey.manager('flow').trigger( 'slider_changed', {'value': deviceParameter, 'decimalvalue': decimalvalue}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){
			if( err ) return tools_log (err); 
		});
		responseData.content = database_capabilitie_setvalue(deviceName, deviceFunction, deviceParameter)
	}
	else if (capabilitie.type === 'switch') {
		tools_log ('[EVENTS]\tSwitch state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		if (deviceParameter === 'true') { deviceParameter = true}
		if (deviceParameter === 'false') { deviceParameter = false} 
		Homey.manager('flow').trigger( 'switch_changed', {'value': deviceParameter}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){ 
			if( err ) return Homey.error(err);
		});
		homey_system_token_set(deviceName, deviceFunction, deviceParameter);
		neeoBrain_sensor_notify(deviceName, deviceFunction + '_SENSOR', deviceParameter)
		responseData.content = database_capabilitie_setvalue(deviceName, deviceFunction, deviceParameter)
	}
	else {
		tools_log (" !! Warning !!");
		tools_log (" The folowing request isn't expected:");
		tools_log (" - Device:      " + deviceName);
		tools_log (" - Function:    " + deviceFunction);
		tools_log (" - Value:       " + deviceParameter);
		responseData.code = 400
	}
	return (responseData);
} // neeoBrain request a device function.

function neeoBrain_request_subscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '')
	tools_log ("[NOTIFICATIONS]\tRequest for subscription from: " +  brainIP);
	/*
	const devicename = uriparts[1];
	const eventregister = uriparts[3];
	const deviceid = uriparts[4];

	const options = {
		hostname: brainIP,
		port: 3000,
		path: '/v1/api/notificationkey/Homey_Devicedatabase_' + tools_ip_getlocalip() + '/' + devicename + '/' + eventregister,
		method: 'GET',
		headers: {'Content-Type': 'application/json'}
	};
	
	const req = http.request(options, function(res) {
		res.setEncoding('utf8');
		let body = '';
		res.on('data', function (data) { body += data; });
		res.on('end', function () {
			const eventregisters = JSON.parse(body)
			neeoBrain_request_subscribe_registereventserver(eventregisters, devicename, brainIP)
		});
	});

	req.end();
	*/
	const response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (response_data);

} // NEEO brain subscription.
/*
function neeoBrain_request_subscribe_registereventserver(eventregisters, devicename, brainIP) {
	const devices = database_devices();

	for (const eventregister of eventregisters){
		const newEventServer = {ip: brainIP, eventKey: eventregister.eventKey};
		tools_log ('[NOTIFICATIONS]\tReceived registration request: '+eventregister.eventKey+' From: '+brainIP);

		let y = -1;
		let z = -1;
		const x = devices.findIndex((find => find.adapterName === devicename));
		if (x !== -1) {
			y = devices[x].capabilities.findIndex((find => find.name === eventregister.name + "_SENSOR"));
		} 
		if (y !== -1) {
			if (devices[x].capabilities[y].eventservers) {
				z = devices[x].capabilities[y].eventservers.findIndex((find => find.eventKey === eventregister.eventKey));
				if (z === -1){
					devices[x].capabilities[y].eventservers.push(newEventServer);
					tools_log ("[NOTIFICATIONS]\tRegistered and added eventserver: " + newEventServer);
				} else {
					tools_log ("[NOTIFICATIONS]\tEventserver allready existed " + newEventServer);
				}
			} else {
				devices[x].capabilities[y].eventservers = [newEventServer];
				tools_log ("[NOTIFICATIONS]\tRegistered eventserver: [" + newEventServer + ']');
			}
		} else {
			tools_log ("[NOTIFICATIONS]\tERROR: Can't find device: " + devicename + ', with Sensor:' + eventregister.name + "_SENSOR");
		}
		Homey.manager('settings').set('myDevices', devices);
	}
} // Register events the neeo brain requested to be updated on.
*/

function neeoBrain_request_capabilities(uriparts){
	let response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const founddevice = database_getdevice_byadaptername(uriparts[1]);
	response_data.content = JSON.stringify(founddevice.capabilities);
	return (response_data);
} // function to handle request for capabilities

function neeoBrain_request_unknown(uriparts){
	tools_log ('[ERROR]\tRECEIVED UNKNOWN REQUEST.');
	tools_log (uriparts);
	const response_data = {'code': 500,'Type': {'Content-Type': 'application/json'}, 'content': {'error': 'Unknown request.'}};
	return (response_data);
} // function to handle unknown requests

function neeoBrain_posts_event(body){
	let response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const myjson = JSON.parse(body);
	tools_log ("[EVENTS]\tNeeo Event received: " + body);
	let action = "", device = "", room = "", actionparameter = "";
				
	if (myjson.action){
		action = myjson.action;
	};
	if (myjson.actionparameter){
		actionparameter = myjson.actionparameter.toString();
	};
	if (myjson.recipe){
		device = myjson.recipe;
	};
	if (myjson.device){
		device = myjson.device;
	};
	if (myjson.room){
		room = myjson.room;
	};
			
	Homey.manager('flow').trigger('received_event', { Action: action, Device: device, Room: room, Parameter: actionparameter, Json: body});
	return (response_data)
} // function to handle events.

function neeoBrain_discover() {
	
	tools_log ("[SERVER]\tSearching for NEEO brains... MUST.... EAT..... BRAINS .....!!!");
	const mdns = require('mdns-js');
	//if you have another mdns daemon running, like avahi or bonjour, uncomment following line
	mdns.excludeInterface('0.0.0.0');
	let browser = mdns.createBrowser('_neeo._tcp');
	
	browser.on('ready', function () {
		browser.discover(); 
	});

	
	browser.on('update', function (data) {
		neeoBrain_Add_to_db(data);
	});

} // Discovery service

function neeoBrain_Add_to_db(foundbrain) {
	let neeoBrains = Homey.manager('settings').get( 'neeoBrains');
	if (!neeoBrains) {
		neeoBrains = [];
	}

	let exist = 0;
	for (const i in neeoBrains) {
		if (neeoBrains[i].host === foundbrain.host) {
			tools_log('[SERVER]\tUpdating settings: '+foundbrain.host);
			neeoBrains[i].ip = foundbrain.addresses;
			exist = exist + 1;
		};
	}
	if (exist === 0) {
		tools_log('[SERVER]\tNew NEEO Brain found: '+foundbrain.host);
		const neeoBrain = {host: foundbrain.host, ip: foundbrain.addresses};
		neeoBrains.push(neeoBrain);

		neeoBrain_register_devicedatabase(neeoBrain);
		neeoBrain_register_forwarderevents(neeoBrain);
		neeoBrain_configuration_download(neeoBrain);
	}
	Homey.manager('settings').set('neeoBrains', neeoBrains);
} // Adding the discovered brains to the DB (and update existing brains.)

function neeoBrain_connect(){
	const neeoBrains = Homey.manager('settings').get( 'neeoBrains');
	if (!neeoBrains && neeoConnectionTries < 10) {
		neeoBrain_discover();
		setTimeout(neeoBrain_connect, NEEO_CONNECT_INTERVAL);
        neeoConnectionTries++;
	} else {
		for (let neeoBrain of neeoBrains) {
			tools_log('[SERVER]\tConnecting: '+neeoBrain.host+' ('+neeoBrain.ip+')');
			neeoBrain_register_devicedatabase(neeoBrain);
			neeoBrain_register_forwarderevents(neeoBrain);
			neeoBrain_configuration_download(neeoBrain);
			homey_system_token_set_all();
		}
	}
	setTimeout(neeoBrain_connect, NEEO_RECONNECT_INTERVAL); // 10 minutes Delay
} // Connection process to all neeo brains.

function neeoBrain_register_devicedatabase(neeoBrain) {
	tools_log ('[DRIVER]\t'+neeoBrain.host+', Registering Homey as NEEO device server...');
	const registration = {
		name: 'Homey_Devicedatabase_' + tools_ip_getlocalip(), 
		baseUrl: 'http://'+tools_ip_getlocalip()+':'+NEEO_SERVER_PORT
	};
	
	const options = {
		hostname: neeoBrain.host,
		port: 3000,
		path: '/v1/api/registerSdkDeviceAdapter',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};

	const req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			try {
				let reply = JSON.parse(body)
				if (reply.success === true){
					tools_log ('[DRIVER]\t' + neeoBrain.host + ', Registration succesfull.');
				}
			} catch(e) {	}
		});
	});

	req.on('error', function(e) { tools_log ('[DRIVER]\t' + neeoBrain.host + ', Registration error: ' + e.message); });
	req.write(JSON.stringify(registration));
	req.end();
	req.on('end', () => { req = undefined;});

} // Register Homey as Device database in NEEO

function neeoBrain_register_forwarderevents(neeoBrain){
	tools_log ('[EVENTS]\t' + neeoBrain.host + ', Registering Homey as NEEO events receiver...');

	const registration = {
		host: tools_ip_getlocalip(),
		port: NEEO_SERVER_PORT,
		path: '/Homey-By-Niels_de_Klerk'
	};

	const options = {
		hostname: neeoBrain.host,
		port: 3000,
		path: '/v1/forwardactions',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};

	const req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			try{
				let reply = JSON.parse(body)
				if (reply.success === true){
					tools_log ('[EVENTS]\t' + neeoBrain.host + ', Registration succesfull.');
				}
			} catch(e) {
				tools_log ('[EVENTS]\tERROR: ' + neeoBrain.host + ', Registration unsuccesfull!');
			}
		});
	});
	
	req.on('error', function(e) { tools_log ('[EVENTS]\t' + neeoBrain.host + ', Registration error: ' + e.message); });
	req.write(JSON.stringify(registration)); //{"host":"10.2.1.8","port":3000,"path":"/BrainLivingroom"}
	req.end();
	req.on('end', () => { req = undefined;});
} // Register as event server in NEEO. (Configuring settings, Neeo Brain, Forward events.)

function neeoBrain_configuration_download(neeoBrainQ){
	Homey.manager('settings').set('downloading', true);
	let neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
	if (neeoBrains !== undefined && neeoBrains.length !== 0) {
		for (let neeoBrain of neeoBrains) {
			if (!neeoBrainQ || neeoBrain.host === neeoBrainQ.host) {

				tools_log ('[DATABASE]\t' + neeoBrain.host + ', Downloading configuration...');

				const options = {
					hostname: neeoBrain.host,
					port: 3000,
					path: '/v1/projects/home',
					method: 'GET',
					headers: {'Content-Type': 'application/json'}
				};
				
				const req = http.request(options, function(res) {
					
					res.setEncoding('utf8');
					
					let receivedData = '';
					res.on('data', function (body) {
						receivedData = receivedData + body;
					});
					
					res.on('end', function () {
						tools_log ('[DATABASE]\t' + neeoBrain.host + ', Download complete.');
						let brainConfiguration = JSON.parse(receivedData);
						neeoBrain.brainConfiguration = brainConfiguration;
						Homey.manager('settings').set('neeoBrains', neeoBrains);
						database_updateEventRegisters();
						//Update Event registers.
					});
				});
				req.on('error', function(e) { tools_log ('[DATABASE] ' + neeoBrain.host + ', Download error: ' + e.message); });
				req.end();
				req.on('end', () => { req = undefined;});
			}
		}
		
	}
	Homey.manager('settings').set('downloading', false);
} // Download configuration (JSON) from neeo brain

function database_updateEventRegisters (){
	let devices = Homey.manager('settings').get('myDevices');

	for (const a in devices) {
		const device = devices[a];
		for (const b in device.capabilities){
			const capabilitie = device.capabilities[b];
			if (capabilitie.type === 'sensor'){
				tools_log('[DATABASE]\tUpdating Event registers of '+device.name+' sensor: '+capabilitie.label);
				devices[a].capabilities[b].eventservers = neeoBrain_findEventservers(device.adapterName, capabilitie.name);
			}
		}
	}
	Homey.manager('settings').set('myDevices', devices);
}

function neeoBrain_findEventservers(adapterName, capabilities_name){
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
								const foundEventregister = {
									host: neeoBrain.host,
									eventKey: sensor.eventKey
								}
								foundEventregisters.push(foundEventregister);
							}
						}
					}
				}
			}
		}
	}
	//rooms."room".devices."Device".details.adaptername === homey_Homey_10 
	return foundEventregisters;
}

function neeoBrain_sensor_notify(adapterName, capabilities_name, value){
	const capabilitie = database_capabilitie_get(adapterName, capabilities_name)

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

			neeoBrain_sensor_notify_send(options, content, function(){	});
			
		}
	} else {
		tools_log('[ERROR]\t\tneeoBrain_sensor_notify('+adapterName+', '+capabilities_name+', '+value+')');
	}
} // update sensor
function neeoBrain_sensor_notify_send(options, content, callback){
	const req = http.request(options, (res) => {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			let reply = JSON.parse(body)
			if (reply.success === true){
				tools_log ('[NOTIFICATIONS]\tSuccesfully sent notification with value ' + content.data + ' to eventkey ' + content.type + ' @' + options.hostname);
			}
		});
	});

	req.on('error', function(e) { tools_log ('[NOTIFICATIONS]\tProblem with request: ' + e.message); });
	req.write(JSON.stringify(content));
	req.end();
	req.on('end', () => { 
		callback();
	});
}

////////////////////////////////////////
// Functions Tools
////////////////////////////////////////

function tools_math_round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
} // round a number on x decimals

function tools_ip_getlocalip() {
  const interfaces = require('os').networkInterfaces();
  for (const iA in interfaces) {
    const iface = interfaces[iA];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
} // Get local IPaddress

function tools_http_get_forget(method, host, port, path, content){
	const options = {
		hostname: host,
		port: port,
		path: path,
		method: method,
		headers: {'Content-Type': 'application/json'}
	};	
	const req = http.request(options, function(res) {
		let receivedData = '';
		res.setEncoding('utf8');
		res.on('data', function (body) {
			//ZZZzzzzz...
		});
		res.on('end', function () {
			//ZZZzzzzz...
		});
	});
	req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
	if (content) {req.write(JSON.stringify(content));}
	req.end();
	req.on('end', () => { req = undefined;});
} // Download configuration (JSON) from neeo brain

function tools_http_json (method, host, port, path, content, callback){
	let response_data = "";
	const options = {
		hostname: host,
		port: port,
		path: path,
		method: method,
		headers: {'Content-Type': 'application/json'}
	};	
	const req = http.request(options, function(res) {
		let receivedData = '';
		res.setEncoding('utf8');
		res.on('data', function (body) {
			response_data = response_data + body;
		});
		res.on('end', function () {
			callback(res, response_data);
		});
	});
	req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
	if (content) {req.write(JSON.stringify(content));}
	req.end();
	req.on('end', () => { req = undefined;});
} // Download configuration (JSON) from neeo brain

function tools_string_cleanformatch(textstring){
	textstring = textstring.toLowerCase();
	textstring = textstring.replace(/(\s|\t| |,|\(|\))/gm,""); 
	return(textstring);
} // Clean a string so it can be better matched

function tools_string_normalizename(textstring){
	textstring = textstring.toString();
	const t1 = textstring.substring(0,1).toUpperCase();
	const t2 = textstring.substring(1,textstring.length).toLowerCase();
	return t1 + t2;
}

function tools_log(Logging){
	if (NEEO_LOGGING === true){
		Homey.log (Logging);
	}
}

////////////////////////////////////////
// Functions Homey
////////////////////////////////////////

function homey_system_token_set(adapterName, capabilities_name, token_value){
	//args.capabilitie.name + '('+args.device.name+')'
    capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,""); 
	const token_id = adapterName+capabilities_name;
	const token_name = tools_string_normalizename(capabilities_name + '('+adapterName+')');
	const token_type = typeof token_value;

	tools_log ('[HOMEY TOKEN]\tSet'+ token_name+' -> '+ token_value);
	Homey.manager('flow').unregisterToken(token_id);

	Homey.manager('flow').registerToken(token_id, {
		type: token_type, 
		title: token_name
	}, (err, token) => {
		if (err) return console.error('registerToken error:', err);
		token.setValue(token_value, (err) => {
			if (err) return console.error('setValue error:', err);
		});
	});
} // setting a token (named tag in Homey)

function homey_system_token_set_all(){
	const devices = Homey.manager('settings').get('myDevices');
	for (const device of devices) {
		for (const capabilitie of device.capabilities) {
			if (capabilitie.type === 'sensor' && capabilitie.sensor.value){
				homey_system_token_set(device.name, capabilitie.name, capabilitie.sensor.value);
			}
		}
	}
} // setting a token (named tag in Homey)

function flow_capabilitie_autocomplete_filter(args, type){
	const query = tools_string_cleanformatch(args.query); 
	const devices = Homey.manager('settings').get('myDevices');
	let foundcapa = [];
	for (const device of devices) {
		if (device.adapterName == args.args.device.adapterName){
			for (const capabilitie of device.capabilities) {
				const capabilitieQ = tools_string_cleanformatch(capabilitie.label)
				if (capabilitieQ.indexOf(query) !== -1 ) {
					if (capabilitie.sensor && capabilitie.sensor.type === type || capabilitie.type == type){ //capabilitie.eventservers && 
						foundcapa.push({name: capabilitie.label, realname: capabilitie.name})
					}
				}
			}
		}
	}
	return(foundcapa);
} // Return all and only capabilities that have a match. (for selection on homey card)

function flow_devices_autocomplete_filter(query){
	query = tools_string_cleanformatch(query)
	const devices = Homey.manager('settings').get('myDevices');
	let founddevices = [];
	for (const device of devices) {
		const deviceQ = tools_string_cleanformatch(device.manufacturer + device.name);
		if (deviceQ.indexOf(query) !== -1 ) {
			const item = {
				name: device.manufacturer+", "+device.name,
				adapterName: device.adapterName
			};
			founddevices.push(item);
		}
	}
	//Device return opmaak
	return founddevices;
} // Return all and only devices that have a match. (for selection on homey card)

function flow_brain_rooms_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = tools_string_cleanformatch(args.query)

	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let foundrooms = [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			const roomQ = tools_string_cleanformatch(room.name);
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
} // Return rooms

function flow_brain_devices_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	let founddevices = [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.devices) {
					const device = room.devices[i];
					const deviceQ = tools_string_cleanformatch(device.name);
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
} // Return all and only devices that have a match. (for selection on homey card)

function flow_brain_macros_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
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
							const macroQ = tools_string_cleanformatch(macro.name);
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
} // 

function flow_brain_sliders_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = tools_string_cleanformatch(args.query)
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
							const sliderQ = tools_string_cleanformatch(slider.name);
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
}; //  

function flow_brain_switches_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = (args.query)
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
							const switchQ = tools_string_cleanformatch(switche.name);
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
} //  

function flow_brain_recepies_autocomplete_filter(args, stype){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	const query = tools_string_cleanformatch(args.query)
	const neeoBrains = Homey.manager('settings').get('neeoBrains');
	
	let foundrecipes = [];
	for (const neeoBrain of neeoBrains) {
		for (const i in neeoBrain.brainConfiguration.rooms) {
			const room = neeoBrain.brainConfiguration.rooms[i];
			if (room.key === args.args.room.key) {
				for (const i in room.recipes) {
					const recipe = room.recipes[i];
					const recipeQ = tools_string_cleanformatch(recipe.name);
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
	//Device return opmaak
	return foundrecipes;
} // Return all and only devices that have a match. (for selection on homey card)


////////////////////////////////////////
// Functions Database
////////////////////////////////////////

function database_devices () {
    return Homey.manager('settings').get('myDevices');
}

function database_device_search(queery){
	const queeries = queery.split(" ");
	const devices = database_devices();
	let founddevices = [];
	tools_log('[DATABASE]\tGot queery for: ' +queery);
	for (const device of devices) {
		let score = 0;
		let maxScore = 2;

		for (const queery of queeries) {
			if (device.name.toLowerCase().indexOf(queery.toLowerCase()) 			!== -1 ) {maxScore = maxScore + queery.length; }
			if (device.manufacturer.toLowerCase().indexOf(queery.toLowerCase()) 	!== -1 ) {maxScore = maxScore + queery.length; }
		}
		
		if (maxScore > 4) {
			tools_log ('[DATABASE]\tReturned driver: "' + device.manufacturer + " " + device.name + '"  With score: ' + maxScore);
			
			let fdevice = {
				item: device,
				score,
				maxScore
			};

			founddevices.push(fdevice)
		}
	}
	//Device return opmaak
	return founddevices;
} // When NEEO is searching for a device in the homey device database this function is called.

function database_device_getbyid(id){
	return database_devices().find((devices) => devices.id == id);
} // Request a device in the database by ID. (way of NEEO to get device configuratipon)

function database_getdevice_byadaptername(adapterName){
	const devices = database_devices();

	for (const device of devices) {
		if (device.adapterName == adapterName) {
			return device;

		}
	}
	return;
} // NEEO requests capabilities of adapter

function database_capabilitie_setvalue(adapterName, capabilities_name, newvalue){
	const devices = database_devices();
	capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,"");  
	for (let z in devices) {
		if (devices[z].adapterName == adapterName) {
			for (let y in devices[z].capabilities) {
				if (devices[z].capabilities[y].type ==='sensor' && devices[z].capabilities[y].name === capabilities_name + "_SENSOR") {
					tools_log ('[DATABASE]\tUpdating database from old Value: ' + devices[z].capabilities[y].sensor.value + ' to new value: ' + newvalue);
					devices[z].capabilities[y].sensor.value = newvalue;
				}
			}
		}
	}
	Homey.manager('settings').set('myDevices', devices);
	let response = '{"success":true}';
	return response;
} // set a value

function database_capabilitie_get(adapterName, capabilitieName){
	const devices = database_devices();
	let response = {}
	for (const device of devices) {
		if (device.adapterName == adapterName) {
			for (const capabilitie of device.capabilities) {
				if (capabilitie.name == capabilitieName) {
					return capabilitie
				}
			}
		}
	}
	return {};
} // return a specific capabilitie of a deviceadapter.



////////////////////////////////////////
// Functions for Homey Flows
////////////////////////////////////////

function init() { 
	
//Triggers
	//button_pressed
	Homey.manager('flow').on('trigger.button_pressed.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	}); // Flow,Button dropdown / autocomplete
	Homey.manager('flow').on('trigger.button_pressed.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "button")
		callback(null, capabilities);
	}); // Flow,Button dropdown / autocomplete
	Homey.manager('flow').on('trigger.button_pressed', function (callback, args, state) {
		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
            tools_log ('[HOMEY] \tA flow is triggered by card "button_pressed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
        callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters

	//switch_changed
	Homey.manager('flow').on('trigger.switch_changed.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('trigger.switch_changed.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "switch")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('trigger.switch_changed', function (callback, args, state) {
 		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
            tools_log ('[HOMEY] \tA flow is triggered by card "switch_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
        callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters

	//slider_changed
	Homey.manager('flow').on('trigger.slider_changed.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('trigger.slider_changed.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('trigger.slider_changed', function (callback, args, state) {
 		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
			tools_log ('[HOMEY] \tA flow is triggered by card "slider_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
		callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters


// Actions
	//activate_recipe
	Homey.manager('flow').on('action.activate_recipe.room.autocomplete', function( callback, args ){
		let rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.activate_recipe.recipe.autocomplete', function( callback, args ){
		let recipes = flow_brain_recepies_autocomplete_filter(args, 'launch');
		callback(null, recipes);
	});
	Homey.manager('flow').on('action.activate_recipe', function (callback, args, state) {
		tools_log ('  + Activating recipe ' + args.recipe.name + '.'); 
		tools_http_get_forget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/recipes/' + args.recipe.key + '/execute');
		callback( null, true ); 
    });

	//poweroff_recipe
	Homey.manager('flow').on('action.poweroff_recipe.room.autocomplete', function( callback, args ){
		let rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.poweroff_recipe.recipe.autocomplete', function( callback, args ){
		let scenario = flow_brain_recepies_autocomplete_filter(args, 'poweroff')
		callback(null, scenario);
	});
	Homey.manager('flow').on('action.poweroff_recipe', function (callback, args, state) {
		tools_log ('  + Powering off recipe ' + args.recipe.name + '.'); 
		tools_http_get_forget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/recipes/' + args.recipe.key + '/execute')
		callback( null, true ); 
    });

	//Poweroff_all
	Homey.manager('flow').on('action.poweroff_all_recipes', function (callback) {
		tools_log ('+ Powering off all recipes.'); 
		const neeoBrains = Homey.manager('settings').get( 'neeoBrains' );
		for (const neeoBrain of neeoBrains){
			tools_http_json ('GET', neeoBrain.host, 3000, '/v1/api/Recipes', null, function(res, recipies){
				if (typeof recipies !== 'undefined'){
					recipies = JSON.parse(recipies);
					const url=require('url');
					for (const recipie of recipies) {
						if (recipie.isPoweredOn === true){
							tools_log (' - Powering off '+recipie.detail.devicename)
							const a = url.parse(recipie.url.setPowerOff)
							tools_http_get_forget('GET', a.hostname, a.port, a.pathname)
						}
					}
				}
				callback( null, true );
			});
		} 
    });

	//command_button
	Homey.manager('flow').on('action.command_button.room.autocomplete', function( callback, args ){
		let rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.command_button.device.autocomplete', function( callback, args ){
		let devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_button.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_brain_macros_autocomplete_filter(args)
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_button', function (callback, args, state) {
		tools_log ('  + Pressing the "' + args.capabilitie.name + '" button of ' + args.device.name); 
		tools_http_get_forget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/macros/' + args.capabilitie.key + '/trigger');
		callback( null, true ); 
    });

	//command_switch
	Homey.manager('flow').on('action.command_switch.room.autocomplete', function( callback, args ){
		let rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});	
	Homey.manager('flow').on('action.command_switch.device.autocomplete', function( callback, args ){
		let devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_switch.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_brain_switches_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_switch', function (callback, args, state) {
		tools_log ('  + Flip switch "' + args.capabilitie.name + '" of ' + args.device.name); 
		tools_http_get_forget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/switches/' + args.capabilitie.key + '/' + args.value);
		callback( null, true ); 
    });

	//command_slider
	Homey.manager('flow').on('action.command_slider.room.autocomplete', function( callback, args ){
		let rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.command_slider.device.autocomplete', function( callback, args ){
		let devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_slider.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_brain_sliders_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_slider', function (callback, args, state) {
		tools_log ('  + Dragging slider "' + args.capabilitie.name + '" of ' + args.device.name + ' to ' + args.value); 
		tools_http_get_forget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/sliders/' + args.capabilitie.key, {value: args.value});
		callback( null, true ); 
    });

	//inform_slider
	Homey.manager('flow').on('action.inform_slider.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_slider.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "range")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_slider', function (callback, args, state) {
		tools_log ('[HOMEY FLOW]\taction.inform_slider');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_slider_value
	Homey.manager('flow').on('action.inform_slider_value.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_slider_value.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "range")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_slider_value', function (callback, args, state) {
		tools_log ('[HOMEY FLOW]\taction.inform_slider_value');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_switch
	Homey.manager('flow').on('action.inform_switch.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_switch.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "binary")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_switch', function (callback, args, state) {
		tools_log ('[HOMEY FLOW]\taction.inform_switch');
		if (args.value === "true") {args.value = true};
		if (args.value === "false") {args.value = false};
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value)
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_switch
	Homey.manager('flow').on('action.inform_textlabel.device.autocomplete', function( callback, args ){
		let devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_textlabel.capabilitie.autocomplete', function( callback, args ){
		let capabilities = flow_capabilitie_autocomplete_filter(args, "custom")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_textlabel', function (callback, args, state) {
		tools_log ('[HOMEY FLOW]\taction.inform_textlabel');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });
}





