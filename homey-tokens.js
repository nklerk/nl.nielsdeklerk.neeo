'use strict'

const tools = require('./tools');


function set (adapterName, capabilityName, tokenValue){
    capabilityName = capabilityName.replace(/(_SENSOR)/gm,""); 
	const tokenId = adapterName+capabilityName;
	const tokenName = tools.stringNormalizeName(capabilityName + '('+adapterName+')');
	const tokenType = typeof tokenValue;
	Homey.log ('[HOMEY TOKEN]\tSet'+ tokenName+' -> '+ tokenValue);
    Homey.manager('flow').unregisterToken(tokenId);
	Homey.manager('flow').registerToken(tokenId, { type: tokenType, title: tokenName}, (err, token) => {
		if (err) return console.error('registerToken error:', err);
		token.setValue(tokenValue, (err) => {
			if (err) return console.error('setValue error:', err);
		});
	});
}
module.exports.set = set;


module.exports.setAll = function () {
	const devices = Homey.manager('settings').get('myDevices');
	if (typeof devices === object) {
		for (const device of devices) {
			for (const capabilitie of device.capabilities) {
				if (capabilitie.type === 'sensor' && capabilitie.sensor.value){
					set(device.name, capabilitie.name, capabilitie.sensor.value);
				}
			}
		}
	}
}
