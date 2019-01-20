function device_capgrp_save(adapterName, capability) {
  switch (capability) {
    case "mediacontrolls":
      device_add_cap(adapterName, "PLAY", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "PAUSE", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "STOP", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FORWARD", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "PREVIOUS", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "NEXT", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "REVERSE", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "PLAY PAUSE TOGGLE", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "INFO", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "MY RECORDINGS", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "RECORD", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "LIVE", "button", 0, 0, 0, false);
      break;
    case "digits":
      device_add_cap(adapterName, "DIGIT 0", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 1", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 2", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 3", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 4", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 5", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 6", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 7", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 8", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT 9", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "DIGIT SEPARATOR", "button", 0, 0, 0, false);
      break;
    case "directions":
      device_add_cap(adapterName, "BACK", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CURSOR DOWN", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CURSOR LEFT", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CURSOR RIGHT", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CURSOR UP", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CURSOR ENTER", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "EXIT", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "HOME", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "MENU", "button", 0, 0, 0, false);
      break;
    case "power":
      device_add_cap(adapterName, "POWER OFF", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "POWER ON", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "POWER TOGGLE", "button", 0, 0, 0, false);
      break;
    case "tuner":
      device_add_cap(adapterName, "CHANNEL UP", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CHANNEL DOWN", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "CHANNEL SEARCH", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FAVORITE", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "GUIDE", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FUNCTION RED", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FUNCTION GREEN", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FUNCTION YELLOW", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FUNCTION BLUE", "button", 0, 0, 0, false);
      break;
    case "video":
      device_add_cap(adapterName, "FORMAT 16:9", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FORMAT 4:3", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "FORMAT AUTO", "button", 0, 0, 0, false);
      break;
    case "volume":
      device_add_cap(adapterName, "VOLUME UP", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "VOLUME DOWN", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "MUTE TOGGLE", "button", 0, 0, 0, false);
      break;
    case "input":
      device_add_cap(adapterName, "INPUT TUNER 1", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "INPUT HDMI 1", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "INPUT HDMI 2", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "INPUT HDMI 3", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "INPUT HDMI 4", "button", 0, 0, 0, false);
      break;
    default:
  }
  Homey.api("GET", "/register/");
}

function device_capgrp_from_devicetype(adapterName, type) {
  switch (type) {
    case "TV":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "mediacontrolls");
      device_capgrp_save(adapterName, "tuner");
      device_capgrp_save(adapterName, "digits");
      device_capgrp_save(adapterName, "directions");
      device_capgrp_save(adapterName, "video");
      device_capgrp_save(adapterName, "volume");
      device_capgrp_save(adapterName, "input");
      break;
    case "DVD":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "mediacontrolls");
      device_capgrp_save(adapterName, "directions");
    case "VOD":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "mediacontrolls");
      device_capgrp_save(adapterName, "directions");
      break;
    case "ACCESSOIRE":
      device_capgrp_save(adapterName, "power");
      break;
    case "PROJECTOR":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "input");
      break;
    case "DVB":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "tuner");
      device_capgrp_save(adapterName, "directions");
      break;
    case "AVRECEIVER":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "volume");
      device_capgrp_save(adapterName, "input");
      break;
    case "AUDIO":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "volume");
      device_capgrp_save(adapterName, "input");
      break;
    case "HDMISWITCH":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "input");
      break;
    case "GAMECONSOLE":
      device_capgrp_save(adapterName, "power");
      break;
    case "MEDIAPLAYER":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "mediacontrolls");
      device_capgrp_save(adapterName, "digits");
      device_capgrp_save(adapterName, "directions");
      device_capgrp_save(adapterName, "video");
      break;
    case "MUSICPLAYER":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "mediacontrolls");
      device_capgrp_save(adapterName, "digits");
      device_capgrp_save(adapterName, "directions");
      break;
    case "SOUNDBAR":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "volume");
      device_capgrp_save(adapterName, "input");
      break;
    case "TUNER":
      device_capgrp_save(adapterName, "power");
      device_capgrp_save(adapterName, "tuner");
      device_capgrp_save(adapterName, "digits");
      break;
    case "LIGHT":
      device_capgrp_save(adapterName, "power");
      device_add_cap(adapterName, "POWER_ALL_OFF", "button", 0, 0, 0, false);
      device_add_cap(adapterName, "LIGHT", "switch", 0, 0, 0, false);
      device_add_cap(adapterName, "BRIGHTNESS", "slider", 0, 100, "%", false);
      break;
    case "THERMOSTAT":
      break;
    case "CLIMA":
      break;
    default:
      device_capgrp_save(adapterName, "power");
  }
}

function newDevice(name, manufacturer, type, icon) {
  let _newdevice = {};
  _newdevice.id = Date.now() - 1512590738651;
  _newdevice.adapterName = `apt-homey${_newdevice.id}`;
  _newdevice.type = type.toUpperCase();
  _newdevice.manufacturer = manufacturer;
  _newdevice.name = name;
  _newdevice.icon = icon;
  _newdevice.tokens = "Homey";
  _newdevice.device = {
    name: name,
    specificname: name,
    tokens: ["Homey", "Athom"]
  };
  _newdevice.setup = {};
  _newdevice.capabilities = [];
  return _newdevice;
}

function newCapability_button(device, name) {
  const uuid = uuidv4();
  let _newCapability_button = {};
  _newCapability_button.type = "button";
  _newCapability_button.name = uuid;
  _newCapability_button.label = name; //my button
  _newCapability_button.path = "/device/" + device.adapterName + "/" + _newCapability_button.name;
  return [_newCapability_button];
}

function newCapability_slider(device, name, range, unit) {
  const uuid = uuidv4();
  let _newCapability_sensor = {};
  _newCapability_sensor.type = "sensor";
  _newCapability_sensor.name = uuid + "_SENSOR";
  _newCapability_sensor.label = name;
  _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
  _newCapability_sensor.sensor = { type: "range" };
  _newCapability_sensor.sensor.range = range; //"range":[0,200],
  _newCapability_sensor.sensor.unit = unit; //"unit":"%"
  _newCapability_sensor.sensor.value = 0;
  let _newCapability_slider = {};
  _newCapability_slider.type = "slider";
  _newCapability_slider.name = uuid;
  _newCapability_slider.label = name;
  _newCapability_slider.path = "/device/" + device.adapterName + "/" + _newCapability_slider.name;
  _newCapability_slider.slider = { type: "range" };
  _newCapability_slider.slider.sensor = _newCapability_sensor.name;
  _newCapability_slider.slider.range = range; //"range":[0,200],
  _newCapability_slider.slider.unit = unit; //"unit":"%"
  return [_newCapability_sensor, _newCapability_slider];
}

function newCapability_switch(device, name) {
  const uuid = uuidv4();
  let _newCapability_sensor = {};
  _newCapability_sensor.type = "sensor";
  _newCapability_sensor.name = uuid + "_SENSOR";
  _newCapability_sensor.label = name;
  _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
  _newCapability_sensor.sensor = { type: "binary" };
  _newCapability_sensor.sensor.value = false;
  let _newCapability_switch = {};
  _newCapability_switch.type = "switch";
  _newCapability_switch.name = uuid;
  _newCapability_switch.label = name;
  _newCapability_switch.path = "/device/" + device.adapterName + "/" + _newCapability_switch.name;
  _newCapability_switch.sensor = _newCapability_sensor.name;
  return [_newCapability_sensor, _newCapability_switch];
}

function newCapability_textlabel(device, name, isLabelVisible) {
  const uuid = uuidv4();
  let _newCapability_sensor = {};
  _newCapability_sensor.type = "sensor";
  _newCapability_sensor.name = uuid + "_SENSOR";
  _newCapability_sensor.label = name;
  _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
  _newCapability_sensor.sensor = { type: "custom" };
  _newCapability_sensor.sensor.value = "My Text Here";
  let _newCapability_textlabel = {};
  _newCapability_textlabel.type = "textlabel";
  _newCapability_textlabel.name = uuid;
  _newCapability_textlabel.label = name;
  _newCapability_textlabel.isLabelVisible = isLabelVisible;
  _newCapability_textlabel.path = "/device/" + device.adapterName + "/" + _newCapability_textlabel.name;
  _newCapability_textlabel.sensor = _newCapability_sensor.name;
  return [_newCapability_sensor, _newCapability_textlabel];
}

function newCapability_image(device, name, size) {
  const uuid = uuidv4();
  let _newCapability_sensor = {};
  _newCapability_sensor.type = "sensor";
  _newCapability_sensor.name = uuid + "_SENSOR";
  _newCapability_sensor.label = name;
  _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
  _newCapability_sensor.sensor = { type: "custom" };
  _newCapability_sensor.sensor.value = "My Text Here";
  let _newCapability_image = {};
  _newCapability_image.type = "imageurl";
  _newCapability_image.name = uuid;
  _newCapability_image.label = name;
  _newCapability_image.imageUri = null;
  _newCapability_image.size = size;
  _newCapability_image.path = "/device/" + device.adapterName + "/" + _newCapability_image.name;
  _newCapability_image.sensor = _newCapability_sensor.name;
  return [_newCapability_sensor, _newCapability_image];
}

function uuidv4() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
