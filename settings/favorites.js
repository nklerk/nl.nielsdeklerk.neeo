let dd = "";

let brainIP = location.search.split('BrainIP=')[1];
console.log (brainIP);

function goBack() {
	window.history.back();
}

function connect() {
	//let brainIP = document.getElementById("brainIP").value;
	document.getElementById("Favorites").innerHTML = '<h1>Connecting to ' + brainIP + '...</h1>';
	connectBrain(brainIP);
}
function connectBrain(brainIP) {
	fetch('http://' + brainIP + ':3000/v1/projects/home/rooms/').then(response => response.json()).then((configRooms) => {
		findFavorites(configRooms);
	}).catch(err => {
		document.getElementById("Favorites").innerHTML = "<h1>Can't connect to " + brainIP + "...</h1>";
		throw err
	});
}
function cl(cl) {
	console.log(cl);
}
function findFavorites(configRooms) {
	dd = "";
	for (let i in configRooms) {
		let room = configRooms[i];
		for (let j in room.devices) {
			let device = room.devices[j];
			if (Object.keys(device.favorites).length > 0) {
				printFavorites(device);
			}
		}
	}
	if (!dd == "") {
		document.getElementById("Favorites").innerHTML = dd;
	} else {
		document.getElementById("Favorites").innerHTML = '<h1>This brain does not have any favorites configured...</h1>';
	}
}
function printFavorites(device) {
	dd = dd + '<div class="fieldrowh"><h1>' + device.name + '</h1></div>'
	for (let i in device.favorites) {
		let favorite = device.favorites[i];
		dd = dd + '<div class="fieldrow"><div class="imgbox">';
		dd = dd + '<span class="iconhelper"></span>';
		dd = dd + '<img class="icon" src="' + favorite.channel.logoUrl + '" id="' + device.roomKey + 'a' + device.key + 'b' + i + '"></div>';
		dd = dd + '<label class="channellabel">' + favorite.channel.name + '</label>';
		dd = dd + '<input class="urlinput" id="' + device.roomKey + 'x' + device.key + 'y' + i + '" type="text" value="' + favorite.channel.logoUrl + '"/>';
		dd = dd + '<button class="setbutt" onclick="seturl(\'' + i + '\', \'' + device.roomKey + '\', \'' + device.key + '\')" ><i></i>Update</button>';
		dd = dd + '</div>';
	}
}
function seturl(id, roomKey, deviceKey) {
	let url = 'http://' + document.getElementById("brainIP").value + ':3000/v1/projects/home/rooms/' + roomKey + '/devices/' + deviceKey + '/favorites/';
	fetch(url).then(response => response.json()).then((favorites) => {
		favorite = favorites[id];
		let logoUrl = document.getElementById(roomKey + 'x' + deviceKey + 'y' + id).value;
		favorite.channel.logoUrl = logoUrl;
		let content = JSON.stringify(favorite);
		let http = new XMLHttpRequest();
		let purl = 'http://' + document.getElementById("brainIP").value + ':3000/v1/projects/home/rooms/' + roomKey + '/devices/' + deviceKey + '/favorites/' + id;
		http.open("POST", purl, true);
		http.setRequestHeader("Content-type", "application/json");
		http.onreadystatechange = function () {
			if (http.readyState == 4 && http.status == 200) {
				alert("Image is updated...");
				document.getElementById(roomKey + 'a' + deviceKey + 'b' + id).src = logoUrl;
			} else if (http.readyState == 4 && http.status != 200) {
				alert("Something went wrong...");
			}
		}
		http.send(content);
		cl(content);
	}).catch(err => {
		document.getElementById("Favorites").innerHTML = "<h1>Something went wrong fetching the favorite...</h1>";
		throw err
	});
}