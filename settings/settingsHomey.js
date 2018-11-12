function onHomeyReady(HomeyReady) {
  Homey = HomeyReady;
  Homey.ready();
  Homey.get("myDevices", function(err, Devices) {
    if (err) {
      console.log(err);
    }
  });
  readsettings();
  addDeviceTypeOptions();
}

function readsettings() {
  readMyDevices();
  readMyBrains();
  readSdkVersion();
}

function readMyDevices() {
  Homey.get("myDevices", function(err, Devices) {
    if (typeof Devices !== "undefined") {
      if (Devices === null) {
        Settings_database = [];
      } else {
        Settings_database = Devices;
      }
      devices_refresh_display();
    } else {
      setTimeout(readMyDevices, 300);
    }
  });
}

function readMyBrains() {
  Homey.get("neeoBrains", function(err, NEEObrains) {
    if (typeof NEEObrains !== "undefined") {
      if (Settings_brains != NEEObrains) {
        Settings_brains = NEEObrains;
        settings_refresh_display();
      }
    } else {
      Settings_brains = [];
      setTimeout(readMyBrains, 300);
    }
  });
}

function readSdkVersion() {
  Homey.get("sdkVersion", function(err, sdkVersion) {
    if (sdkVersion !== "v1") {
      gui_show_migration();
    }
  });
}

function setMyDevices(Settings_database) {
  Homey.set("myDevices", Settings_database);
  Homey.api("GET", "/register/");
}

function upgradeToSDKv1() {
  Homey.api("GET", "/upgradeToSDKv1/");
  document.getElementById("Logo").innerHTML = `<img src="img/combo.png" style="margin-top: 40px;display: block;margin-left: auto;margin-right: auto;width: 27%;">`;
}
