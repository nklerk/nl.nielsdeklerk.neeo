function device_cap_save(adapterName) {
  let cname = document.getElementById("capname_" + adapterName).value;
  let ctype = document.getElementById("captype_" + adapterName).value;
  let paramA = "";
  let paramB = "";
  let paramC = "";
  if (ctype == "slider") {
    paramA = document.getElementById("capslider_min_" + adapterName).value;
    paramB = document.getElementById("capslider_max_" + adapterName).value;
    paramC = document.getElementById("capslider_unit_" + adapterName).value;
  } else if (ctype == "textlabel") {
    paramA = document.getElementById("captextlabel_visible_" + adapterName).checked;
  }
  device_add_cap(adapterName, cname, ctype, paramA, paramB, paramC, true);
  Homey.api("GET", "/register/");
}

function device_add_cap(adapterName, cname, ctype, paramA, paramB, paramC, alert) {
  for (let i in Settings_database) {
    if (Settings_database[i].adapterName === adapterName) {
      let found = 0;
      for (let z in Settings_database[i].capabilities) {
        if (Settings_database[i].capabilities[z].name.toUpperCase() == cname.toUpperCase()) {
          found = found + 1;
        }
      }
      if (found == 0) {
        if (ctype == "slider") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_slider(Settings_database[i], cname, [Number(paramA), Number(paramB)], paramC));
        }
        if (ctype == "button") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_button(Settings_database[i], cname));
        }
        if (ctype == "switch") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_switch(Settings_database[i], cname));
        }
        if (ctype == "textlabel") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_textlabel(Settings_database[i], cname, paramA));
        }
        if (ctype == "image") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_image(Settings_database[i], cname, "small"));
        }
        if (ctype == "large image") {
          Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_image(Settings_database[i], cname, "large"));
        }
        Settings_database[i] = updateDriverVersion(Settings_database[i]);
        setMyDevices(Settings_database);
        device_view_selection(adapterName);
      }
    }
  }
}

function updateDriverVersion(device) {
  if (device.driverVersion && typeof device.driverVersion === "number") {
    device.driverVersion++;
  } else {
    device.driverVersion = 1;
  }
  return device;
}

function capability_remove(adapterName, Capname) {
  for (let i in Settings_database) {
    if (Settings_database[i].adapterName === adapterName) {
      Settings_database[i] = updateDriverVersion(Settings_database[i]);
      let capabilities = [];
      for (let z in Settings_database[i].capabilities) {
        if (Settings_database[i].capabilities[z].name != Capname && Settings_database[i].capabilities[z].name != Capname + "_SENSOR") {
          capabilities.push(Settings_database[i].capabilities[z]);
        }
      }
      Settings_database[i].capabilities = capabilities;
    }
  }
  setMyDevices(Settings_database);
  device_view_selection(adapterName);
}

function capability_rename(adapterName, Capname) {
  let label = document.getElementsByName(Capname)[0].value;
  document.getElementsByName(Capname)[0].style.WebkitAnimation = "textSavedAnimation 1s"; // Code for Safari 4.0 - 8.0
  document.getElementsByName(Capname)[0].style.animation = "textSavedAnimation 1s";
  for (let i in Settings_database) {
    if (Settings_database[i].adapterName === adapterName) {
      Settings_database[i] = updateDriverVersion(Settings_database[i]);
      for (let z in Settings_database[i].capabilities) {
        if (Settings_database[i].capabilities[z].name === Capname || Settings_database[i].capabilities[z].name === Capname + "_SENSOR") {
          Settings_database[i].capabilities[z].label = label;
        }
      }
    }
  }
  setMyDevices(Settings_database);
  setTimeout(function() {
    device_view_selection(adapterName);
  }, 1000);
}

function device_remove(adapterName) {
  let newSettings_database = [];
  for (let i in Settings_database) {
    if (Settings_database[i].adapterName != adapterName) {
      newSettings_database.push(Settings_database[i]);
    }
  }
  Settings_database = newSettings_database;
  setMyDevices(Settings_database);
  devices_refresh_display();
  gui_view_selection("devices");
}
