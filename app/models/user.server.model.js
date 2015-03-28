'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	timestamps = require('mongoose-timestamp'),
	deepPopulate = require('mongoose-deep-populate'),
	Schema = mongoose.Schema;

var UserSchema = new Schema({
	identifierForVendor: {
		type: String,
		unique: true,
		required: true
	},
	balance: {
		type: Number,
		default: 0
	},
	lastReturnBonus: {
		type: Date
	},
	outcome: {
		type: Number
	}
});

UserSchema.plugin(deepPopulate);
UserSchema.plugin(timestamps);
mongoose.model('User', UserSchema);
