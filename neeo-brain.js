"use strict";
const Homey = require("homey");
const homeyTokens = require("./homey-tokens");
const tools = require("./tools");
const neeoDatabase = require("./neeo-database");
const httpmin = require("http.min");

const TCP_PORT = 6336;
const NEEO_RECONNECT_INTERVAL = 60000; // 900000 = 15 Min   // 60000 = 1 Min

let neeoConnectionTries = 0;
let neeoBrains;
let neeoBrainsChanged = false;
let homeyId;

// Needed fo when a brain is deleted in the settings. the data must be reloaded.
Homey.ManagerSettings.on("set", key => {
  if (key == "neeoBrains" && neeoBrainsChanged == true) {
    neeoBrains = Homey.ManagerSettings.get("neeoBrains");
    neeoBrainsChanged = false;
  }
});

// Discover brains.
function discover() {
  console.log("[SERVER]\tSearching for NEEO brains... MUST.... EAT..... BRAINS .....!!!");
  const mdns = require("mdns-js");
  mdns.excludeInterface("0.0.0.0");
  let browser = mdns.createBrowser("_neeo._tcp");
  browser.on("ready", function() {
    browser.discover();
  });
  browser.on("update", function(data) {
    addNeeoBrainToDatabase(data);
  });
}
module.exports.discover = discover;

//Notification that a brain is deleted.
function brainDelete() {
  neeoBrainsChanged = true;
}
module.exports.brainDelete = brainDelete;

function addNeeoBrainToDatabase(foundbrain) {
  if (!neeoBrains) {
    neeoBrains = [];
  }
  let exist = 0;
  const fullname = foundbrain.fullname.replace("._neeo._tcp.local", "");
  for (const i in neeoBrains) {
    if (neeoBrains[i].host === foundbrain.host) {
      console.log(`[SERVER]\tUpdating settings: ${foundbrain.host}`);
      neeoBrains[i].ip = foundbrain.addresses;
      neeoBrains[i].fullname = fullname;
      exist = exist + 1;
    }
  }
  if (exist === 0) {
    console.log(`[SERVER]\tNew NEEO Brain found: ${foundbrain.host}`);
    console.log(`        \t                    - ${foundbrain.addresses}`);
    console.log(`        \t                    - ${fullname}`);
    console.log(``);
    const neeoBrain = {
      host: foundbrain.host,
      ip: foundbrain.addresses,
      fullname
    };
    neeoBrains.push(neeoBrain);
    registerAsDeviceDatabase(neeoBrain);
    registerForwarderEvents(neeoBrain);
    downloadConfiguration(neeoBrain);
    downloadSystemInfo(neeoBrain);
  }
  Homey.ManagerSettings.set("neeoBrains", neeoBrains);
}

function connect() {
  getHomeyId();

  //First Connection upon app start.
  if (neeoConnectionTries === 0) {
    neeoBrains = Homey.ManagerSettings.get("neeoBrains");
    homeyTokens.setAll();
  }
  //If there are no NEEO brains.
  if (!neeoBrains || neeoBrains.length === 0) {
    discover();
    //If there is atleast one NEEO brain, Do per Brain.
  } else {
    for (let neeoBrain of neeoBrains) {
      downloadConfiguration(neeoBrain);
      downloadSystemInfo(neeoBrain);
      if (neeoConnectionTries === 0) {
        registerAsDeviceDatabase(neeoBrain);
        registerForwarderEvents(neeoBrain);
      }
    }
  }
  neeoConnectionTries++;
  setTimeout(connect, NEEO_RECONNECT_INTERVAL);
}
module.exports.connect = connect;

function getHomeyId() {
  if (Homey.ManagerSettings.get("homeyID") === null) {
    Homey.ManagerCloud.getHomeyId().then(id => {
      homeyId = id;
      Homey.ManagerSettings.set("homeyID", id);
    });
  } else {
    homeyId = Homey.ManagerSettings.get("homeyID");
  }
}

function registerAsDeviceDatabaseAll() {
  try {
    for (let neeoBrain of neeoBrains) {
      registerAsDeviceDatabase(neeoBrain);
    }
  } catch (e) {
    console.log(`[ERROR] \t${neeoBrain.host}`);
  }
}
module.exports.registerAsDeviceDatabaseAll = registerAsDeviceDatabaseAll;

function unregisterAsDeviceDatabaseAll() {
  try {
    for (let neeoBrain of neeoBrains) {
      unregisterAsDeviceDatabaseApi(neeoBrain);
    }
  } catch (e) {
    console.log(`[ERROR] \t${neeoBrain.host}`);
  }
}
module.exports.unregisterAsDeviceDatabaseAll = unregisterAsDeviceDatabaseAll;

function registerAsDeviceDatabase(neeoBrain) {
  if (Homey.ManagerSettings.get("sdkVersion") == "v1") {
    //Register as the new SDK adapter.
    const content = {
      name: `src-${homeyId}`,
      baseUrl: `http://${tools.getLocalIp()}:${TCP_PORT}`
    };
    registerAsDeviceDatabaseApi(neeoBrain, content);
  } else {
    //Register as the old SDK adapter.
    const content = {
      name: `Homey_Devicedatabase_${tools.getLocalIp()}`,
      baseUrl: `http://${tools.getLocalIp()}:${TCP_PORT}`
    };
    registerAsDeviceDatabaseApi(neeoBrain, content);
  }
}

function registerAsDeviceDatabaseApi(neeoBrain, content) {
  httpmin
    .post(`http://${neeoBrain.host}:3000/v1/api/registerSdkDeviceAdapter`, content)
    .then(response => {
      if (response.data === '{"success":true}') {
        console.log(`[DRIVER]\t${neeoBrain.host}, SdkDeviceAdapter registration succesfull as ${content.name}.`);
      } else {
        console.log(`[EVENTS]\tERROR: ${neeoBrain.host}, SdkDeviceAdapter registration unsuccesfull! ${response.data}`);
      }
    })
    .catch(e => {
      console.log(`[ERROR] \t${neeoBrain.host}, SdkDeviceAdapter registration unsuccesfull!`);
    });
}

function unregisterAsDeviceDatabaseApi(neeoBrain) {
  const content = {
    name: `Homey_Devicedatabase_${tools.getLocalIp()}`,
    baseUrl: `http://${tools.getLocalIp()}:${TCP_PORT}`
  };
  httpmin
    .post(`http://${neeoBrain.host}:3000/v1/api/unregisterSdkDeviceAdapter`, content)
    .then(response => {
      if (response.data === '{"success":true}') {
        console.log(`[DRIVER]\t${neeoBrain.host}, SdkDeviceAdapter ${content.name} sucssesvol unregistered..`);
      } else {
        console.log(`[EVENTS]\tERROR: ${neeoBrain.host}, SdkDeviceAdapter unregistration NOT succesfull! ${response.data}`);
      }
    })
    .catch(e => {
      console.log(`[EVENTS]\tERROR: ${neeoBrain.host}, SdkDeviceAdapter unregistration NOT succesfull!`);
    });
}

function registerForwarderEvents(neeoBrain) {
  const content = {
    host: tools.getLocalIp(),
    port: TCP_PORT,
    path: "/Homey-By-Niels_de_Klerk"
  };

  httpmin
    .post(`http://${neeoBrain.host}:3000/v1/forwardactions`, content)
    .then(response => {
      if (response.data === '{"success":true}') {
        console.log(`[EVENTS]\t${neeoBrain.host}, "Forward brain events" registration succesfull.`);
      } else {
        console.log(`[ERROR] \t${neeoBrain.host}, "Forward brain events" registration unsuccesfull! ${response.data}`);
      }
    })
    .catch(e => {
      console.log(`[ERROR] \t${neeoBrain.host}, "Forward brain events" registration unsuccesfull!`);
    });
}

function downloadConfiguration(neeoBrainQ) {
  if (tools.isArray(neeoBrains) && neeoBrains.length !== 0) {
    for (let i in neeoBrains) {
      if (!neeoBrainQ || neeoBrains[i].host === neeoBrainQ.host) {
        httpmin
          .json(`http://${neeoBrains[i].host}:3000/v1/projects/home/lastchange`)
          .then(lastchange => {
            neeoBrains[i].available = true;
            if (!neeoBrains[i].brainConfiguration || neeoBrains[i].brainConfiguration.lastchange - lastchange != 0) {
              httpmin
                .json(`http://${neeoBrains[i].host}:3000/v1/projects/home`)
                .then(brainConfiguration => {
                  console.log(`[DATABASE]\t${neeoBrains[i].host}, Downloading new configuration complete.`);
                  neeoBrains[i].brainConfiguration = brainConfiguration;
                  Homey.ManagerSettings.set("neeoBrains", neeoBrains);
                  neeoDatabase.refreshEventRegisters();
                })
                .catch(error => {
                  console.log(`[ERROR]\tDownloading configuration from: ${neeoBrains[i].host}.`);
                });
            } else {
            }
          })
          .catch(error => {
            neeoBrains[i].available = false;
            Homey.ManagerSettings.set("neeoBrains", neeoBrains);
          });
      }
    }
  }
}
module.exports.downloadConfiguration = downloadConfiguration;

function downloadSystemInfo(neeoBrainQ) {
  if (tools.isArray(neeoBrains) && neeoBrains.length !== 0) {
    for (let i in neeoBrains) {
      if (!neeoBrainQ || neeoBrains[i].host === neeoBrainQ.host) {
        httpmin
          .json(`http://${neeoBrains[i].host}:3000/v1/systeminfo`)
          .then(systemInfo => {
            if (neeoBrains[i].systemInfo && neeoBrains[i].systemInfo.uptime > systemInfo.uptime) {
              registerAsDeviceDatabase(neeoBrains[i]);
              registerForwarderEvents(neeoBrains[i]);
            }
            neeoBrains[i].systemInfo = systemInfo;
            neeoBrains[i].ip = systemInfo.ip;
            Homey.ManagerSettings.set("neeoBrains", neeoBrains);
          })
          .catch(error => {
            console.log(`[ERROR] \t${neeoBrains[i].host}, Getting "systeminfo" unsuccesfull!`);
          });
      }
    }
  }
}

module.exports.notifyStateChange = function(adapterName, capabilityName, value) {
  const capability = neeoDatabase.capability(adapterName, capabilityName);
  if (capability && capability.eventservers) {
    for (let eventserver of capability.eventservers) {
      const notificationData = {
        type: "DEVICE_SENSOR_UPDATE",
        data: {
          sensorEventKey: eventserver.eventKey,
          sensorValue: value
        }
      };
      httpmin
        .post(`http://${eventserver.host}:3000/v1/notifications`, notificationData)
        .then(result => {
          if (result.data === '{"success":true}') {
            console.log(`[NOTIFICATIONS]\tSuccesfully sent notification with value "${value}" to eventkey "${eventserver.eventKey}" @${eventserver.host}.`);
          } else {
            console.log(`[ERROR]\t\tError sending notification with value "${value}" to eventkey "${eventserver.eventKey}" @${eventserver.host}. Got response: ${result.data}.`);
          }
        })
        .catch(error => {
          console.log(`[ERROR]\t\tError sending notification with value "${value}" to eventkey "${eventserver.eventKey}" @${eventserver.host}.`);
        });
    }
  } else {
    console.log(`[ERROR]\t\tneeoBrain_sensor_notify(${adapterName}, ${capabilityName}, ${value})`);
  }
};

module.exports.shutdownAllRecipes = function() {
  for (const neeoBrain of neeoBrains) {
    httpmin
      .json(`http://${neeoBrain.host}:3000/v1/api/Recipes`)
      .then(recipies => {
        if (typeof recipies !== "undefined") {
          for (const recipie of recipies) {
            if (recipie.isPoweredOn === true) {
              console.log(`[RECIPE]\tPowering off ${recipie.detail.devicename}`);
              httpmin
                .get(recipie.url.setPowerOff)
                .then({})
                .catch({});
            }
          }
        }
      })
      .catch(error => {});
  }
};

module.exports.isRecipeActive = function(brainHostname, roomKey, recipeKey) {
  return httpmin
    .json(`http://${brainHostname}:3000/v1/projects/home/rooms/${roomKey}/recipes/${recipeKey}/isactive`)
    .then(result => {
      return result.active;
    })
    .catch(error => {
      return false;
    });
};

function isUpdateAvaileble(brainHostname) {
  return httpmin
    .json(`http://${brainHostname}:3000/v1/firmware`)
    .then(result => {
      return result.updateAvailable;
    })
    .catch(error => {});
}
module.exports.isUpdateAvaileble = isUpdateAvaileble;

module.exports.updateFirmware = function(brainHostname) {
  if (isUpdateAvaileble(brainHostname)) {
    httpmin
      .post(`http://${brainHostname}:3000/v1/firmware/update`)
      .then(result => {
        return result.success;
      })
      .catch(error => {});
  } else {
    return false;
  }
};

module.exports.executeRecipe = function(brainHostname, roomKey, recipeKey) {
  httpmin
    .get(`http://${brainHostname}:3000/v1/projects/home/rooms/${roomKey}/recipes/${recipeKey}/execute`)
    .then({})
    .catch({});
};

module.exports.commandButton = function(brainHostname, roomKey, deviceKey, capabilityKey) {
  httpmin
    .get(`http://${brainHostname}:3000/v1/projects/home/rooms/${roomKey}/devices/${deviceKey}/macros/${capabilityKey}/trigger`)
    .then({})
    .catch({});
};

module.exports.commandSwitch = function(brainHostname, roomKey, deviceKey, capabilityKey, value) {
  httpmin
    .put(`http://${brainHostname}:3000/v1/projects/home/rooms/${roomKey}/devices/${deviceKey}/switches/${capabilityKey}/${value}`, {})
    .then({})
    .catch({});
};

module.exports.commandSlider = function(brainHostname, roomKey, deviceKey, capabilityKey, value) {
  httpmin
    .put(`http://${brainHostname}:3000/v1/projects/home/rooms/${roomKey}/devices/${deviceKey}/sliders/${capabilityKey}`, { value: value })
    .then({})
    .catch({});
};

function blinkLed(brainHostname, times) {
  httpmin
    .get(`http://${brainHostname}:3000/v1/systeminfo/identbrain`)
    .then({})
    .catch({});
  times--;
  if (times > 0) {
    setTimeout(blinkLed, 2000, brainIp, times);
  }
}
module.exports.blinkLed = blinkLed;
