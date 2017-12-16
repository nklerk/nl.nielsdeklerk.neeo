let Settings_database = [];
let Settings_brains = [];
let Settings_ready;
const showUnsupported = false;
const sellectionoptions = [
    { value: 'ACCESSOIRE', name: 'Accessoire', supported: true },
    { value: 'LIGHT', name: 'Light', supported: true },
    { value: 'TV', name: 'Television', supported: true },
    { value: 'DVD', name: 'DVD Player', supported: true },
    { value: 'VOD', name: 'Video on demand', supported: true },
    { value: 'PROJECTOR', name: 'Projector', supported: true },
    { value: 'DVB', name: 'DVB', supported: true },
    { value: 'AVRECEIVER', name: 'A/V Receiver', supported: true },
    { value: 'AUDIO', name: 'Audio', supported: true },
    { value: 'HDMISWITCH', name: 'HDMI Switch', supported: false },
    { value: 'GAMECONSOLE', name: 'Game Console', supported: true },
    { value: 'MEDIAPLAYER', name: 'Media Player', supported: true },
    { value: 'SOUNDBAR', name: 'Soundbar', supported: false },
    { value: 'TUNER', name: 'Tuner', supported: false },
    { value: 'THERMOSTAT', name: 'Thermostat', supported: false },
    { value: 'CLIMA', name: 'climate control', supported: false }
];


////////////////////////////////////////
// Homey Functions
////////////////////////////////////////

function onHomeyReady( HomeyReady){
    Homey = HomeyReady;
    console.log("Get Ready...");
    Homey.ready();
    console.log("Ready");
    Homey.get('myDevices', function( err, Devices ) {
        console.log(Devices);
        if( err ) {
            console.log(err);
        }
     });
    readsettings();
    addDeviceTypeOptions();
}


function addDeviceTypeOptions () {
    var optStr = '';
    for (const i in sellectionoptions) {
        if (showUnsupported === true || sellectionoptions[i].supported === true) {
            optStr = optStr + '<option value="'+sellectionoptions[i].value+'">'+sellectionoptions[i].name+'</option>';
        }
    }
    document.getElementById('AddDevice_Type').innerHTML = optStr;
}


function readsettings(){
    readMyDevices();
    readMyBrains();
}


function readMyDevices() {
    Homey.get('myDevices', function(err, Devices){
        if (typeof Devices !== 'undefined') {
            if (Devices === null){
                Settings_database = [];
            } else {
                Settings_database = Devices
            }
            devices_refresh_display();                 
        } else { 
            setTimeout(readMyDevices, 300);
        }
    });
}




function readMyBrains() {
    Homey.get('neeoBrains', function(err, NEEObrains){
        if (typeof NEEObrains !== 'undefined') {
            if (Settings_brains != NEEObrains){
                Settings_brains = NEEObrains   
                settings_refresh_display();
            }
        } else { 
            Settings_brains = [];
            setTimeout(readMyBrains, 300);
        }
    });
} 


////////////////////////////////////////
// General GUI
////////////////////////////////////////


function gui_view_selection(displayWindow){
    if (displayWindow == 'devices') {
        document.getElementById('Devices_view').style.display = 'block';
        devices_refresh_display();
    } else {
        document.getElementById('Devices_view').style.display = 'none';
    }

    if (displayWindow == 'device') {
        document.getElementById('Device_view').style.display = 'block';
        devices_refresh_display();
    } else {
        document.getElementById('Device_view').style.display = 'none';
    }
    
    if (displayWindow == 'info') {
        document.getElementById('Info_view').style.display = 'block';
    } else {
        document.getElementById('Info_view').style.display = 'none';
    }
    
    if (displayWindow == 'adddevice') {
        document.getElementById('AddDevice_view').style.display = 'block';
    } else {
        document.getElementById('AddDevice_view').style.display = 'none';
    }

    if (displayWindow == 'settings') {
        document.getElementById('Settings_view').style.display = 'block';
        settings_refresh_display();
    } else {
        document.getElementById('Settings_view').style.display = 'none';
    }

    if (displayWindow == 'menu') {
        document.getElementById('Menu_view').style.display = 'block';
    } else {
        document.getElementById('Menu_view').style.display = 'none';
    }
} // change active view.


////////////////////////////////////////
// ADD Devices View
////////////////////////////////////////


function AddDecice_save(){
    let mydevice = newDevice(document.getElementById('AddDevice_Manufactorer').value, document.getElementById('AddDevice_Name').value, document.getElementById('AddDevice_Type').value);
    Settings_database.push(mydevice);
    device_capgrp_from_devicetype(mydevice.adapterName,mydevice.type);
    Homey.set('myDevices', Settings_database);
    AddDecice_clear()
} // GUI Add device save button.


function AddDecice_clear(){
    document.getElementById('AddDevice_Manufactorer').value = ''
    document.getElementById('AddDevice_Name').value = ''
    gui_view_selection('devices')
} // GUI Add device cancel button.


////////////////////////////////////////
// Devices View
////////////////////////////////////////


function device_cap_view_show(adapterName){
    document.getElementById('cap_view_' + adapterName).style.display = 'block';
    document.getElementById('cap_addbtn_' + adapterName).style.display = 'none';
    document.getElementById('capgrp_addbtn_' + adapterName).style.display = 'none';
}


function device_cap_view_hide(adapterName){
    document.getElementById('cap_view_' + adapterName).style.display = 'none';
    document.getElementById('cap_addbtn_' + adapterName).style.display = 'block';
    document.getElementById('capgrp_addbtn_' + adapterName).style.display = 'block';
}


function device_capgrp_view_show(adapterName){
    document.getElementById('capgrp_view_' + adapterName).style.display = 'block';
    document.getElementById('cap_addbtn_' + adapterName).style.display = 'none';
    document.getElementById('capgrp_addbtn_' + adapterName).style.display = 'none';
}


function device_capgrp_view_hide(adapterName){
    document.getElementById('capgrp_view_' + adapterName).style.display = 'none';
    document.getElementById('cap_addbtn_' + adapterName).style.display = 'block';
    document.getElementById('capgrp_addbtn_' + adapterName).style.display = 'block';
}


function device_cap_view_type_change(adapterName){
    if (document.getElementById('captype_' + adapterName).value == 'slider') {
        document.getElementById('capslider_' + adapterName).style.display = 'block';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'block';
        document.getElementById('capname_' + adapterName).value = 'Volume';
    } 
    if (document.getElementById('captype_' + adapterName).value == 'button') {
        document.getElementById('capslider_' + adapterName).style.display = 'none';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'none';
        document.getElementById('capname_' + adapterName).value = 'Power On';
    }
    if (document.getElementById('captype_' + adapterName).value == 'switch') {
        document.getElementById('capslider_' + adapterName).style.display = 'none';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'none';
        document.getElementById('capname_' + adapterName).value = 'Power'
    }
    if (document.getElementById('captype_' + adapterName).value == 'textlabel') {
        document.getElementById('capslider_' + adapterName).style.display = 'none';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'none';
        document.getElementById('capname_' + adapterName).value = 'Text label:'
    }
    if (document.getElementById('captype_' + adapterName).value == 'image') {
        document.getElementById('capslider_' + adapterName).style.display = 'none';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'none';
        document.getElementById('capname_' + adapterName).value = 'Small image'
    }
    if (document.getElementById('captype_' + adapterName).value == 'large image') {
        document.getElementById('capslider_' + adapterName).style.display = 'none';
        document.getElementById('capsliderunit_' + adapterName).style.display = 'none';
        document.getElementById('capname_' + adapterName).value = 'Large Image'
    }
}


function device_cap_save(adapterName){
    let cname = document.getElementById('capname_' + adapterName).value
    let ctype = document.getElementById('captype_' + adapterName).value
    let slmax = document.getElementById('capslider_max_' + adapterName).value
    let slunit = document.getElementById('capslider_unit_' + adapterName).value
    device_add_cap(adapterName, cname, ctype, slmax, slunit, true);
}


function device_add_cap(adapterName, cname, ctype, slmax, slunit, alert){
    for (let i in Settings_database) {
        if (Settings_database[i].adapterName === adapterName) {
            let found = 0
            for (let z in Settings_database[i].capabilities) {
                if (Settings_database[i].capabilities[z].label == cname){ found = found + 1}
            }
            if (found > 0) {
                if (alert == true) {alert("There is allready a capability named: " + cname);}
            }else {
                if (ctype == 'slider')      { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_slider(Settings_database[i], cname, [0,Number(slmax)], slunit)) }
                if (ctype == 'button')      { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_button(Settings_database[i], cname)) }
                if (ctype == 'switch')      { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_switch(Settings_database[i], cname)) }
                if (ctype == 'textlabel')   { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_textlabel(Settings_database[i], cname)) }
                if (ctype == 'image')       { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_image(Settings_database[i], cname, 'small')) }
                if (ctype == 'large image') { Settings_database[i].capabilities.push.apply(Settings_database[i].capabilities, newCapability_image(Settings_database[i], cname, 'large')) }
                Homey.set('myDevices', Settings_database);
                //devices_refresh_display()
                device_view_selection(adapterName);
            }
        }
    }
}


function device_capgrp_save(adapterName, capability){               
    switch (capability) {
        case "mediacontrolls":
            device_add_cap(adapterName, 'PLAY', 'button', 0, 0, false);
            device_add_cap(adapterName, 'PAUSE', 'button', 0, 0, false);
            device_add_cap(adapterName, 'STOP', 'button', 0, 0, false);
            device_add_cap(adapterName, 'SKIP BACKWARD', 'button', 0, 0, false);
            device_add_cap(adapterName, 'SKIP FORWARD', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FORWARD', 'button', 0, 0, false);
            device_add_cap(adapterName, 'PREVIOUS', 'button', 0, 0, false);
            device_add_cap(adapterName, 'NEXT', 'button', 0, 0, false);
            device_add_cap(adapterName, 'REVERSE', 'button', 0, 0, false);
            device_add_cap(adapterName, 'PLAY PAUSE TOGGLE', 'button', 0, 0, false);
            device_add_cap(adapterName, 'INFO', 'button', 0, 0, false);
            device_add_cap(adapterName, 'MY RECORDINGS', 'button', 0, 0, false);
            device_add_cap(adapterName, 'RECORD', 'button', 0, 0, false);
            device_add_cap(adapterName, 'LIVE', 'button', 0, 0, false);
            break;
        case "digits":
            device_add_cap(adapterName, 'DIGIT 0', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 1', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 2', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 3', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 4', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 5', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 6', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 7', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 8', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT 9', 'button', 0, 0, false);
            device_add_cap(adapterName, 'DIGIT SEPARATOR', 'button', 0, 0, false);
            break;
        case "directions":
            device_add_cap(adapterName, 'BACK', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CURSOR DOWN', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CURSOR LEFT', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CURSOR RIGHT', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CURSOR UP', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CURSOR ENTER', 'button', 0, 0, false);
            device_add_cap(adapterName, 'EXIT', 'button', 0, 0, false);
            device_add_cap(adapterName, 'HOME', 'button', 0, 0, false);
            device_add_cap(adapterName, 'MENU', 'button', 0, 0, false);
            break;
        case "power":
            device_add_cap(adapterName, 'POWER OFF', 'button', 0, 0, false);
            device_add_cap(adapterName, 'POWER ON', 'button', 0, 0, false);
            device_add_cap(adapterName, 'POWER TOGGLE', 'button', 0, 0, false);
            break;
        case "tuner":
            device_add_cap(adapterName, 'CHANNEL UP', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CHANNEL DOWN', 'button', 0, 0, false);
            device_add_cap(adapterName, 'CHANNEL SEARCH', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FAVORITE', 'button', 0, 0, false);
            device_add_cap(adapterName, 'GUIDE', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FUNCTION RED', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FUNCTION GREEN', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FUNCTION YELLOW', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FUNCTION BLUE', 'button', 0, 0, false);
            break;
        case "video":
            device_add_cap(adapterName, 'FORMAT 16:9', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FORMAT 4:3', 'button', 0, 0, false);
            device_add_cap(adapterName, 'FORMAT AUTO', 'button', 0, 0, false);
            break;
        case "volume":
            device_add_cap(adapterName, 'VOLUME UP', 'button', 0, 0, false);
            device_add_cap(adapterName, 'VOLUME DOWN', 'button', 0, 0, false);
            device_add_cap(adapterName, 'MUTE TOGGLE', 'button', 0, 0, false);
            break;
        case "input":
            device_add_cap(adapterName, 'INPUT TUNER 1', 'button', 0, 0, false);
            device_add_cap(adapterName, 'INPUT HDMI 1', 'button', 0, 0, false);
            device_add_cap(adapterName, 'INPUT HDMI 2', 'button', 0, 0, false);
            device_add_cap(adapterName, 'INPUT HDMI 3', 'button', 0, 0, false);
            device_add_cap(adapterName, 'INPUT HDMI 4', 'button', 0, 0, false);
            break;
        default:
            console.log("geen match");
    }
}


function device_capgrp_from_devicetype(adapterName, type){     
    switch (type) {
        case "TV":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"mediacontrolls");
            device_capgrp_save(adapterName,"tuner");
            device_capgrp_save(adapterName,"digits");
            device_capgrp_save(adapterName,"directions");
            device_capgrp_save(adapterName,"video");
            device_capgrp_save(adapterName,"volume");
            device_capgrp_save(adapterName,"input");
            break;
        case "DVD":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"mediacontrolls");
            device_capgrp_save(adapterName,"directions");
        case "VOD":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"mediacontrolls");
            device_capgrp_save(adapterName,"directions");
            break;
        case "ACCESSOIRE":
            device_capgrp_save(adapterName,"power");
            break;
        case "PROJECTOR":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"input");
            break;
        case "DVB":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"tuner");
            device_capgrp_save(adapterName,"directions");
            break;
        case "AVRECEIVER":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"volume");
            device_capgrp_save(adapterName,"input");
            break;
        case "AUDIO":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"volume");
            device_capgrp_save(adapterName,"input");
            break;
        case "HDMISWITCH":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"input");
            break;
        case "GAMECONSOLE":
            device_capgrp_save(adapterName,"power");
            break;
        case "MEDIAPLAYER":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"mediacontrolls");
            device_capgrp_save(adapterName,"tuner");
            device_capgrp_save(adapterName,"digits");
            device_capgrp_save(adapterName,"directions");
            device_capgrp_save(adapterName,"video");
            device_capgrp_save(adapterName,"volume");
            break;
        case "SOUNDBAR":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"volume");
            device_capgrp_save(adapterName,"input");
            break;
        case "TUNER":
            device_capgrp_save(adapterName,"power");
            device_capgrp_save(adapterName,"tuner");
            device_capgrp_save(adapterName,"digits");
            break;
        case "LIGHT":
            device_capgrp_save(adapterName,"power");
            device_add_cap(adapterName, "POWER_ALL_OFF", "button", 0, 0, false)
            device_add_cap(adapterName, "LIGHT", "switch", 0, 0, false)
            device_add_cap(adapterName, "BRIGHTNESS", "slider", 100, "%", false)
            break;
        case "THERMOSTAT":
            break;
        case "CLIMA":
            break;
        default:
            device_capgrp_save(adapterName,"power");
            console.log("geen match");
    }
}


function capability_remove(adapterName, Capname){
    //if(confirm("Are you sure you want to delete this capability?"))
    //{
        for (let i in Settings_database) {
            if (Settings_database[i].adapterName === adapterName) {
                let capabilities = []
                for (let z in Settings_database[i].capabilities) {
                    if (Settings_database[i].capabilities[z].name != Capname && Settings_database[i].capabilities[z].name != Capname + '_SENSOR'){
                        capabilities.push(Settings_database[i].capabilities[z])
                    }
                }
                Settings_database[i].capabilities = capabilities
            }
        }
        Homey.set('myDevices', Settings_database);
        device_view_selection(adapterName);
    //} 
}

function device_view_selection(adapterName) {
    gui_view_selection("device");
    document.getElementById("DeviceCapabilities").innerHTML = "";

    for (let i in Settings_database) {
        if(Settings_database[i].adapterName===adapterName){
            let dd = ""; //Display Devices Generated HTML
            dd = dd + '<h1 class="h1" style="font-size: 11px; margin-bottom:0;">'+Settings_database[i].name+'</h1>';
            dd = dd + '<h1 class="h1" style="font-size: 8px; margin-top: -10px; margin-bottom: 0px;">'+Settings_database[i].type+'</h1>';
            let c = 0;
            for (let ic in Settings_database[i].capabilities) {
                let ctype = Settings_database[i].capabilities[ic].type;
                if (ctype === 'slider' || ctype === 'button' || ctype === 'switch' || ctype === 'textlabel' || ctype === 'imageurl') {
                    if (c == 0) {
                        dd = dd + '<div style="background-color: #fff;">';
                        dd = dd + '<hr class="Menu" style="margin-bottom: 0;">';
                    } else {
                        dd = dd + '<hr class="subMenu" style="margin-bottom: 0;">';
                    };
                    c++;

                    let capabilityName = Settings_database[i].capabilities[ic].label
                    if (ctype === 'slider') { 
                        capabilityName = capabilityName + ' (' + Settings_database[i].capabilities[ic].slider.range[0] + '/' + Settings_database[i].capabilities[ic].slider.range[1] + ' ' + Settings_database[i].capabilities[ic].slider.unit + ')';
                    };

                    dd = dd + '<button class="mi">';
                    dd = dd + '  <i class="fa fa-trash-o faRight" style="font-size: 24px;" onclick="capability_remove(\'' + Settings_database[i].adapterName + '\', \'' + Settings_database[i].capabilities[ic].name + '\')"></i>';
                    dd = dd + '  <img class="cicon" src="ico/ico_' + Settings_database[i].capabilities[ic].type + '.png" style="margin-top: 0px;"/>';
                    dd = dd + '  <span class="mt">'+capabilityName+'</span><br>';
                    dd = dd + '</button>';
                }
            }
            dd = dd + '</div><hr class="Menu" style="margin-bottom: 0;">';



            // Capabilities...
            let adn = Settings_database[i].adapterName;
            dd = dd + '<div id="cap_view_' + adn + '" class="capview">';
            dd = dd + '  <div class="field row">';
            dd = dd + '    <label for="captype_' + adn + '">Capability type:</label>';
            dd = dd + '    <select id="captype_' + adn + '" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 260px;" onchange="device_cap_view_type_change(\'' + adn + '\')">';
            dd = dd + '    <option value="button">Button</option><option value="switch">Switch</option><option value="slider">Slider</option><option value="textlabel">textlabel</option><option value="image">image</option><option value="large image">large image</option></select></div>';
            dd = dd + '  <div class="field row">';
            dd = dd + '    <label for="capname_' + adn + '">Capability name:</label>';
            dd = dd + '    <input  id="capname_' + adn + '" type="text" value="Power On" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 240px;"/></div>';
            dd = dd + '  <div class="field row" id="capslider_' + adn + '" style="display: none;">';
            dd = dd + '    <label for="capslider_max_' + adn + '">Slider maximum value:</label>';
            dd = dd + '    <input  id="capslider_max_' + adn + '" type="number" value="100" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 240px;"/></div>';
            dd = dd + '  <div class="field row" id="capsliderunit_' + adn + '" style="display: none;">';
            dd = dd + '    <label for="capslider_unit_' + adn + '">Slider unit:</label>';
            dd = dd + '    <input  id="capslider_unit_' + adn + '" type="text" value="%" style="border: 0px solid #fff; border-bottom: 2px solid #ddd; background-color: #fff; border-radius: 4px; width: 240px;"/></div>';
            dd = dd + '  <div class="saveCapability" onclick="device_cap_save(\'' + adn + '\')" id="cap_savebtn_' + adn + '"><i class="fa fa-check"></i> Save</div>';
            dd = dd + '  <div class="cancelCapability" onclick="device_cap_view_hide(\'' + adn + '\')" id="cap_savebtn_' + adn + '"><i class="fa fa-remove"></i> Cancel</div>';
            dd = dd + '</div>';
            dd = dd + '<div id="capgrp_view_' + adn + '" class="capview">';
            dd = dd + '  <div class="addCapability" onclick="device_capgrp_save(\'' + adn + '\', \'mediacontrolls\')">Add media controlls.</div>';
            dd = dd + '  <div class="addCapability" onclick="device_capgrp_save(\'' + adn + '\', \'digits\')">Add digits.</div>';
            dd = dd + '  <div class="addCapability" onclick="device_capgrp_save(\'' + adn + '\', \'directions\')">Add cursor controlls.</div>';
            dd = dd + '  <div class="addCapability" onclick="device_capgrp_save(\'' + adn + '\', \'power\')">Add power controlls.</div>';
            dd = dd + '  <div class="addCapability"><br></div>';
            dd = dd + '  <div class="addCapability" onclick="device_capgrp_view_hide(\'' + adn + '\')">Cancel</div>';
            dd = dd + '</div>';
            dd = dd + '<div class="addCapability" onclick="device_cap_view_show(\'' + adn + '\')" id="cap_addbtn_' + adn + '"><i class="fa fa-plus-circle"></i> Add a capability...</div>';
            dd = dd + '<div class="addCapability" onclick="device_capgrp_view_show(\'' + adn + '\')" id="capgrp_addbtn_' + adn + '"><i class="fa fa-plus-circle"></i> Add a capability group...</div>';



            document.getElementById("jsonconfig").value = JSON.stringify(Settings_database)
            document.getElementById("DeviceCapabilities").innerHTML = dd;
        }
    }
}

///////////////////////////////////////
// Device view NEW
///////////////////////////////////////
function devices_refresh_display() {
    let dd = ""; //Display Devices Generated HTML
    dd = dd + '<h1 class="h1">Virtual devices<i style="font-size: 11px;"></h1>';
    dd = dd + '<hr class="Menu" style="margin-bottom: 0;">';
    dd = dd + '<div class="field row" style="background-color: #fff; margin: 0; width: 100%;left: 0px;">';
    for (let i in Settings_database) {
        dd = dd + '<button class="mi" onclick="device_view_selection(\''+Settings_database[i].adapterName+'\')">';
        dd = dd + '  <i class="fa fa-angle-right faRight" style="font-size: 24px;margin-top: 12px;"></i>';
        dd = dd + '  <img class="cicon" src="ico/ico_' + Settings_database[i].type + '.png" />';
        dd = dd + '  <span class="mt" style="margin-top: 10px;">'+Settings_database[i].name+'</span><br>';
        dd = dd + '  <span class="mt" style="font-size: 10px;color: #673ab7; margin-top: -15px;">'+Settings_database[i].manufacturer+'</span>';
        dd = dd + '</button>';
        dd = dd + '<hr class="subMenu" style="margin-bottom: 0;">';
    }
    dd = dd + '<hr class="Menu" style="margin-bottom: 0;">';
    dd = dd + '</div>';
    dd = dd + '';
    dd = dd + '';

    document.getElementById("jsonconfig").value = JSON.stringify(Settings_database)
    document.getElementById("Devices").innerHTML = dd;
}

////////////////////////////////////////
// Settigns View
////////////////////////////////////////


function settings_btn_discoverbrains(){
    Homey.api( 'GET', '/discover/');
    discover_brains_loop(0);
} 


function discover_brains_loop(count){
    if (count < 10){
        count = count + 1;
        setTimeout(discover_brains_loop, 500, count);
    } else {
        readMyBrains();
    }
}


function settings_refresh_display() {
    let dd = '';
    dd = dd + '<hr class="Menu" style="margin-bottom: 0;">';
    dd = dd + '<div class="field row" style="background-color: #fff; margin: 0; width: 100%;left: 0px;">';
    for (let i in Settings_brains) {
        console.log(Settings_brains[i]);
        if (i > 0){dd = dd + '<hr class="subMenu" style="margin-bottom: 0;">';}
        dd = dd + '<button class="mi">';
        dd = dd + '  <i class="fa fa-trash-o faRight" style="font-size: 24px;    margin-top: 12px;" onclick="settings_brain_delete(\'' + Settings_brains[i].host + '\')"></i>';
        dd = dd + '  <img class="cicon" src="ico/ico_brain.png" style="margin-top: 12px; "/>';
        //dd = dd + '  <span class="mt">'+Settings_brains[i].host +'</span><br>';
        dd = dd + '  <span class="mt" style="margin-top: 10px;">'+Settings_brains[i].fullname+'</span><br>';
        dd = dd + '  <span class="mt" style="font-size: 10px;color: #673ab7; margin-top: -15px;">'+Settings_brains[i].host+'</span>';
        dd = dd + '</button>';
    }
    dd = dd + '<hr class="Menu" style="margin-bottom: 0;">';
    dd = dd + '</div>';
    dd = dd + '';
    dd = dd + '';
    document.getElementById("brains").innerHTML = dd;
    //document.getElementById("braininfo").innerHTML = '';
    //document.getElementById('brains').style.display = 'block';
}


function settings_brains_selection(){
    let selection = document.getElementById("brains").value
    for (let i in Settings_brains) {
        if (Settings_brains[i].host === selection){
            var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour:'numeric', minute:'numeric', second:'numeric'};
            var changedate = new Date(Settings_brains[i].brainConfiguration.lastchange);
            
            let systemInfoUrl = 'http://'+Settings_brains[i].ip+':3000/v1/systeminfo';
            fetch(systemInfoUrl)
            .then(res => res.json())
            .then((systemInfo) => {
                let dd='';
                dd = dd + ''
                dd = dd + '<b class="bsh"> Hostname:    </b><div class="bsi"> '+Settings_brains[i].host+'</div><br> ';
                dd = dd + '<b class="bsh"> IP:          </b><div class="bsi"> '+Settings_brains[i].ip+'</div><br>';
                dd = dd + '<b class="bsh"> Version:     </b><div class="bsi"> '+systemInfo.version+'</div><br>';
                dd = dd + '<b class="bsh"> Memory:      </b><div class="bsi"> <progress value="'+ (systemInfo.totalmem - systemInfo.freemem)+'" max="'+ systemInfo.totalmem+'"></progress> '+Math.round(systemInfo.freemem/1000000)+' MB Free</div><br>';
                dd = dd + '<b class="bsh"> Label:       </b><div class="bsi"> '+Settings_brains[i].brainConfiguration.label+'</div><br>';
                dd = dd + '<b class="bsh"> Last change: </b><div class="bsi"> '+changedate.toLocaleDateString("en-GB",options)+'</div><br>';
                dd = dd + '<b class="bsh"> CPU (1 Min. Avg.):</b><div class="bsi"><progress value="'+systemInfo.loadavgShort+'" max="1"></progress> '+Math.round(systemInfo.loadavgShort*50)+'%</div><br>';
                dd = dd + '<b class="bsh"> CPU (5 Min. Avg.):</b><div class="bsi"><progress value="'+systemInfo.loadavgMid+'" max="1"></progress> '+Math.round(systemInfo.loadavgMid*50)+'%</div><br>';
                dd = dd + '<b class="bsh"> CPU (15 Min. Avg.):</b><div class="bsi"><progress value="'+systemInfo.loadavgLong+'" max="1"></progress> '+Math.round(systemInfo.loadavgLong*50)+'%</div><br>';
                document.getElementById("braininfo").innerHTML = dd;
                setTimeout(settings_brains_selection, 20000);
            })
            .catch(err => { throw err });
        }
    }
} // 

function settings_brain_delete(selection){
    let new_Settings_brains = [];
    for (let i in Settings_brains) {
        if (Settings_brains[i].host === selection){
            console.log('Deleting Brain '+selection+' from configuration');
        } else {
            new_Settings_brains.push(Settings_brains[i]);
        }
    }
    Homey.set('neeoBrains', new_Settings_brains);
    Settings_brains = new_Settings_brains;
    settings_refresh_display();
} // 


function settings_btn_saveconfig(){
    Settings_database = JSON.parse(document.getElementById("jsonconfig").value)
    Homey.set('myDevices', Settings_database);
    devices_refresh_display()
    gui_view_selection('devices')
} //


function settings_btn_download(){
    download('NEEO Configuration.json', document.getElementById('jsonconfig').value);
} //


function download(filename, text) {
    let pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        let event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
} //


function device_remove(adapterName){
    //if(confirm("Are you sure you want to delete this virtual device?"))
    //{
        let newSettings_database = []
        for (let i in Settings_database) {
            if (Settings_database[i].adapterName != adapterName) {newSettings_database.push(Settings_database[i])}
        }
        Settings_database = newSettings_database
        Homey.set('myDevices', Settings_database);
        devices_refresh_display()
        gui_view_selection('devices')
    //}  
} 


function clear_button(){
    Settings_database = []
    Homey.set('myDevices', Settings_database)
    devices_refresh_display()
    gui_view_selection('devices')
} 


function clear_brain_button(){
    Homey.set('neeoBrains', []);
    Settings_brains = [];
    settings_refresh_display()
} 


////////////////////////////////////////
// Neeo Objects.
////////////////////////////////////////
 

function newDevice(manufacturer, name, type) {
    let _newdevice = {};
    _newdevice.id = (Date.now() - 1512590738651);
    _newdevice.adapterName = 'homey_' + name.replace(/ /gm,"-") + '_' + _newdevice.id;
    _newdevice.type = type.toUpperCase();  
    _newdevice.manufacturer = manufacturer;
    _newdevice.name = name;
    _newdevice.tokens = "Homey";
    _newdevice.device = {name: name, tokens: ["Homey", "Athom"]};
    _newdevice.setup = {};
    _newdevice.capabilities = [];
    return (_newdevice);
}


function newCapability_button(device, name) {
    let _newCapability_button = {};
    _newCapability_button.type = 'button';
    _newCapability_button.name = name.toUpperCase();
    _newCapability_button.label = name; //my button
    _newCapability_button.path = "/device/" + device.adapterName + "/" + _newCapability_button.name;
    return ([_newCapability_button]);
}


function newCapability_slider(device, name, range, unit ) {
    let _newCapability_sensor = {};
    _newCapability_sensor.type = 'sensor';
    _newCapability_sensor.name = name.toUpperCase() + "_SENSOR"; 
    _newCapability_sensor.label = name;
    _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
    _newCapability_sensor.sensor = {type:"range"};
    _newCapability_sensor.sensor.range = range;    //"range":[0,200],  
    _newCapability_sensor.sensor.unit = unit;      //"unit":"%"
    _newCapability_sensor.sensor.value = 0;
    let _newCapability_slider = {};
    _newCapability_slider.type = 'slider';
    _newCapability_slider.name = name.toUpperCase();
    _newCapability_slider.label = name;
    _newCapability_slider.path = "/device/" + device.adapterName + "/" + _newCapability_slider.name;
    _newCapability_slider.slider = {type:"range"};
    _newCapability_slider.slider.sensor = _newCapability_sensor.name
    _newCapability_slider.slider.range = range;    //"range":[0,200],  
    _newCapability_slider.slider.unit = unit;      //"unit":"%"
    return ([_newCapability_sensor, _newCapability_slider]);
}

    
function newCapability_switch(device, name ) {
    let _newCapability_sensor = {};
    _newCapability_sensor.type = 'sensor'; 
    _newCapability_sensor.name = name.toUpperCase() + "_SENSOR"; 
    _newCapability_sensor.label = name;
    _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
    _newCapability_sensor.sensor = {type:"binary"}
    _newCapability_sensor.sensor.value = false;
    let _newCapability_switch = {};
    _newCapability_switch.type = 'switch';
    _newCapability_switch.name = name.toUpperCase();
    _newCapability_switch.label = name;
    _newCapability_switch.path = "/device/" + device.adapterName + "/" + _newCapability_switch.name;
    _newCapability_switch.sensor = _newCapability_sensor.name
    return ([_newCapability_sensor, _newCapability_switch]);
}


function newCapability_textlabel(device, name ) {
    let _newCapability_sensor = {};
    _newCapability_sensor.type = 'sensor';
    _newCapability_sensor.name = name.toUpperCase() + "_SENSOR"; 
    _newCapability_sensor.label = name;
    _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
    _newCapability_sensor.sensor = {type:"custom"}
    _newCapability_sensor.sensor.value = "My Text Here";
    let _newCapability_textlabel = {};
    _newCapability_textlabel.type = 'textlabel';
    _newCapability_textlabel.name = name.toUpperCase();
    _newCapability_textlabel.label = name;
    _newCapability_textlabel.path = "/device/" + device.adapterName + "/" + _newCapability_textlabel.name;
    _newCapability_textlabel.sensor = _newCapability_sensor.name
    return ([_newCapability_sensor, _newCapability_textlabel]);
}


function newCapability_image(device, name, size) {
    let _newCapability_sensor = {};
    _newCapability_sensor.type = 'sensor';
    _newCapability_sensor.name = name.toUpperCase() + "_SENSOR"; 
    _newCapability_sensor.label = name;
    _newCapability_sensor.path = "/device/" + device.adapterName + "/" + _newCapability_sensor.name;
    _newCapability_sensor.sensor = {type:"custom"}
    _newCapability_sensor.sensor.value = "My Text Here";
    let _newCapability_image = {};
    _newCapability_image.type = 'imageurl';
    _newCapability_image.name = name.toUpperCase();
    _newCapability_image.label = name;
    _newCapability_image.imageUri = null;
    _newCapability_image.size = size;
    _newCapability_image.path = "/device/" + device.adapterName + "/" + _newCapability_image.name;
    _newCapability_image.sensor = _newCapability_sensor.name
    return ([_newCapability_sensor, _newCapability_image]);
}