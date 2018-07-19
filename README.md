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

## Features

virtual devices:

- Create virtual devices and make them available to NEEO.
- Provide the virtual device with a selectable device type. (light, TV, etc...)
- Add buttons to your virtual devices.
- Add sliders to your virtual devices.
- Add switches to your virtual devices.
- Add textlabels to your virtual devices.
- Add images to your virtual devices.
- Add predefined media buttons to your virtual devices.
- Add predefined digit buttons to your virtual devices.
- Add predefined power buttons to your virtual devices.
- Add predefined navigation buttons to your virtual devices.
- Added virtual devices contain a default set of buttons.

When... flow cards:

- "A button is pressed." This card is triggered when a button of a virtual device is pressed.
- "A switch changed state." This card is triggered when a switch of a virtual device has changed state.
- "A slider is changed." This card is triggered when a slider of a virtual device is changed.
- "Event triggered." This card is triggered when a NEEO event is triggered. (recipe activated, button pressed, slider changed, etc...)

...And... flow cards:

- "Recipe is|isn't active." This card will condition a recipe being active or deactive.

...Then flow cards:

- "Activate a recipe." This card will start (Activate) the selected recipe.
- "Shutdown a recipe." This card will shutdown (deactivate) the selected recipe.
- "Shutdown all recipes." This card will shutdown all recipes.
- "Press a button." This card will press the selected button on the NEEO remote.
- "Change a Switch." This card will set the selected switch on the NEEO remote to On/Off.
- "Change a Slider." This card will set the selected slider on the NEEO remote to a specific value.
- "Inform slider state. (Percentage)" This card will inform the NEEO remote user interface of the given value in percentage for the selected virtual device slider.
- "Inform slider state. (Value)" This card will inform the NEEO remote user interface of the new value for the selected virtual device slider.
- "Inform switch state." This card will inform the NEEO remote user interface of the new value for the selected virtual device switch.
- "Inform label or image state." This card will inform the NEEO remote user interface of the new value for the selected virtual device label or set the image based on a URL or image tag.
- "Blink the brain LED." This card will blink the LED of the selected NEEO brain (every x time blinks for 2 seconds.)

# To Do

- Adding feature to check specific sensor values in NEEO.
- Adding favorite editing tool.
- Adding a tool to debug/test ir commands.
- setting brain's as seperate devices to Homey.
- decreased amount of logging.

# Changelog.

## Version 0.51.6

- Code formatting and cleaning.
- Bugfix, Notifications on a multibrain setup.
- Updated new notification methods for NEEO Release 0.51.x
- Fixed channel favorites settings page bug.

## Version 0.50.2

- Added slider minimum value.
- Added function while adding a new txtlabel, checkbox to hide/show label name.
- Added new device type "CLIMA"
- Added feature to select a custom icon while adding a new device.

## Version 0.50.1

- Fixed a bug in the favourite feature.
- Added new device type "MUSICPLAYER"
- Removed predefined TUNER capabilities from MEDIAPLAYER. can still be added manually. Existing drivers will be untouched.
- Removed predefined VOLUME capabilities from MEDIAPLAYER. can still be added manually. Existing drivers will be untouched.

## Version 0.49.5

- removed depricated buttons 'SKIP BACKWARD' and 'SKIP FORWARD' for new virtual devices.

## Version 0.49.4

- Favorite edit tool. (Settings-> NEEO-> Configuration -> Brain, Favorites ->)
- Included "specificname" SDK feature. New virtual devices won't be added as MEDIA or GAME but with their specific name.
- Bug fixes.

## Version 0.48.3

- bug fix, A copy past one.
- Update Firmware card.
- Re added a delete virtual device feature to the app settings. thanks for reporting Chris Sesier!

## Version 0.48.2

- Minor change to the offline brain icon. now has no status led.
- Minor change to the image icon.
- Fixed NEEO Events. should work again.
- Added Firmware check. (...And... Card)
- Less logging for event registers.
- Fixed settings information button, Wrong Icon removed.
- Show device icon in settings device view.
- Tested on firmware 0.48.13

## Version 0.48.1 - Beta

- Fixed some typo's thanks to Mark Swift.
- Fixed device naming in Homey settings. thanks to Mark Swift.
- App settings UI changes.
- App settings can now be used with Homey AppV2
- Fixed possible memory leak
- Reduced stress on NEEO brain and Homey
- Detect when a brain is unreachable.
- Detect when a brain is reachable again.
- Only register homey as NEEO device database when needed.
- Only register forward events when needed.
- Fixed a bug where discovered data was not properly saved.
- Changed to HTTPmin node package for better promise handling.

## Version 0.48.0 - Beta

This has been a huge change and issues are to be expected.

- Changed from Homey SDKv1 to SDKv2
- Settings page now show more system information details.
- Support base64 images (image Tag) to NEEO. just drag a image tag in the "Update textlabel or image state." card.

## Version 0.47.17

- Fixed an issue that would happen when searching a device in NEEO when no virtual devices where pressent on Homey.
- Fixed an issue that would happen when searching capabilities in Homey when no virtual devices where pressent.
- Fixed an issue that would happen when getting all devices in Homey when no virtual devices where pressent.
- Fixed an issue that could happen while retreving brain configuration.

## Version 0.47.16

- Fixed an issue where selecting a button would crash the app.

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

- Fixed an issue when NEEO requests a unknown capability.

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
- Added textlabels as capability, You can now display textual inforamation. like what did homey say :-)
- Cleaned settings code.
- Changed icons on app settings
- Added textlabel icon for app settings.
- Changed initial bonjour interval from unlimited every 10 seconds to 10 times 1 minute.

## Version 0.7.5

- Default capabilities will now be added when adding a new virtual device.
- Settings page look and feel changed.
- Added a download configuration button so you can make a backup.
- Added setting to view connected NEEO brains.
- Added discovery button to manually discover NEEO brains.
- Added a delete NEEO brain function to settings.

## Version 0.7.4

- Fixed a bug where switches didn't work.
- Changed name of "drivers" to "Virtual Devices"
- Fixed a bug that causes bonjour error's.
- Added a way to turn off all active recipies.

## Version 0.7.3

- minor debug log changes.
- Changed re registering to rediscovery/reconnect syclus of 10 Minutes.

## Version 0.7.2

- fixed a bug that caused an issue when using a multi brain setup

## Version 0.7.1

- First public beta release.
