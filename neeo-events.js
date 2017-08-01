'use strict'

module.exports.handle = function (body){
	let responseData = {'code': 200,'Type': {'Content-Type': 'application/json'}, 'content': ''};
	const myjson = JSON.parse(body);
	Homey.log ("[EVENTS]\tNeeo Event received: " + body);
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
	return (responseData)
}