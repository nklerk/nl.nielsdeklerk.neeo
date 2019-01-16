"use strict";

const Homey = require("homey");
const tools = require("./tools");
const neeoBrain = require("./neeo-brain");
const neeoDatabase = require("./neeo-database");

module.exports.capabilities = function(query, args, type) {
  query = tools.stringCleanForMatch(query);
  const devices = neeoDatabase.devices();
  let foundcapa = [];
  if (devices.length > 0) {
    for (const device of devices) {
      if (device.adapterName == args.device.adapterName) {
        for (const capability of device.capabilities) {
          const capabilityQ = tools.stringCleanForMatch(capability.label);
          if (capabilityQ.indexOf(query) !== -1) {
            if ((capability.sensor && capability.sensor.type && capability.sensor.type === type) || capability.type == type) {
              if (capability.sensor && capability.sensor.type && capability.sensor.type === "range") {
                foundcapa.push({
                  name: capability.label,
                  realname: capability.name,
                  range: capability.sensor.range
                });
              } else {
                foundcapa.push({
                  name: capability.label,
                  realname: capability.name
                });
              }
            }
          }
        }
      }
    }
  }
  return foundcapa;
};

module.exports.rooms = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let foundrooms = [];
  for (const neeoBrain of neeoBrains) {
    for (const i in neeoBrain.brainConfiguration.rooms) {
      const room = neeoBrain.brainConfiguration.rooms[i];
      const roomQ = tools.stringCleanForMatch(room.name);
      if (roomQ.indexOf(query) !== -1) {
        const item = {
          name: room.name,
          key: room.key,
          brainip: neeoBrain.host
        };
        foundrooms.push(item);
      }
    }
  }
  return foundrooms;
};

module.exports.neeoBrains = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let foundBrains = [];
  for (const neeoBrain of neeoBrains) {
    if (neeoBrain.host.indexOf(query) !== -1) {
      const item = {
        name: neeoBrain.host,
        ip: neeoBrain.ip[0]
      };
      foundBrains.push(item);
    }
  }
  return foundBrains;
};

module.exports.roomDevices = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let founddevices = [];
  for (const neeoBrain of neeoBrains) {
    for (const i in neeoBrain.brainConfiguration.rooms) {
      const room = neeoBrain.brainConfiguration.rooms[i];
      if (room.key === args.room.key) {
        for (const i in room.devices) {
          const device = room.devices[i];
          if (!(device.details && device.details.adapterName && device.details.adapterName.indexOf("homey") > -1)) {
            const deviceQ = tools.stringCleanForMatch(device.name);
            if (deviceQ.indexOf(query) !== -1) {
              const item = {
                name: device.name,
                key: device.key
              };
              founddevices.push(item);
            }
          }
        }
      }
    }
  }
  return founddevices;
};

module.exports.devices = function(query, args) {
  query = tools.stringCleanForMatch(query);
  let founddevices = [];
  let devices = neeoDatabase.devices();
  if (devices.length > 0) {
    for (const device of devices) {
      const deviceQ = tools.stringCleanForMatch(device.manufacturer + device.name);
      if (deviceQ.indexOf(query) !== -1) {
        const item = {
          name: device.manufacturer + ", " + device.name,
          adapterName: device.adapterName
        };
        founddevices.push(item);
      }
    }
  }
  return founddevices;
};

module.exports.macros = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let foundmacros = [];
  for (const neeoBrain of neeoBrains) {
    for (const i in neeoBrain.brainConfiguration.rooms) {
      const room = neeoBrain.brainConfiguration.rooms[i];
      if (room.key === args.room.key) {
        for (const i in room.devices) {
          const device = room.devices[i];
          if (device.key === args.device.key) {
            for (const i in device.macros) {
              const macro = device.macros[i];
              const macroQ = tools.stringCleanForMatch(macro.name);
              if (macroQ.indexOf(query) !== -1) {
                const item = {
                  name: macro.name,
                  key: macro.key
                };
                foundmacros.push(item);
              }
            }
          }
        }
      }
    }
  }
  return foundmacros;
};

module.exports.sliders = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let foundsliders = [];
  for (const neeoBrain of neeoBrains) {
    for (const i in neeoBrain.brainConfiguration.rooms) {
      const room = neeoBrain.brainConfiguration.rooms[i];
      if (room.key === args.room.key) {
        for (const i in room.devices) {
          const device = room.devices[i];
          if (device.key === args.device.key) {
            for (const i in device.sliders) {
              const slider = device.sliders[i];
              const sliderQ = tools.stringCleanForMatch(slider.name);
              if (sliderQ.indexOf(query) !== -1) {
                const item = {
                  name: slider.name,
                  key: slider.key
                };
                foundsliders.push(item);
              }
            }
          }
        }
      }
    }
  }
  return foundsliders;
};

module.exports.switches = function(query, args) {
  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");
  let foundswitches = [];

  if (tools.isDefined(args.room) && tools.isDefined(args.room.key) && tools.isDefined(args.device) && tools.isDefined(args.device.key)) {
    for (const neeoBrain of neeoBrains) {
      for (const i in neeoBrain.brainConfiguration.rooms) {
        const room = neeoBrain.brainConfiguration.rooms[i];
        if (room.key === args.room.key) {
          for (const i in room.devices) {
            const device = room.devices[i];
            if (device.key === args.device.key) {
              for (const i in device.switches) {
                const switche = device.switches[i];
                const switchQ = tools.stringCleanForMatch(switche.name);
                if (switchQ.indexOf(query) !== -1) {
                  const item = {
                    name: switche.name,
                    key: switche.key
                  };
                  foundswitches.push(item);
                }
              }
            }
          }
        }
      }
    }
  }
  return foundswitches;
};

module.exports.recepies = function(query, args, stype) {
  let foundrecipes = [];
  query = tools.stringCleanForMatch(query);
  const neeoBrains = Homey.ManagerSettings.get("neeoBrains");

  if (Homey.ManagerSettings.get("downloading") != true) {
    neeoBrain.downloadConfiguration();
  }

  if (tools.isDefined(args.room) && tools.isDefined(args.room.key)) {
    for (const neeoBrain of neeoBrains) {
      for (const i in neeoBrain.brainConfiguration.rooms) {
        const room = neeoBrain.brainConfiguration.rooms[i];
        if (room.key === args.room.key) {
          for (const i in room.recipes) {
            const recipe = room.recipes[i];
            const recipeQ = tools.stringCleanForMatch(recipe.name);
            if (recipeQ.indexOf(query) !== -1 && recipe.type == stype) {
              const item = {
                name: recipe.name,
                key: recipe.key
              };
              foundrecipes.push(item);
            }
          }
        }
      }
    }
  }
  return foundrecipes;
};
