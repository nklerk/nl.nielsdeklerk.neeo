'use strict'


module.exports.mathRound = function (value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}


module.exports.getLocalIp = function() {
  const interfaces = require('os').networkInterfaces();
  for (const iA in interfaces) {
    const iface = interfaces[iA];
    for (const alias of iface) {
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
        return alias.address;
    }
  }
  return '0.0.0.0';
}

module.exports.httpGetAndForget = function (method, host, port, path, content){
	httpRequest({hostname: host, port: port, path: path, method: method, headers: {'Content-Type': 'application/json'}}, content);
}

function httpRequest(options, content, callback){
	let responseData = '';
	const http = require('http');
	const req = http.request(options, function(response) {
		response.setEncoding('utf8');
		response.on('data', (body) => {
			responseData = responseData + body;
		});
		response.on('end', () => {
			if (callback) {
				callback(response, responseData);
			}
		});
	});
	req.on('error', (e) => { 
		Homey.log ('problem with request: ' + e.message); 
	});
	if (content) {
		req.write(JSON.stringify(content));
	}
	req.end();
	req.on('end', () => { 
		req = undefined;
	});
}
module.exports.httpRequest = httpRequest;


module.exports.stringCleanForMatch = function (textstring){
	textstring = textstring.toLowerCase();
	textstring = textstring.replace(/(\s|\t| |,|\(|\))/gm,""); 
	return(textstring);
}

module.exports.stringNormalizeName = function (textstring){
	textstring = textstring.toString();
	const t1 = textstring.substring(0,1).toUpperCase();
	const t2 = textstring.substring(1,textstring.length).toLowerCase();
	return t1 + t2;
}

module.exports.stringToBoolean = function (textstring){
	if (textstring === "true") {textstring = true};
	if (textstring === "false") {textstring = false};
	return textstring;
}