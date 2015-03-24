'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Purchase = mongoose.model('Purchase'),
	l = require('../utils/logging'),
	_ = require('lodash');

exports.balance = function (req) {
	return {success:true, balance: req.user.balance};
};

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSym(exclude, exclude2) {
	var syms = [1, 2, 3, 4, 5, 6];
	if (exclude) {
		_.remove(syms, function(n) {return n===exclude;});
	}
	if (exclude2) {
		_.remove(syms, function(n) {return n===exclude2;});
	}
	return syms[getRandomInt(0,syms.length-1)];
}

function all(value) {
	return function() {
		return [value, value, value];
	};
}

function anySingle(value) {
	return function() {
		var arr = [];
		var pos = getRandomInt(0,2);
		arr[pos] = value;
		arr[(pos+1)%3] = getRandomSym();
		if (arr[(pos+1)%3] === arr[pos]) {
			arr[(pos+2)%3] = getRandomSym(value);
		} else {
			arr[(pos+2)%3] = getRandomSym();
		}
		return arr;
	};
}

function lose() {
	var arr = [];
	arr[0] = getRandomSym(6);
	arr[1] = getRandomSym(6);
	if (arr[0] === arr[1]) {
		arr[2] = getRandomSym(6, arr[0]);
	} else {
		arr[2] = getRandomSym(6);
	}
	return arr;
}


var SPIN_PROBS =
	[
		{chance: 0.0000715, reels:all(1), payout: 2000},
		{chance: 0.0010000, reels:all(2), payout: 60},
		{chance: 0.0010000, reels:all(3), payout: 50},
		{chance: 0.0010000, reels:all(4), payout: 40},
		{chance: 0.0100000, reels:all(5), payout: 25},
		{chance: 0.0143000, reels:all(6), payout: 10},
		{chance: 0.1500000, reels:anySingle(6), payout: 2},
		{chance: 0.8226285, reels:lose, payout: 0}
	];



exports.spin = function (req) {
	var user = req.user;
	var bet = parseInt(req.param('bet'));
	if (bet <= 0 || bet > user.balance) {
		return {success:false, message: 'invalid bet amount '+bet};
	}
	var rand = Math.random();
	var runningProb = 0;
	var outcome = null;
	for(var i = 0 ; i < SPIN_PROBS.length; i++) {
		runningProb += SPIN_PROBS[i].chance;
		if (rand <= runningProb) {
			outcome = SPIN_PROBS[i];
			break;
		}
	}
	var winnings = outcome.payout*bet;
	var reels = outcome.reels();
	user.balance = user.balance - bet + winnings;
	return user.savePromise().then(function (user) {
		return {
			success:true,
			winnings:winnings,
			reels:reels,
			newBalance: user.balance
		};
	});
};

exports.purchase = function(req) {
	var user = req.user;
	var quantity = req.body.quantity;
	user.balance += quantity;

	return Purchase.create({
		user: user,
		quantity: quantity,
		data: req.body
	}).then(function() {
		return user.savePromise().then(function(newUser) {
			return {
				success:true,
				newBalance: user.balance
			};
		});
	});
};

exports.userByDeviceId = function(req, deviceId) {
	return User.findOne({identifierForVendor: deviceId}).exec().then(
		function(user) {
			if (user) {
				return user;
			}
			return User.create({
				identifierForVendor: deviceId,
				balance: 1000
			});
		}
	);
};
