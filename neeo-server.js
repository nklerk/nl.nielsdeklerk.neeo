'use strict'

const neeoRequests = require('./neeo-requests');
const neeoEvents = require('./neeo-events');
const neeoBrain = require('./neeo-brain');
const http = require('http');
const TCP_PORT = 6336;


const neeoServer = http.createServer((req, res) => {
	let responseData = {code: 200, type: { 'Content-Type': 'application/json' }};
	const uriparts = decodeURI(req.url).split('/');
	if (req.method == 'GET') {
		if (uriparts[1] === 'db') {
			responseData = neeoRequests.db(uriparts[2]);
		} else if (uriparts[1] === 'device') { 
			responseData = neeoRequests.device(uriparts[2],uriparts[3],uriparts[5]);
		} else if (uriparts[2] === 'subscribe') {
			responseData = neeoRequests.subscribe(uriparts, req.connection.remoteAddress);
		} else if (uriparts[2] === 'unsubscribe') {
			responseData = neeoRequests.unsubscribe(uriparts, req.connection.remoteAddress);
		} else if (uriparts[2] === 'capabilities') {
			responseData = neeoRequests.capabilities(uriparts);
		} else {
			responseData = neeoRequests.unknown(uriparts);
		};
		res.writeHead(responseData.code, responseData.type);
    	res.end(responseData.content);
	} else if (req.method == 'POST') {
        let body = '';
        req.on('data', function (data) { body += data; });
        req.on('end', function () {
			 if (uriparts[1] === 'Homey-By-Niels_de_Klerk') {	
				responseData = neeoEvents.handle(body);
				res.writeHead(responseData.code, responseData.type);
    			res.end(responseData.content);
			};
		}); 
	}
});


neeoServer.listen(TCP_PORT, function() {
	Homey.log (' NEEO Service running on port: ' + TCP_PORT );
	Homey.log ('-------------------------------------------------');
	neeoBrain.connect();
});