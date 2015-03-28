'use strict';

module.exports = function (app) {
	var slot = require('../../app/controllers/slot');
	var pH = require('../utils/promiseHandler');

	app.route('/spin/:deviceId/:bet')
		.get(pH.jsonp(slot.spin));

	app.route('/purchase/:deviceId')
		.post(pH.jsonp(slot.purchase));

	app.route('/balance/:deviceId')
		.get(pH.jsonp(slot.balance));

	app.route('/balanceWithRBAward/:deviceId')
		.get(pH.jsonp(slot.balanceWithRBAward));

	app.route('/admin/resetReturnBonus/:deviceId')
		.get(pH.jsonp(slot.resetReturnBonus));

	app.route('/admin/setOutcome/:deviceId/:outcome')
		.get(pH.jsonp(slot.setOutcome));

	app.route('/admin/setBalance/:deviceId/:balance')
		.get(pH.jsonp(slot.setBalance));

	app.param('deviceId', pH.param(slot.userByDeviceId, 'user'));
};
