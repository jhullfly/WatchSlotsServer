'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Purchase = mongoose.model('Purchase'),
	l = require('../utils/logging'),
	_ = require('lodash'),
	moment = require('moment');

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

var RETURN_PAYOUTS = [
	10, 20, 10, 20, 50, 20, 10, 100
];

function isTimeToAwardReturnBonus(user, nowDate) {
	// if we are in a different hour of the day or more then an hour between awards
	// then it is time to award.
	var now = moment(nowDate);
	return !user.lastReturnBonus ||
		now.hour() !== moment(user.lastReturnBonus).hour() ||
		now.diff(moment(user.lastReturnBonus), 'hours') >= 1;
}

function calcReturnBonus(user, nowDate) {
	if (isTimeToAwardReturnBonus(user, nowDate)) {
		var position = getRandomInt(1, 8);
		var winnings = RETURN_PAYOUTS[position-1];
		user.balance = user.balance+winnings;
		user.lastReturnBonus = nowDate;
		return {
			position: position,
			winnings: winnings,
			afterBonusBalance: user.balance
		};
	} else {
		return null;
	}
}

function nextReturnBonus(nowDate) {
	return moment(nowDate).add(1, 'hour').startOf('hour').toDate();
}

function getOutcome(user) {
	if (user.outcome) {
		return SPIN_PROBS[user.outcome-1];
	}
	var rand = Math.random();
	var runningProb = 0;
	for(var i = 0 ; i < SPIN_PROBS.length; i++) {
		runningProb += SPIN_PROBS[i].chance;
		if (rand <= runningProb) {
			return SPIN_PROBS[i];
		}
	}
	return null;
}

exports.balance = function (req) {
	var nowDate = new Date();
	var returnData = {
		success: true,
		balance: req.user.balance,
		bonusWaiting: isTimeToAwardReturnBonus(req.user, nowDate)
	};
	if (!returnData.bonusWaiting) {
		returnData.nextBonus = nextReturnBonus(nowDate);
	}
	return returnData;
};

exports.balanceWithRBAward = function (req) {
	var nowDate = new Date();
	var user = req.user;
	var returnData = {
		success:true,
		balance: user.balance,
		nextBonus: nextReturnBonus(nowDate)
	};
	var returnBonus = calcReturnBonus(user, nowDate);
	if (returnBonus) {
		returnData.returnBonus = returnBonus;
		return user.savePromise().then(function (user) {
			return returnData;
		});
	} else {
		return returnData;
	}
};

exports.spin = function (req) {
	var user = req.user;
	var bet = parseInt(req.param('bet'));
	if (bet <= 0 || bet > user.balance) {
		return {success:false, message: 'invalid bet amount '+bet};
	}
	var outcome = getOutcome(user);
	var winnings = outcome.payout*bet;
	var reels = outcome.reels();
	user.balance = user.balance - bet + winnings;
	var nowDate = new Date();
	var returnData = {
		success:true,
		winnings:winnings,
		reels:reels,
		newBalance: user.balance,
		nextBonus: nextReturnBonus(nowDate)
	};
	var returnBonus = calcReturnBonus(user, nowDate);
	if (returnBonus) {
		returnData.returnBonus = returnBonus;
	}
	return user.savePromise().then(function (user) {
		return returnData;
	});
};

var PRODUCTS = {
	'WatchSlotsTokenPurchase99':110,
	'WatchSlotsTokenPurchase499':600,
	'WatchSlotsTokenPurchase999':1500,
	'WatchSlotsTokenPurchase1999':3500,
	'WatchSlotsTokenPurchase4999':10000,
	'WatchSlotsTokenPurchase9999':25000
};

exports.purchase = function(req) {
	var productId = req.body.productId;
	var quantity = PRODUCTS[productId];
	if (!quantity) {
		return {success:false, message:'invalid productId '+productId};
	}

	var user = req.user;
	user.balance += quantity;

	return Purchase.create({
		user: user,
		quantity: quantity,
		productId: productId,
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

exports.resetReturnBonus = function(req) {
	req.user.lastReturnBonus = moment().subtract(1, 'days').toDate();
	return req.user.savePromise();
};

exports.setOutcome = function(req) {
	if (req.param('outcome') === 'clear') {
		req.user.outcome = undefined;
	} else {
		req.user.outcome = req.param('outcome');
	}
	return req.user.savePromise();
};

exports.setBalance = function(req) {
	req.user.balance = req.param('balance');
	return req.user.savePromise();
};

exports.userByDeviceId = function(req, deviceId) {
	return User.findOne({identifierForVendor: deviceId}).exec().then(
		function(user) {
			if (user) {
				return user;
			}
			return User.create({
				identifierForVendor: deviceId,
				balance: 50
			});
		}
	);
};
