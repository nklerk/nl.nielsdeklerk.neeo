'use strict'
const Homey = require('homey');

module.exports = [{
    description:	'Discover NEEO Brains',
    method: 		'GET',
    path:			'/discover/',
    fn: function( callback, args ){
        Homey.app.apiDiscover();
    }
}]