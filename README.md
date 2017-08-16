# NEEO

This app brings the best of NEEO and Homey together.

Controll every device or flow in Homey with the NEEO remote. 
Use sliders, buttons and switches to build your own virtual device and use the Homey flow editor to hook it up to all kinds of Homey apps.
The app supports feedback of information as well. Change the volume of your receiver and the slider on your remote will change in realtime.

Want to visualise your sensors or "what did homey say?", with this app you can inform the remote about all kinds of state changes including textual.
So what did homey say? you can see that on your remote.

Build virtual devices and make them availeble to NEEO.
Controll Homey Flows with your NEEO remote and controll your NEEO connected devices with Homey.

This code is developed with an actual neeo combo.
The NEEO Remote can be (Pre)ordered at https://neeo.com/pre-order/


Please note that this is not an official NEEO app made by NEEO and there will be no support from NEEO concerning this App.


You may leave me a donation if you love my work.
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="encrypted" value="-----BEGIN PKCS7-----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-----END PKCS7-----
">
<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/nl_NL/i/scr/pixel.gif" width="1" height="1">
</form>




## Features

virtual devices:

* Create virtual devices and make them available to NEEO.
* Provide the virtual device with a selectable device type. (light, TV, etc...)
* Add buttons to your virtual devices.
* Add sliders to your virtual devices.
* Add switches to your virtual devices.
* Add textlabels to your virtual devices.
* Add images to your virtual devices.
* Add predefined media buttons to your virtual devices.
* Add predefined digit buttons to your virtual devices.
* Add predefined power buttons to your virtual devices.
* Add predefined navigation buttons to your virtual devices.
* Added virtual devices contain a default set of buttons.


When... flow cards:

* "A button is pressed."      This card is triggered when a button of a virtual device is pressed.
* "A switch changed state."   This card is triggered when a switch of a virtual device has changed state.
* "A slider is changed."      This card is triggered when a slider of a virtual device is changed.
* "Event triggered."          This card is triggered when a NEEO event is triggered. (recipe activated, button pressed, slider changed, etc...)


...And... flow cards:

* "Recipe is|isn't active."    This card will condition a recipe being active or deactive.


...Then flow cards:

* "Activate a recipe."        This card will start (Activate) the selected recipe.
* "Shutdown a recipe."        This card will shutdown (deactivate) the selected recipe.
* "Shutdown all recipes."     This card will shutdown all recipes.
* "Press a button."           This card will press the selected button on the NEEO remote.
* "Change a Switch."          This card will set the selected switch on the NEEO remote to On/Off.  
* "Change a Slider."          This card will set the selected slider on the NEEO remote to a specific value.  
* "Inform slider state. (Percentage)"    This card will inform the NEEO remote user interface of the given value in percentage for the selected virtual device slider.
* "Inform slider state. (Value)"         This card will inform the NEEO remote user interface of the new value for the selected virtual device slider.
* "Inform switch state."                 This card will inform the NEEO remote user interface of the new value for the selected virtual device switch.
* "Inform label or image state."         This card will inform the NEEO remote user interface of the new value for the selected virtual device label or set the image based on a URL.
* "Blink the brain LED."                 This card will blink the LED of the selected NEEO brain (every x time blinks for 2 seconds.)


## To Do
- Migrating to homey-sdkv2
- Support base64encoded images to NEEO.
- redesign of settings UI.
- Adding actual system info to settings UI.
- Adding tools like favorite editing.
- Adding feature to check specific sensor values in NEEO.

# Changelog.
## Version 0.47.15
- Fixed an issue where the app would crash when no NEEO brains where found.
## Version 0.47.14
- Changed Version Numbering
- Added ...And... card recipe is active/deactive.
- Added ...then card blink NEEO Brain LED.
- New helpfull information added.
- Created individual node modules. (was one file)
- General code cleaning
- Neeo now support images! and so does this app.
- Fixed first time use issues.
- Fixed the use of percentage values. (0 to 1).
- A lot of smaller bug fixes.
## Version 0.9.4
- Fixed an issue with a corupted neeobrains save.
## Version 0.9.3
- Fixed an issue when NEEO requests a unknown capabilitie.
## Version 0.9.2
- Rewritten event notifications.
## Version 0.9.1
- Cleaned up a lot of code.
## Version 0.8.0
- Rework of MDNS Discovery.
- Bug Fixes
## Version 0.7.7
- Added token support (Tags)
## Version 0.7.6
- Fixed a critical bug that rendered all NEEO flows unusable.
- Added textlabels as capabilitie, You can now display textual inforamation. like what did homey say :-)
- Cleaned settings code.
- Changed icons on app settings
- Added textlabel icon for app settings.
- Changed initial bonjour interval from unlimited every 10 seconds to 10 times 1 minute.
## Version 0.7.5
- Default Capabilities will now be added when adding a new virtual device.
- Settings page look and feel changed.
- Added a download configuration button so you can make a backup.
- Added setting to view connected NEEO brains.
- Added discovery button to manually discover NEEO brains.
- Added a delete NEEO brain function to settings.
## Version 0.7.4
- Fixed a bug where switches didn't work.
- changed name of "drivers" to "Virtual Devices"
- Fixed a bug that causes bonjour error's.
- Added a way to turn off all active recipies.
## Version 0.7.3
- minor debug log changes.
- Changed re registering to rediscovery/reconnect syclus of 10 Minutes.
## Version 0.7.2
- fixed a bug that caused an issue when using a multi brain setup
## Version 0.7.1
- First public beta release.