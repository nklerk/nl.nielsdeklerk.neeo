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
      //dd = dd + `<i class="fa fa-trash-o faRight" style="font-size: 24px; color: red;" onclick="device_remove('${adapterName}')"></i>`;
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
          //dd = dd + `  <i class="fa fa-trash-o faRight" style="font-size: 24px;" onclick="capability_remove('${adapterName}', '${capabilityName}')"></i>`;
          //dd = dd + `  <i class="faLeft" style="font-size: 11px; left: 75%; margin-top:6px; color: #CCCBD0;" onclick="capability_rename('${adapterName}', '${capabilityName}')">Rename</i>`;
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
    //dd = dd + `  <i class="fa fa-angle-right faRight" style="font-size: 24px;margin-top: 12px;"></i>`;
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
    //dd = dd + `  <i class="fa fa-trash-o faRight" style="font-size: 24px;    margin-top: 12px;" onclick="settings_brain_delete('${Settings_brains[i].host}')"></i>`;
    dd = dd + `  <img class="ciconr" src="ico/ico_bin.png" onclick="settings_brain_delete('${Settings_brains[i].host}')">`;
    if (Settings_brains[i].available) {
      dd = dd + `  <img class="cicon" src="ico/ico_brain.png" style="margin-top: 12px; "/>`;
      dd = dd + `  <span class="mt" style="margin-top: 10px;">${Settings_brains[i].fullname}</span>`;
      //dd = dd + `  <span class="mt" style="margin-top: 10px;"><a href="favorites.html?BrainIP=${Settings_brains[i].ip}" style="right: 0px; position: absolute; color: #CCCBD0; margin-right: 100px;">Edit favorites</a></span><br>`;
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

function gui_show_migration() {
  let dd = "";
  dd = dd + `<div class="field row" style="background-color: #ff0;margin: 0; margin-top: 40px; width: 100%;left: 0px;"><br>`;
  dd = dd + `To support new features, a change in the device handling between Homey and NEEO is neccesary.<br>`;
  dd = dd + `The needed change will impact the working of the currently installed virtual devices on your NEEO.<br>`;
  dd = dd + `As i obviously don't want to break someone's NEEO intergration, i let you chose when you want to make the needed changes.<br><br>`;
  dd = dd + ` - After the change the currently installed homey devices won't work.<br>`;
  dd = dd + ` - Devices need to be removed from NEEO and then need to be re-added.<br>`;
  dd = dd + ` - The change wil only impact devices installed on NEEO that are hosted by Homey. (Virtual Devices)<br>`;
  dd = dd + ` - Untill you make the change there is no impact.<br>`;
  dd = dd + ` - The change is needed for the driver update feature and upcomming features, when changing a virtual devices capabilities it will directly reflect on the NEEO.<br><br>`;
  dd = dd + `Press the button below to make the change<br>`;
  dd = dd + `<button onclick="upgradeToSDKv1()">Make the change</button>`;
  dd = dd + `</div>`;

  document.getElementById("Logo").innerHTML = dd;
}

///////////////////////////////////////
// Display brain information
///////////////////////////////////////
/* 
function settings_brains_selection() {
  let selection = document.getElementById("brains").value;
  for (let i in Settings_brains) {
    if (Settings_brains[i].host === selection) {
      var options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
      };
      var changedate = new Date(Settings_brains[i].brainConfiguration.lastchange);

      let systemInfoUrl = "http://" + Settings_brains[i].ip + ":3000/v1/systeminfo";
      fetch(systemInfoUrl)
        .then(res => res.json())
        .then(systemInfo => {
          let dd = "";
          dd = dd + "";
          dd = dd + '<b class="bsh"> Hostname:    </b><div class="bsi"> ' + Settings_brains[i].host + "</div><br> ";
          dd = dd + '<b class="bsh"> IP:          </b><div class="bsi"> ' + Settings_brains[i].ip + "</div><br>";
          dd = dd + '<b class="bsh"> Version:     </b><div class="bsi"> ' + systemInfo.version + "</div><br>";
          dd = dd + '<b class="bsh"> Memory:      </b><div class="bsi"> <progress value="' + (systemInfo.totalmem - systemInfo.freemem) + '" max="' + systemInfo.totalmem + '"></progress> ' + Math.round(systemInfo.freemem / 1000000) + " MB Free</div><br>";
          dd = dd + '<b class="bsh"> Label:       </b><div class="bsi"> ' + Settings_brains[i].brainConfiguration.label + "</div><br>";
          dd = dd + '<b class="bsh"> Last change: </b><div class="bsi"> ' + changedate.toLocaleDateString("en-GB", options) + "</div><br>";
          dd = dd + '<b class="bsh"> CPU (1 Min. Avg.):</b><div class="bsi"><progress value="' + systemInfo.loadavgShort + '" max="1"></progress> ' + Math.round(systemInfo.loadavgShort * 50) + "%</div><br>";
          dd = dd + '<b class="bsh"> CPU (5 Min. Avg.):</b><div class="bsi"><progress value="' + systemInfo.loadavgMid + '" max="1"></progress> ' + Math.round(systemInfo.loadavgMid * 50) + "%</div><br>";
          dd = dd + '<b class="bsh"> CPU (15 Min. Avg.):</b><div class="bsi"><progress value="' + systemInfo.loadavgLong + '" max="1"></progress> ' + Math.round(systemInfo.loadavgLong * 50) + "%</div><br>";
          document.getElementById("braininfo").innerHTML = dd;
          setTimeout(settings_brains_selection, 20000);
        })
        .catch(err => {
          throw err;
        });
    }
  }
} // */
