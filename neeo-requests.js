'use strict'
const neeoDatabase = require('./neeo-database');
const homeyTokens = require('./homey-tokens');
const neeoBrain = require('./neeo-brain');
const tools = require('./tools');


module.exports.db = function db(request){
	let responseData = {
		code: 200,
		Type: {'Content-Type': 'application/json'},
		content: ''
	};
	console.log('[DATABASE]\tReceived request: '+request);
	if (typeof request === 'string' && request.substr(0,9) === 'search?q=') {
		const queery = request.replace('search?q=','');
		const founddevices = neeoDatabase.deviceSearch(queery);
		responseData.content = JSON.stringify(founddevices);
	} else { 
		const founddevice = neeoDatabase.deviceById(request);
		responseData.content = JSON.stringify(founddevice);
	}
	return (responseData);
}


module.exports.device = function device(deviceName, deviceFunction, deviceParameter){
	let responseData = {
		code: 200,
		type: {'Content-Type': 'application/json'},
		content: ''
	};
	const capabilitie = neeoDatabase.capabilitie(deviceName, deviceFunction);
	if (!capabilitie.type){
		capabilitie.type = 'error';
	}
	if (capabilitie.type === 'sensor') { 
		responseData.content = JSON.stringify({value: capabilitie.sensor.value});
		console.log ('[SENSOR]\tReceived request for sensor: ' + deviceName + ', ' + deviceFunction + '.  Responded: ' + capabilitie.sensor.value);
	}
	else if (capabilitie.type === 'button') {
		console.log ('[EVENTS]\tButton pressed: ' + deviceName + ', ' + deviceFunction + '.');
		Homey.manager('flow').trigger( 'button_pressed', {}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){
			if( err ) return Homey.error(err);
		});
	}
	else if (capabilitie.type === 'slider') {
		console.log ('[EVENTS]\tSlider state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		deviceParameter = parseInt(deviceParameter, 10);
		const decimalvalue = tools.mathRound(deviceParameter / capabilitie.slider.range[1],2);
		neeoBrain.notifyStateChange(deviceName, deviceFunction + '_SENSOR', deviceParameter, () => { });
		homeyTokens.set(deviceName, deviceFunction, deviceParameter, () => { });
		Homey.manager('flow').trigger( 'slider_changed', {'value': deviceParameter, 'decimalvalue': decimalvalue}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){
			if( err ) return console.log (err); 
		});
		responseData.content = neeoDatabase.capabilitieSetValue(deviceName, deviceFunction, deviceParameter)
	}
	else if (capabilitie.type === 'switch') {
		console.log ('[EVENTS]\tSwitch state changed: ' + deviceName + ', ' + deviceFunction + '.  Value: ' + deviceParameter);
		if (deviceParameter === 'true') { deviceParameter = true}
		if (deviceParameter === 'false') { deviceParameter = false} 
		Homey.manager('flow').trigger( 'switch_changed', {'value': deviceParameter}, {'adapterName': deviceName, 'capabilitie': deviceFunction}, function(err, result){ 
			if( err ) return Homey.error(err);
		});
		homeyTokens.set(deviceName, deviceFunction, deviceParameter);
		neeoBrain.notifyStateChange(deviceName, deviceFunction + '_SENSOR', deviceParameter)
		responseData.content = neeoDatabase.capabilitieSetValue(deviceName, deviceFunction, deviceParameter)
	}
	else {
		console.log (" !! Warning !!");
		console.log (" The folowing request isn't expected:");
		console.log (" - Device:      " + deviceName);
		console.log (" - Function:    " + deviceFunction);
		console.log (" - Value:       " + deviceParameter);
		responseData.code = 400
	}
	return (responseData);
}


module.exports.subscribe = function subscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '');
	console.log ("[NOTIFICATIONS]\tRequest for subscription from: " +  brainIP);
	const responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (responseData);
}


module.exports.unsubscribe = function unsubscribe(uriparts, brainIP){
	brainIP = brainIP.replace(/^.*:/, '');
	console.log ("[NOTIFICATIONS]\tRequest for unsubscription from: " +  brainIP);
	const responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': '{"success":true}'};
	return (responseData);
}


module.exports.capabilities = function capabilities(uriparts){
	let responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const founddevice = neeoDatabase.deviceByAdaptername(uriparts[1]);
	responseData.content = JSON.stringify(founddevice.capabilities);
	return (responseData);
}


module.exports.unknown = function unknown(uriparts){
	console.log ('[ERROR]\tRECEIVED UNKNOWN REQUEST.');
	console.log (uriparts);
	const responseData = {'code': 500,'Type': {'Content-Type': 'application/json'}, 'content': {'error': 'Unknown request.'}};
	return (responseData);
}