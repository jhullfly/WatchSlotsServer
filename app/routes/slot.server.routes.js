'use strict';

module.exports = function (app) {
	var slot = require('../../app/controllers/slot');
	var pH = require('../utils/promiseHandler');

	app.route('/spin/:deviceId/:bet')
		.get(pH.jsonp(slot.spin));

	app.route('/balance/:deviceId')
		.get(pH.jsonp(slot.balance));

	app.param('deviceId', pH.param(slot.userByDeviceId, 'user'));
};
