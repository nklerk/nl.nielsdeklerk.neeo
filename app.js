/* global Homey */
////////////////////////////////////////
// CODE
////////////////////////////////////////
'use strict'
const http = require('http');
const logging = true;


const neeoBrain_sdk = http.createServer(function(req, res){
	var response_data = {};
	var uriparts = decodeURI(req.url).split('/');
	if (req.method == 'GET') {
		//What kind of request is comming in?
		if 		(uriparts[1] === 'db') {						response_data = neeoBrain_request_db(uriparts);}
		else if (uriparts[1] === 'device') { 					response_data = neeoBrain_request_device(uriparts);} 
		else if (uriparts[2] === 'subscribe') {					response_data = neeoBrain_request_subscribe(uriparts, req.connection.remoteAddress);}
		else if (uriparts[2] === 'capabilities') {				response_data = neeoBrain_request_capabilities(uriparts);}
		else {													response_data = neeoBrain_request_unknown(uriparts);};
		res.writeHead(response_data.code, response_data.type);
    	res.end(response_data.content);

	} else if (req.method == 'POST') {
        var body = '';
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

neeoBrain_sdk.listen(6336, function() {
	tools_log (' NEEO SDK running on port: 6336' );										//Start the server and listen on the NEEO Default port 6336.
	neeoBrain_connect(0);
});


////////////////////////////////////////
// API
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

function neeoBrain_request_db(uriparts){
	var response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	
	if (uriparts[2].substr(0,9) === 'search?q=') {
		var queery = uriparts[2].replace('search?q=','');
		var founddevices = database_device_search(queery);
		response_data.content = JSON.stringify(founddevices);
	} else { 
		var founddevice = database_device_getbyid(uriparts[2]);
		response_data.content = JSON.stringify(founddevice);
	}

	return (response_data);
} // NEEO request database for devices.

function neeoBrain_request_device(uriparts){
	var devicename = uriparts[2];
	var devicefunction = uriparts[3];
	var deviceparameter = uriparts[5];
	var response_data = {'code': 200,'type': {'Content-Type': 'application/json'}, 'content': ''};
	var capabilitie = database_capabilitie_get(devicename, devicefunction);

	if (capabilitie.type === 'sensor') { 
		response_data.content = JSON.stringify({value: capabilitie.sensor.value});
		tools_log ('  - Received request for sensor: ' + devicename + ', ' + devicefunction + '.  Responded: ' + capabilitie.sensor.value);
	}
	else if (capabilitie.type === 'button') {
		tools_log ('  - Received event for button: ' + devicename + ', ' + devicefunction + '.');
		Homey.manager('flow').trigger( 'button_pressed', {}, {'adapterName': devicename, 'capabilitie': devicefunction}, function(err, result){
			if( err ) return Homey.error(err);
		});
	}
	else if (capabilitie.type === 'slider') {
		tools_log ('  - Received event for slider: ' + devicename + ', ' + devicefunction + '.  Value: ' + deviceparameter);
		deviceparameter = parseInt(deviceparameter, 10); // Make sure its an integer
		var decimalvalue = tools_math_round(deviceparameter / capabilitie.slider.range[1],2);
		Homey.manager('flow').trigger( 'slider_changed', {'value': deviceparameter, 'decimalvalue': decimalvalue}, {'adapterName': devicename, 'capabilitie': devicefunction}, function(err, result){
			if( err ) return tools_log (err); 
		});
		homey_system_token_set(devicename, devicefunction, deviceparameter);
		neeoBrain_sensor_notify(devicename, devicefunction + '_SENSOR', deviceparameter)
		response_data.content = database_capabilitie_setvalue(devicename, devicefunction, deviceparameter)
	}
	else if (capabilitie.type === 'switch') {
		tools_log ('  - Received event for switch: ' + devicename + ', ' + devicefunction + '.  Value: ' + deviceparameter);
		if (deviceparameter === 'true') { deviceparameter = true}
		if (deviceparameter === 'false') { deviceparameter = false} 
		Homey.manager('flow').trigger( 'switch_changed', {'value': deviceparameter}, {'adapterName': devicename, 'capabilitie': devicefunction}, function(err, result){ 
			if( err ) return Homey.error(err);
		});
		homey_system_token_set(devicename, devicefunction, deviceparameter);
		neeoBrain_sensor_notify(devicename, devicefunction + '_SENSOR', deviceparameter)
		response_data.content = database_capabilitie_setvalue(devicename, devicefunction, deviceparameter)
	}
	else {
		tools_log (" !! Warning !!");
		tools_log (" The folowing request isn't expected:");
		tools_log (" - Device:      " + devicename);
		tools_log (" - Function:    " + devicefunction);
		tools_log (" - Value:       " + deviceparameter);
		response_data.code = 400
	}
	return (response_data);
} // neeobrain request a device function.

function neeoBrain_request_subscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '')
	tools_log (" - Request for subscription from: " +  brainIP);
	var devicename = uriparts[1];
	var eventregister = uriparts[3];

	var options = {
		hostname: brainIP,
		port: 3000,
		path: '/v1/api/notificationkey/Homey_Devicedatabase_' + tools_ip_getlocalip() + '/' + devicename + '/' + eventregister,
		method: 'GET',
		headers: {'Content-Type': 'application/json'}
	};
	
	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		var body = '';
		res.on('data', function (data) { body += data; });
		res.on('end', function () {
			var eventregisters = JSON.parse(body)
			neeoBrain_request_subscribe_registereventserver(eventregisters, devicename, brainIP)
		});
	});

	req.end();

	var response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (response_data);
} // NEEO brain subscription.

function neeoBrain_request_subscribe_registereventserver(eventregisters, devicename, brainIP) {
	var devices = Homey.manager('settings').get('myDevices');
	for (var i in eventregisters){
		var eventregister = eventregisters[i];
		for (var z in devices) {
			if (devices[z].adapterName == devicename) {
				for (var y in devices[z].capabilities) {
					if (devices[z].capabilities[y].name == eventregister.name + "_SENSOR") {
						var eventcount = 0;
						for ( var x in devices[z].capabilities[y].eventservers){
							var eventserver = devices[z].capabilities[y].eventservers[x];
							if (eventserver.ip === brainIP && eventserver.eventKey === eventregister.eventKey){eventcount += 1;}
						}
						if (eventcount === 0) {
							var eventserver = {};
							eventserver.ip = brainIP;
							eventserver.eventKey = eventregister.eventKey;
							tools_log ("Registering EventServer: " + eventserver.ip + '  eventKey:' + eventserver.eventKey)
							if (devices[z].capabilities[y].eventservers === undefined) {
								devices[z].capabilities[y].eventservers = [eventserver];
							} else {
								devices[z].capabilities[y].eventservers.push(eventserver);
							}
						}
					}
				}
			}
		}
		Homey.manager('settings').set('myDevices', devices);
	}
} // Register events the neeo brain requested to be updated on.

function neeoBrain_request_capabilities(uriparts){
	var response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	var founddevice = database_getdevice_byadaptername(uriparts[1]);
	response_data.content = JSON.stringify(founddevice.capabilities);
	return (response_data);
} // function to handle request for capabilities

function neeoBrain_request_unknown(uriparts){
	var response_data = {'code': 500,'Type': {'Content-Type': 'application/json'}, 'content': {'error': 'Unknown request.'}};
	return (response_data);
} // function to handle unknown requests

function neeoBrain_posts_event(body){
	var response_data = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	var myjson = JSON.parse(body);
	tools_log ("  = Neeo Event received: " + body);
	var action = "", device = "", room = "", actionparameter = "";
				
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
	
	tools_log (" Searching for NEEO brains... MUST.... EAT..... BRAINS .....!!!");
	var mdns = require('mdns-js');
	//if you have another mdns daemon running, like avahi or bonjour, uncomment following line
	mdns.excludeInterface('0.0.0.0');
	var browser = mdns.createBrowser('_neeo._tcp');
	
	browser.on('ready', function () {
		browser.discover(); 
	});

	
	browser.on('update', function (data) {
		neeoBrain_Add_to_db(data);
	});

} // Discovery service

function neeoBrain_Add_to_db(foundbrain) {
	var NEEOs = Homey.manager('settings').get( 'myNEEOs');
	if (!NEEOs) {
		NEEOs = [];
	}

	var exist = 0;
	for (var i in NEEOs) {
		if (NEEOs[i].host === foundbrain.host) {
			console.log(' Updating settings of '+foundbrain.host);
			NEEOs[i].ip = foundbrain.addresses;
			exist = exist + 1;
		};
	}
	if (exist === 0) {
		console.log(' New NEEO Brain found: ' + foundbrain.host);
		var brain = {};
		brain.host = foundbrain.host;
		brain.ip = foundbrain.addresses;
		NEEOs.push(brain);
	}
	Homey.manager('settings').set('myNEEOs', NEEOs);
} // Adding the discovered brains to the DB (and update existing brains.)

function neeoBrain_connect(connectiontries){
	if (typeof connectiontries === 'undefined') {connectiontries=0;};
	var NEEOs = Homey.manager('settings').get( 'myNEEOs');
	if ((NEEOs === undefined || NEEOs.length === 0) && connectiontries < 10) {
		connectiontries = connectiontries + 1;
		neeoBrain_discover();
		setTimeout(neeoBrain_connect, 60000, connectiontries);
	} else {
		for (var i in NEEOs) {
			var NEEOBrain = NEEOs[i];
			tools_log (' NEEO brain [' + i + ']: ' + NEEOBrain.host + '(' + NEEOBrain.ip + ')');
			neeoBrain_register_devicedatabase(NEEOBrain);
			neeoBrain_register_forwarderevents(NEEOBrain);
			neeoBrain_configuration_download(NEEOBrain);
			homey_system_token_set_all();
		}
	}
	setTimeout(neeoBrain_connect, 600000); // 10 minutes Delay
} // Connection process to all neeo brains.

function neeoBrain_register_devicedatabase(NEEOBrain) {
	tools_log (' Registering Homey as a device server to NEEO @' + NEEOBrain.host + '.');
	var registration = {}
	registration.name = 'Homey_Devicedatabase_' + tools_ip_getlocalip();
	registration.baseUrl = 'http://' + tools_ip_getlocalip() + ':6336'
	
	var options = {
		hostname: NEEOBrain.host,
		port: 3000,
		path: '/v1/api/registerSdkDeviceAdapter',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			try {
				var reply = JSON.parse(body)
				if (reply.success === true){
					tools_log (' Homey database server is succesfully registerd @' + NEEOBrain.host + '.');
				}
			} catch(e) {	}
		});
	});

	req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
	req.write(JSON.stringify(registration));
	req.end();
} // Register Homey as Device database in NEEO

function neeoBrain_register_forwarderevents(NEEOBrain){
	tools_log (' Registering Homey as event server @' + NEEOBrain.host + '.');

	var registration = {}
	registration.host = tools_ip_getlocalip();
	registration.port = 6336;
	registration.path = "/Homey-By-Niels_de_Klerk"

	var options = {
		hostname: NEEOBrain.host,
		port: 3000,
		path: '/v1/forwardactions',
		method: 'POST',
		headers: {'Content-Type': 'application/json'}
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
			var reply = JSON.parse(body)
			if (reply.success === true){
				tools_log (' Homey event server is succesfully registerd @' + NEEOBrain.host + '.');
			}
		});
	});
	
	req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
	req.write(JSON.stringify(registration)); //{"host":"10.2.1.8","port":3000,"path":"/BrainLivingroom"}
	req.end();
} // Register as event server in NEEO. (Configuring settings, Neeo Brain, Forward events.)

function neeoBrain_configuration_download(NEEOBrain){
	Homey.manager('settings').set('downloading', true);
	var NEEOs = Homey.manager('settings').get( 'myNEEOs' );
	if (NEEOs === undefined || NEEOs.length === 0) {
		// No NEEO Brains? Must eat brains. must eat brains.....
		//neeoBrain_discover();
	} else {
		for (var i in NEEOs) {
			if (!NEEOBrain || NEEOBrain.host === NEEOs[i].host) {

				tools_log (' Downloading Configuration @' + NEEOs[i].host + '.');

				var options = {
					hostname: NEEOs[i].host,
					port: 3000,
					path: '/v1/projects/home',
					method: 'GET',
					headers: {'Content-Type': 'application/json'}
				};
				
				var req = http.request(options, function(res) {
					
					res.setEncoding('utf8');
					
					var receivedData = '';
					res.on('data', function (body) {
						receivedData = receivedData + body;
					});
					
					res.on('end', function () {
						tools_log (' Downloading Configuration @' + NEEOs[i].host + ' complete.');
						var brainConfiguration = JSON.parse(receivedData);
						NEEOs[i].brainConfiguration = brainConfiguration;
					});
				});
				req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
				req.end();
			}
		}
		Homey.manager('settings').set('myNEEOs', NEEOs);
	}
	Homey.manager('settings').set('downloading', false);
} // Download configuration (JSON) from neeo brain

function neeoBrain_sensor_notify(adapterName, capabilities_name, value){
	var capabilitie = database_capabilitie_get(adapterName, capabilities_name)
	for (var i in capabilitie.eventservers) {
		var eventserver = capabilitie.eventservers[i];
		var content = { type: eventserver.eventKey, data: value};
		var options = {	hostname: eventserver.ip, port: 3000, path: '/v1/notifications', method: 'POST', headers: {'Content-Type': 'application/json'}};

		var req = http.request(options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (body) {
				var reply = JSON.parse(body)
				if (reply.success === true){
					tools_log ('  o succesfully sent notification with value ' + value + ' to eventkey ' + eventserver.eventKey + ' @' + eventserver.ip);
				}
			});
		});

		req.on('error', function(e) { tools_log ('problem with request: ' + e.message); });
		req.write(JSON.stringify(content));
		req.end();
	}
} // update sensor


////////////////////////////////////////
// Functions Tools
////////////////////////////////////////

function tools_math_round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
} // round a number on x decimals

function tools_ip_getlocalip() {
  var interfaces = require('os').networkInterfaces();
  for (var devName in interfaces) {
    var iface = interfaces[devName];
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }

  return '0.0.0.0';
} // Get local IPaddress

function tools_http_get_forget(method, host, port, path, content){
	var options = {
		hostname: host,
		port: port,
		path: path,
		method: method,
		headers: {'Content-Type': 'application/json'}
	};	
	var req = http.request(options, function(res) {
		var receivedData = '';
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
} // Download configuration (JSON) from neeo brain

function tools_http_json (method, host, port, path, content, callback){
	var response_data = "";
	var options = {
		hostname: host,
		port: port,
		path: path,
		method: method,
		headers: {'Content-Type': 'application/json'}
	};	
	var req = http.request(options, function(res) {
		var receivedData = '';
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
} // Download configuration (JSON) from neeo brain

function tools_string_cleanformatch(textstring){
	textstring = textstring.toLowerCase();
	textstring = textstring.replace(/(\s|\t| |,|\(|\))/gm,""); 
	return(textstring);
} // Clean a string so it can be better matched

function tools_string_normalizename(textstring){
	textstring = textstring.toString();
	var t1 = textstring.substring(0,1).toUpperCase();
	var t2 = textstring.substring(1,textstring.length).toLowerCase();
	return t1 + t2;
}


////////////////////////////////////////
// Functions Homey
////////////////////////////////////////

function homey_system_token_set(adapterName, capabilities_name, token_value){
	//args.capabilitie.name + '('+args.device.name+')'
    capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,""); 
	var token_id = adapterName+capabilities_name;
	var token_name = capabilities_name + '('+adapterName+')';
	token_name = tools_string_normalizename(token_name);
	var token_type = typeof token_value;

	Homey.manager('flow').unregisterToken(token_id);

	Homey.manager('flow').registerToken(token_id, {
		type: token_type, 
		title: token_name
	}, function (err, token) {
		if (err) return console.error('registerToken error:', err);
		token.setValue(token_value, function (err) {
			if (err) return console.error('setValue error:', err);
		});
	});
} // setting a token (named tag in Homey)

function homey_system_token_set_all(){
	var devices = Homey.manager('settings').get('myDevices');
	for (var z in devices) {
		for (var y in devices[z].capabilities) {
			if (devices[z].capabilities[y].type === 'sensor' && devices[z].capabilities[y].sensor.value){
				homey_system_token_set(devices[z].name, devices[z].capabilities[y].name, devices[z].capabilities[y].sensor.value);
			}
		}
	}
} // setting a token (named tag in Homey)

function flow_capabilitie_autocomplete_filter(args, type){
	var query = tools_string_cleanformatch(args.query); 
	var devices = Homey.manager('settings').get('myDevices');
	var foundcapa = [];
	for (var z in devices) {
		if (devices[z].adapterName == args.args.device.adapterName){
			for (var y in devices[z].capabilities) {
				var tmp = tools_string_cleanformatch(devices[z].capabilities[y].label)
				if (tmp.indexOf(query) !== -1 ) {
					if (devices[z].capabilities[y].eventservers && devices[z].capabilities[y].sensor && devices[z].capabilities[y].sensor.type === type || devices[z].capabilities[y].type == type){
						foundcapa.push({name: devices[z].capabilities[y].label,realname: devices[z].capabilities[y].name})
					}
				}
			}
		}
	}
	return(foundcapa);
} // Return all and only capabilities that have a match. (for selection on homey card)

function flow_devices_autocomplete_filter(query){
	query = tools_string_cleanformatch(query)
	var devices = Homey.manager('settings').get('myDevices');
	var founddevices = [];
	for (var z in devices) {
		var dev = tools_string_cleanformatch(devices[z].manufacturer + devices[z].name);
		if (dev.indexOf(query) !== -1 ) {
			var item = {};
			item.name = devices[z].manufacturer + ", " + devices[z].name;
			item.adapterName = devices[z].adapterName;
			founddevices.push(item);
		}
	}
	//Device return opmaak
	return founddevices;
} // Return all and only devices that have a match. (for selection on homey card)

function flow_brain_rooms_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	var query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var foundrooms = [];
	for (var z in NEEOs) {
		for (var x in NEEOs[z].brainConfiguration.rooms) {
			var ro = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[x].name);
			if (ro.indexOf(query) !== -1) {
				var item = {};
				item.name = NEEOs[z].brainConfiguration.rooms[x].name;
				item.key = NEEOs[z].brainConfiguration.rooms[x].key;
				item.brainip = NEEOs[z].host;
				foundrooms.push(item);
			}
		}
	}
	return foundrooms;
} // Return rooms

function flow_brain_devices_autocomplete_filter(args){
	if (Homey.manager('settings').get('downloading') != true) {neeoBrain_configuration_download();}
	var query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var founddevices = [];
	for (var z in NEEOs) {
		for (var y in NEEOs[z].brainConfiguration.rooms) {
			if (NEEOs[z].brainConfiguration.rooms[y].key === args.args.room.key) {
				for (var x in NEEOs[z].brainConfiguration.rooms[y].devices) {
					var de = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[y].devices[x].name);
					if (de.indexOf(query) !== -1) {
						var item = {};
						item.name = NEEOs[z].brainConfiguration.rooms[y].devices[x].name;
						item.key = NEEOs[z].brainConfiguration.rooms[y].devices[x].key;
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
	var query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var foundmacros= [];
	for (var z in NEEOs) {
		for (var y in NEEOs[z].brainConfiguration.rooms) {
			if (NEEOs[z].brainConfiguration.rooms[y].key === args.args.room.key) {
				for (var x in NEEOs[z].brainConfiguration.rooms[y].devices) {
					if (NEEOs[z].brainConfiguration.rooms[y].devices[x].key === args.args.device.key) {
						for (var w in NEEOs[z].brainConfiguration.rooms[y].devices[x].macros) {
							var ma = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[y].devices[x].macros[w].name);
							if (ma.indexOf(query) !== -1) {
								var item = {};
								item.name = NEEOs[z].brainConfiguration.rooms[y].devices[x].macros[w].name;
								item.key = NEEOs[z].brainConfiguration.rooms[y].devices[x].macros[w].key;
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
	var query = tools_string_cleanformatch(args.query)
	//tools_log ("DEBUG: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var foundsliders= [];
	for (var z in NEEOs) {
		for (var y in NEEOs[z].brainConfiguration.rooms) {
			if (NEEOs[z].brainConfiguration.rooms[y].key === args.args.room.key) {
				for (var x in NEEOs[z].brainConfiguration.rooms[y].devices) {
					if (NEEOs[z].brainConfiguration.rooms[y].devices[x].key === args.args.device.key) {
						for (var w in NEEOs[z].brainConfiguration.rooms[y].devices[x].sliders) {
							var sl = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[y].devices[x].sliders[w].name);
							if (sl.indexOf(query) !== -1) {
								var item = {};
								item.name = NEEOs[z].brainConfiguration.rooms[y].devices[x].sliders[w].name;
								item.key = NEEOs[z].brainConfiguration.rooms[y].devices[x].sliders[w].key;
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
	var query = (args.query)
	//tools_log ("DEBUG: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var foundswitches= [];
	for (var z in NEEOs) {
		for (var y in NEEOs[z].brainConfiguration.rooms) {
			if (NEEOs[z].brainConfiguration.rooms[y].key === args.args.room.key) {
				for (var x in NEEOs[z].brainConfiguration.rooms[y].devices) {
					if (NEEOs[z].brainConfiguration.rooms[y].devices[x].key === args.args.device.key) {
						for (var w in NEEOs[z].brainConfiguration.rooms[y].devices[x].switches) {
							var sw = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[y].devices[x].switches[w].name);
							if (sw.indexOf(query) !== -1) {
								var item = {};
								item.name = NEEOs[z].brainConfiguration.rooms[y].devices[x].switches[w].name;
								item.key = NEEOs[z].brainConfiguration.rooms[y].devices[x].switches[w].key;
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
	var query = tools_string_cleanformatch(args.query)
	console.log(" User searching for: " + query)
	var NEEOs = Homey.manager('settings').get('myNEEOs');
	var foundrecipes = [];
	for (var z in NEEOs) {
		for (var y in NEEOs[z].brainConfiguration.rooms) {
			if (NEEOs[z].brainConfiguration.rooms[y].key === args.args.room.key) {
				for (var x in NEEOs[z].brainConfiguration.rooms[y].recipes) {
					var recipe = tools_string_cleanformatch(NEEOs[z].brainConfiguration.rooms[y].recipes[x].name);
					if (recipe.indexOf(query) !== -1 && NEEOs[z].brainConfiguration.rooms[y].recipes[x].type == stype) {
						var item = {};
						item.name = NEEOs[z].brainConfiguration.rooms[y].recipes[x].name;
						item.key = NEEOs[z].brainConfiguration.rooms[y].recipes[x].key;
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

function database_device_search(queery){
	var queeries = queery.split(" ");
	var devices = Homey.manager('settings').get('myDevices');
	var founddevices = [];

	for (var z in devices) {
		var score = 0;
		var maxScore = 2;

		for (var y in queeries) {
			if (devices[z].name.toLowerCase().indexOf(queeries[y].toLowerCase()) 			!== -1 ) {maxScore = maxScore + queeries[y].length; }
			if (devices[z].manufacturer.toLowerCase().indexOf(queeries[y].toLowerCase()) 	!== -1 ) {maxScore = maxScore + queeries[y].length; }
		}
		
		if (maxScore > 4) {
			tools_log (' - Selected driver: "' + devices[z].manufacturer + " " + devices[z].name + '"  With score: ' + maxScore);
			var fdevice = {};
			fdevice.item = devices[z];
			fdevice.score = score;
			fdevice.maxScore = maxScore;
			founddevices.push(fdevice)
		}
	}
	//Device return opmaak
	return founddevices;
} // When NEEO is searching for a device in the homey device database this function is called.

function database_device_getbyid(dbid){
	var devices = Homey.manager('settings').get('myDevices');
	var founddevice = {};
	for (var z in devices) {
		if (devices[z].id == dbid) {
			founddevice = devices[z]
		}
	}
	return founddevice;
} // Request a device in the database by ID. (way of NEEO to get device configuratipon)

function database_getdevice_byadaptername(adapterName){
	var devices = Homey.manager('settings').get('myDevices');
	var founddevice = {};

	for (var z in devices) {
		if (devices[z].adapterName == adapterName) {
			founddevice = devices[z]
		}
	}
	return founddevice;
} // NEEO requests capabilities of adapter

function database_capabilitie_setvalue(adapterName, capabilities_name, newvalue){
	var devices = Homey.manager('settings').get('myDevices');
	capabilities_name = capabilities_name.replace(/(_SENSOR)/gm,"");  
	for (var z in devices) {
		if (devices[z].adapterName == adapterName) {
			for (var y in devices[z].capabilities) {
				if (devices[z].capabilities[y].type ==='sensor' && devices[z].capabilities[y].name === capabilities_name + "_SENSOR") {
					tools_log ('  ~ Updating database from old Value: ' + devices[z].capabilities[y].sensor.value + ' to new value: ' + newvalue);
					devices[z].capabilities[y].sensor.value = newvalue;
				}
			}
		}
	}
	Homey.manager('settings').set('myDevices', devices);
	var response = '{"success":true}';
	return response;
} // set a value

function database_capabilitie_get(adapterName, capabilities_name){
	var devices = Homey.manager('settings').get('myDevices');
	var response = {}
	for (var z in devices) {
		if (devices[z].adapterName == adapterName) {
			for (var y in devices[z].capabilities) {
				if (devices[z].capabilities[y].name == capabilities_name) {
					response = devices[z].capabilities[y]
				}
			}
		}
	}
	return response;
} // return a specific capabilitie of a deviceadapter.

function tools_log(Logging){
	if (logging === true){
		Homey.log (Logging);
		//Homey.manager('flow').trigger('log_event', { log: Logging});
	}
}

////////////////////////////////////////
// Functions for Homey Flows
////////////////////////////////////////

function init() { 
//Triggers
	//button_pressed
	Homey.manager('flow').on('trigger.button_pressed.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	}); // Flow,Button dropdown / autocomplete
	Homey.manager('flow').on('trigger.button_pressed.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "button")
		callback(null, capabilities);
	}); // Flow,Button dropdown / autocomplete
	Homey.manager('flow').on('trigger.button_pressed', function (callback, args, state) {
		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
            tools_log ('  + A flow is triggered by card "button_pressed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
        callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters

	//switch_changed
	Homey.manager('flow').on('trigger.switch_changed.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('trigger.switch_changed.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "switch")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('trigger.switch_changed', function (callback, args, state) {
 		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
            tools_log ('  + A flow is triggered by card "switch_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
        callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters

	//slider_changed
	Homey.manager('flow').on('trigger.slider_changed.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('trigger.slider_changed.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('trigger.slider_changed', function (callback, args, state) {
 		if (args.device.adapterName === state.adapterName && args.capabilitie.realname === state.capabilitie) {
			tools_log ('  + A flow is triggered by card "slider_changed" with args: ' + state.adapterName + ', ' + state.capabilitie + '.');
			callback(null, true); // true to make the flow continue, or false to abort
            return;
        }
		callback(null, false); // true to make the flow continue, or false to abort
    }); // Matching defined flow parameters with event parameters


// Actions
	//activate_recipe
	Homey.manager('flow').on('action.activate_recipe.room.autocomplete', function( callback, args ){
		var rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.activate_recipe.recipe.autocomplete', function( callback, args ){
		var recipes = flow_brain_recepies_autocomplete_filter(args, 'launch');
		callback(null, recipes);
	});
	Homey.manager('flow').on('action.activate_recipe', function (callback, args, state) {
		tools_log ('  + Activating recipe ' + args.recipe.name + '.'); 
		tools_http_get_forget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/recipes/' + args.recipe.key + '/execute');
		callback( null, true ); 
    });

	//poweroff_recipe
	Homey.manager('flow').on('action.poweroff_recipe.room.autocomplete', function( callback, args ){
		var rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.poweroff_recipe.recipe.autocomplete', function( callback, args ){
		var scenario = flow_brain_recepies_autocomplete_filter(args, 'poweroff')
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
		var NEEOs = Homey.manager('settings').get( 'myNEEOs' );
		for (var i in NEEOs){
			tools_http_json ('GET', NEEOs[i].host, 3000, '/v1/api/Recipes', null, function(res, recipies){
				if (typeof recipies !== 'undefined'){
					recipies = JSON.parse(recipies);
					var url=require('url');
					for (var x in recipies) {
						if (recipies[x].isPoweredOn === true){
							tools_log (' - Powering off '+recipies[x].detail.devicename)
							var a = url.parse(recipies[x].url.setPowerOff)
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
		var rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.command_button.device.autocomplete', function( callback, args ){
		var devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_button.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_brain_macros_autocomplete_filter(args)
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_button', function (callback, args, state) {
		tools_log ('  + Pressing the "' + args.capabilitie.name + '" button of ' + args.device.name); 
		tools_http_get_forget('GET', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/macros/' + args.capabilitie.key + '/trigger');
		callback( null, true ); 
    });

	//command_switch
	Homey.manager('flow').on('action.command_switch.room.autocomplete', function( callback, args ){
		var rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});	
	Homey.manager('flow').on('action.command_switch.device.autocomplete', function( callback, args ){
		var devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_switch.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_brain_switches_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_switch', function (callback, args, state) {
		tools_log ('  + Flip switch "' + args.capabilitie.name + '" of ' + args.device.name); 
		tools_http_get_forget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/switches/' + args.capabilitie.key + '/' + args.value);
		callback( null, true ); 
    });

	//command_slider
	Homey.manager('flow').on('action.command_slider.room.autocomplete', function( callback, args ){
		var rooms = flow_brain_rooms_autocomplete_filter(args)
		callback(null, rooms);
	});
	Homey.manager('flow').on('action.command_slider.device.autocomplete', function( callback, args ){
		var devices = flow_brain_devices_autocomplete_filter(args)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.command_slider.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_brain_sliders_autocomplete_filter(args, "slider")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.command_slider', function (callback, args, state) {
		tools_log ('  + Dragging slider "' + args.capabilitie.name + '" of ' + args.device.name + ' to ' + args.value); 
		tools_http_get_forget('PUT', args.room.brainip, 3000, '/v1/projects/home/rooms/' + args.room.key + '/devices/' + args.device.key + '/sliders/' + args.capabilitie.key, {value: args.value});
		callback( null, true ); 
    });

	//inform_slider
	Homey.manager('flow').on('action.inform_slider.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_slider.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "range")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_slider', function (callback, args, state) {
		tools_log ('Flow event: action.inform_slider');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_slider_value
	Homey.manager('flow').on('action.inform_slider_value.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_slider_value.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "range")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_slider_value', function (callback, args, state) {
		tools_log ('Flow event: action.inform_slider_value');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_switch
	Homey.manager('flow').on('action.inform_switch.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_switch.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "binary")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_switch', function (callback, args, state) {
		tools_log ('Flow event: action.inform_switch');
		if (args.value === "true") {args.value = true};
		if (args.value === "false") {args.value = false};
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value)
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });

	//inform_switch
	Homey.manager('flow').on('action.inform_textlabel.device.autocomplete', function( callback, args ){
		var devices = flow_devices_autocomplete_filter(args.query)
		callback(null, devices);
	});
	Homey.manager('flow').on('action.inform_textlabel.capabilitie.autocomplete', function( callback, args ){
		var capabilities = flow_capabilitie_autocomplete_filter(args, "custom")
		callback(null, capabilities);
	});
	Homey.manager('flow').on('action.inform_textlabel', function (callback, args, state) {
		tools_log ('Flow event: action.inform_textlabel');
		neeoBrain_sensor_notify(args.device.adapterName, args.capabilitie.realname, args.value);
		database_capabilitie_setvalue(args.device.adapterName, args.capabilitie.realname, args.value);
		homey_system_token_set(args.device.name, args.capabilitie.name, args.value);	
		callback( null, true ); 
    });
}





