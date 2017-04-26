# NEEO

This app brings the best of NEEO and Homey together.
Build custom drivers and install them on your NEEO,
Controll Flows with your NEEO remote and controll your NEEO connected devices with Homey.

The NEEO Remote can be (Pre)ordered at: https://neeo.com/


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
* Add predefined media buttons to your virtual devices.
* Add predefined digit buttons to your virtual devices.
* Add predefined power buttons to your virtual devices.
* Add predefined navigation buttons to your virtual devices.


Availeble triggers:

* When a button is pressed of any of the virtual devices.
* When a switch changed state of any of the virtual devices.
* When a slider changed value of any of the virtual devices.
* When a general NEEO event is triggered. (recipe activated, button pressed, slider changed, etc...)


Availeble actions:

* Activate a NEEO Recipe.
* Shutdown a NEEO Recipe (Power off).
* Press a button.
* Change the state of a switch.
* Change the state of a slider.
* Inform NEEO that a slider value of your virtual device has changed. (Provides visual feedback)
* Inform NEEO that a switch state of your virtual device has changed. (Provides visual feedback)



## Version 0.7.4
- Fixed a bug where switches didn't work.
- changed name of "drivers" to "Virtual Devices"
- Fixed a bug that causes bonjour error's.

## Version 0.7.3
- minor debug log changes.
- Changed re registering to rediscovery/reconnect syclus of 10 Minutes.

## Version 0.7.2
- fixed a bug that caused an issue when using a multi brain setup

## Version 0.7.1
- First public beta release.