///////////////////////////////////////
// Display specific virtual device and capabilities
///////////////////////////////////////
function device_view_selection(adapterName) {
  gui_view_selection("device");
  document.getElementById("DeviceCapabilities").innerHTML = "";

  for (let i in Settings_database) {
    if (Settings_database[i].adapterName === adapterName) {
      const device = Settings_database[i];
      let dd = ""; //Display Devices generic information.
      dd = dd + `<img class="ciconr" src="ico/ico_binr.png" style="margin-top: 0px;" onclick="device_remove('${adapterName}')">`;
      dd = dd + `<img class="cicon" src="${getDeviceIconPath(device)}" style="margin-top: 0px;">`;
      dd = dd + `<h1 class="h2">${device.name}</h1>`;
      dd = dd + `<h1 class="h3">TYPE: ${device.type}</h1>`;
      dd = dd + `<h1 class="h3">VERSION: ${device.driverVersion}</h1>`;

      //
      let c = 0; //capability counter
      for (let ic in device.capabilities) {
        const capabilityName = device.capabilities[ic].name;
        const capabilityLabel = device.capabilities[ic].label;
        const capabilityType = device.capabilities[ic].type;

        //Display first row of capabilities
        if (capabilityType === "slider" || capabilityType === "button" || capabilityType === "switch" || capabilityType === "textlabel" || capabilityType === "imageurl") {
          if (c == 0) {
            dd = dd + '<div style="background-color: #fff;"><hr class="Menu" style="margin-bottom: 0;">';
          } else {
            dd = dd + '<hr class="subMenu" style="margin-bottom: 0;">';
          }
          c++;

          //Line displaying one capability
          dd = dd + `<button class="mi" style="height: 48px !important;">`;
          dd = dd + `  <img class="ciconr" src="ico/ico_bin.png" style="margin-top: 0px;" onclick="capability_remove('${adapterName}', '${capabilityName}')">`;
          dd = dd + `  <img class="cicon" src="ico/ico_${capabilityType}.png" style="margin-top: 0px;"/>`;
          dd = dd + `  <input type="text" name="${capabilityName}" value="${capabilityLabel}" style="border-style: none; font-family: Roboto, sans-serif !important; font-size: 13px !important;" onkeypress="capability_rename(event, '${adapterName}', '${capabilityName}')">`;
          dd = dd + `</button>`;
        }
      }
      dd = dd + '</div><hr class="Menu" style="margin-bottom: 0;">';

      // Adding Capabilities view.
      dd = dd + `<div id="cap_view_${adapterName}" class="capview">`;
      dd = dd + `  <div class="field row">`;
      dd = dd + `    <label for="captype_${adapterName}">Capability type:</label>`;
      dd = dd + `    <select id="captype_${adapterName}" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 90%; height: 35px; margin-bottom: 20px;" onchange="device_cap_view_type_change('${adapterName}')">`;
      dd = dd + `    <option value="button">Button</option><option value="switch">Switch</option><option value="slider">Slider</option><option value="textlabel">textlabel</option><option value="image">image</option><option value="large image">large image</option></select></div>`;
      dd = dd + `  <div class="field row">`;
      dd = dd + `    <label for="capname_${adapterName}">Capability name:</label>`;
      dd = dd + `    <input  id="capname_${adapterName}" type="text" placeholder="Button name" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 90%; height: 23px; margin-bottom: 20px;"/></div>`;
      dd = dd + `  <div class="field row" id="capslidermin_${adapterName}" style="display: none;">`;
      dd = dd + `    <label for="capslider_min_${adapterName}">Slider minimum value:</label>`;
      dd = dd + `    <input  id="capslider_min_${adapterName}" type="number" value="0" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 90%; height: 32px; margin-bottom: 20px;"/></div>`;
      dd = dd + `  <div class="field row" id="capslidermax_${adapterName}" style="display: none;">`;
      dd = dd + `    <label for="capslider_max_${adapterName}">Slider maximum value:</label>`;
      dd = dd + `    <input  id="capslider_max_${adapterName}" type="number" value="100" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 90%; height: 32px; "/></div>`;
      dd = dd + `  <div class="field row" id="capsliderunit_${adapterName}" style="display: none;">`;
      dd = dd + `    <label for="capslider_unit_${adapterName}">Slider unit:</label>`;
      dd = dd + `    <input  id="capslider_unit_${adapterName}" type="text" value="%" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 90%; height: 22px; margin-bottom: 20px;"/></div>`;
      dd = dd + `  <div class="field row" id="captextlabelvisible_${adapterName}" style="display: none;">`;
      dd = dd + `    <label for="captextlabel_visible_${adapterName}">Label name visible:</label><br>`;
      dd = dd + `    <input  id="captextlabel_visible_${adapterName}" type="checkBox" checked=true style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 22px; height: 22px;  margin-bottom: 20px;"/></div>`;
      dd = dd + `  <div class="saveCapability" onclick="device_cap_save('${adapterName}')" id="cap_savebtn_${adapterName}">SAVE</div>`;
      dd = dd + `  <div class="cancelCapability" onclick="device_cap_view_hide('${adapterName}')" id="cap_savebtn_${adapterName}">CANCEL</div>`;
      dd = dd + ` </div>`;
      dd = dd + `<div id="capgrp_view_${adapterName}" class="capview">`;
      dd = dd + `  <div class="addCapability" onclick="device_capgrp_save('${adapterName}', 'mediacontrolls')\">Add media controlls.</div>`;
      dd = dd + `  <div class="addCapability" onclick="device_capgrp_save('${adapterName}', 'digits')\">Add digits.</div>`;
      dd = dd + `  <div class="addCapability" onclick="device_capgrp_save('${adapterName}', 'directions')\">Add cursor controlls.</div>`;
      dd = dd + `  <div class="addCapability" onclick="device_capgrp_save('${adapterName}', 'power')\">Add power controlls.</div>`;
      dd = dd + `  <div class="addCapability"><br></div>`;
      dd = dd + `  <div class="addCapability" onclick="device_capgrp_view_hide('${adapterName}')\">Cancel</div>`;
      dd = dd + `</div>`;
      dd = dd + `<div class="addCapability" onclick="device_cap_view_show('${adapterName}')" id="cap_addbtn_${adapterName}"><i class="fa fa-plus-circle"></i> Add a capability...</div>`;
      dd = dd + `<div class="addCapability" onclick="device_capgrp_view_show('${adapterName}')" id="capgrp_addbtn_${adapterName}"><i class="fa fa-plus-circle"></i> Add a capability group...</div>`;

      document.getElementById("jsonconfig").value = JSON.stringify(Settings_database);
      document.getElementById("DeviceCapabilities").innerHTML = dd;
    }
  }
}

function getDeviceIconPath(device) {
  if (typeof device.icon == "undefined") {
    return `ico/ico_${device.type}.png`;
  } else {
    return `ico/ico_${device.icon}.png`;
  }
}

///////////////////////////////////////
// Display all virtual devices.
///////////////////////////////////////
function devices_refresh_display() {
  let dd = ""; //Display Devices Generated HTML
  dd = dd + `<h1 class="h1">Virtual devices</h1>`;
  dd = dd + `<hr class="Menu" style="margin-bottom: 0;">`;
  dd = dd + `<div class="field row" style="background-color: #fff; margin: 0; width: 100%;left: 0px; margin-bottom: 2em;">`;
  for (let i in Settings_database) {
    dd = dd + `<button class="mi" onclick="device_view_selection('${Settings_database[i].adapterName}')" style="height: 48px !important;">`;
    dd = dd + `  <img class="cicon" src="${getDeviceIconPath(Settings_database[i])}" />`;
    dd = dd + `  <span class="mt" style="margin-top: 10px;">${Settings_database[i].name}</span><br>`;
    dd = dd + `  <span class="mt" style="font-size: 10px;color: #673ab7; margin-top: -15px;">${Settings_database[i].manufacturer}</span>`;
    dd = dd + `</button>`;
    dd = dd + `<hr class="subMenu" style="margin-bottom: 0;">`;
  }
  dd = dd + `<hr class="Menu" style="margin-bottom: 0;">`;
  dd = dd + `</div>`;

  document.getElementById("jsonconfig").value = JSON.stringify(Settings_database);
  document.getElementById("Devices").innerHTML = dd;
}

///////////////////////////////////////
// Display Settings
///////////////////////////////////////
function settings_refresh_display() {
  let dd = "";
  dd = dd + `<hr class="Menu" style="margin-bottom: 0;">`;
  dd = dd + `<div class="field row" style="background-color: #fff; margin: 0; width: 100%;left: 0px;">`;
  for (let i in Settings_brains) {
    if (i > 0) {
      dd = dd + `<hr class="subMenu" style="margin-bottom: 0;">`;
    }

    dd = dd + `<button class="mi" style="height: 48px !important;">`; //
    dd = dd + `  <img class="ciconr" src="ico/ico_bin.png" onclick="settings_brain_delete('${Settings_brains[i].host}')">`;
    if (Settings_brains[i].available) {
      dd = dd + `  <img class="cicon" src="ico/ico_brain.png" style="margin-top: 12px; "/>`;
      dd = dd + `  <span class="mt" style="margin-top: 10px;">${Settings_brains[i].fullname}</span>`;
    } else {
      dd = dd + `  <img class="cicon" src="ico/ico_brain_offline.png" style="margin-top: 12px; "/>`;
      dd = dd + `  <span class="mt" style="margin-top: 10px; color: #D52000;">${Settings_brains[i].fullname} -Offline-</span><br>`;
    }
    dd = dd + `  <span class="mt" style="font-size: 10px;color: #673ab7; margin-top: -15px;">${Settings_brains[i].host}</span>`;
    dd = dd + `</button>`;
  }
  dd = dd + `<hr class="Menu" style="margin-bottom: 0;">`;
  dd = dd + `</div>`;
  document.getElementById("brains").innerHTML = dd;
}
