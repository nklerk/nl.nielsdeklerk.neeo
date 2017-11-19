'use strict'
const Homey = require('homey');

module.exports.handle = function (body, clientIP){
	let responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const myjson = JSON.parse(body);
	console.log ("[EVENTS]\tNeeo Event received: " + body);
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
	let neeoReceivedEvent = new Homey.FlowCardTrigger('received_event');
	neeoReceivedEvent.register().trigger('received_event', { Action: action, Device: device, Room: room, Parameter: actionparameter, Json: body}).then(() => {}).catch( err => {});
	return (responseData)
}