function AddDevice_save() {
  let mydevice = newDevice(document.getElementById("AddDevice_Manufactorer").value, document.getElementById("AddDevice_Name").value, document.getElementById("AddDevice_Type").value, document.getElementById("AddDevice_Icon").value);
  Settings_database.push(mydevice);
  device_capgrp_from_devicetype(mydevice.adapterName, mydevice.type);
  setMyDevices(Settings_database);
  AddDevice_clear();
  device_view_selection(mydevice.adapterName);
} // GUI Add device save button.

function AddDevice_clear() {
  document.getElementById("AddDevice_Manufactorer").value = "";
  document.getElementById("AddDevice_Name").value = "";
  gui_view_selection("devices");
} // GUI Add device cancel button.

function AddDevice_Type_change() {
  document.getElementById("AddDevice_Icon").value = document.getElementById("AddDevice_Type").value;
  document.getElementById("AddDevice_Icon_Img").src = "ico/ico_" + document.getElementById("AddDevice_Icon").value + ".png";
}

function AddDevice_Icon_change() {
  document.getElementById("AddDevice_Icon_Img").src = "ico/ico_" + document.getElementById("AddDevice_Icon").value + ".png";
}

function addDeviceTypeOptions() {
  let optStrType = "";
  let optStrIcon = "";
  for (const i in sellectionoptions) {
    if (showUnsupported === true || sellectionoptions[i].supported === true) {
      optStrType = optStrType + '<option value="' + sellectionoptions[i].value + '">' + sellectionoptions[i].name + "</option>";
    }
    optStrIcon = optStrIcon + '<option value="' + sellectionoptions[i].value + '">' + sellectionoptions[i].name + "</option>";
  }
  document.getElementById("AddDevice_Type").innerHTML = optStrType;
  document.getElementById("AddDevice_Icon").innerHTML = optStrIcon;
}

function clear_button() {
  setMyDevices([]);
  devices_refresh_display();
  gui_view_selection("devices");
}

function clear_brain_button() {
  Homey.set("neeoBrains", []);
  Settings_brains = [];
  settings_refresh_display();
}

function settings_brain_delete(selection) {
  let new_Settings_brains = [];
  for (let i in Settings_brains) {
    if (Settings_brains[i].host === selection) {
    } else {
      new_Settings_brains.push(Settings_brains[i]);
    }
  }
  Homey.set("neeoBrains", new_Settings_brains);
  Settings_brains = new_Settings_brains;
  Homey.api("GET", "/delete/");
  settings_refresh_display();
} //

function settings_btn_saveconfig() {
  Settings_database = JSON.parse(document.getElementById("jsonconfig").value);
  setMyDevices(Settings_database);
  devices_refresh_display();
  gui_view_selection("devices");
} //

function settings_btn_download() {
  download("NEEO Configuration.json", document.getElementById("jsonconfig").value);
} //

function gui_view_selection(displayWindow) {
  if (displayWindow == "devices") {
    document.getElementById("Devices_view").style.display = "block";
    devices_refresh_display();
  } else {
    document.getElementById("Devices_view").style.display = "none";
  }

  if (displayWindow == "device") {
    document.getElementById("Device_view").style.display = "block";
    devices_refresh_display();
  } else {
    document.getElementById("Device_view").style.display = "none";
  }

  if (displayWindow == "adddevice") {
    document.getElementById("AddDevice_view").style.display = "block";
  } else {
    document.getElementById("AddDevice_view").style.display = "none";
  }

  if (displayWindow == "settings") {
    document.getElementById("Settings_view").style.display = "block";
    settings_refresh_display();
  } else {
    document.getElementById("Settings_view").style.display = "none";
  }
} // change active view.

////////////////////////////////////////
// Devices View
////////////////////////////////////////

function device_cap_view_show(adapterName) {
  document.getElementById("cap_view_" + adapterName).style.display = "block";
  document.getElementById("cap_addbtn_" + adapterName).style.display = "none";
  document.getElementById("capgrp_addbtn_" + adapterName).style.display = "none";
}

function device_cap_view_hide(adapterName) {
  document.getElementById("cap_view_" + adapterName).style.display = "none";
  document.getElementById("cap_addbtn_" + adapterName).style.display = "block";
  document.getElementById("capgrp_addbtn_" + adapterName).style.display = "block";
}

function device_capgrp_view_show(adapterName) {
  document.getElementById("capgrp_view_" + adapterName).style.display = "block";
  document.getElementById("cap_addbtn_" + adapterName).style.display = "none";
  document.getElementById("capgrp_addbtn_" + adapterName).style.display = "none";
}

function device_capgrp_view_hide(adapterName) {
  document.getElementById("capgrp_view_" + adapterName).style.display = "none";
  document.getElementById("cap_addbtn_" + adapterName).style.display = "block";
  document.getElementById("capgrp_addbtn_" + adapterName).style.display = "block";
}

function device_cap_view_type_change(adapterName) {
  if (document.getElementById("captype_" + adapterName).value == "slider") {
    document.getElementById("capslidermin_" + adapterName).style.display = "block";
    document.getElementById("capslidermax_" + adapterName).style.display = "block";
    document.getElementById("capsliderunit_" + adapterName).style.display = "block";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "none";
    document.getElementById("capname_" + adapterName).placeholder = "Name of slider";
  }
  if (document.getElementById("captype_" + adapterName).value == "button") {
    document.getElementById("capslidermin_" + adapterName).style.display = "none";
    document.getElementById("capslidermax_" + adapterName).style.display = "none";
    document.getElementById("capsliderunit_" + adapterName).style.display = "none";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "none";
    document.getElementById("capname_" + adapterName).placeholder = "Name of button";
  }
  if (document.getElementById("captype_" + adapterName).value == "switch") {
    document.getElementById("capslidermin_" + adapterName).style.display = "none";
    document.getElementById("capslidermax_" + adapterName).style.display = "none";
    document.getElementById("capsliderunit_" + adapterName).style.display = "none";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "none";
    document.getElementById("capname_" + adapterName).placeholder = "Name of switch";
  }
  if (document.getElementById("captype_" + adapterName).value == "textlabel") {
    document.getElementById("capslidermin_" + adapterName).style.display = "none";
    document.getElementById("capslidermax_" + adapterName).style.display = "none";
    document.getElementById("capsliderunit_" + adapterName).style.display = "none";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "block";
    document.getElementById("capname_" + adapterName).placeholder = "Name of textlabel";
  }
  if (document.getElementById("captype_" + adapterName).value == "image") {
    document.getElementById("capslidermin_" + adapterName).style.display = "none";
    document.getElementById("capslidermax_" + adapterName).style.display = "none";
    document.getElementById("capsliderunit_" + adapterName).style.display = "none";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "none";
    document.getElementById("capname_" + adapterName).placeholder = "Name of image";
  }
  if (document.getElementById("captype_" + adapterName).value == "large image") {
    document.getElementById("capslidermin_" + adapterName).style.display = "none";
    document.getElementById("capslidermax_" + adapterName).style.display = "none";
    document.getElementById("capsliderunit_" + adapterName).style.display = "none";
    document.getElementById("captextlabelvisible_" + adapterName).style.display = "none";
    document.getElementById("capname_" + adapterName).placeholder = "Name of image";
  }
}
