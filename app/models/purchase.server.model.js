'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	timestamps = require('mongoose-timestamp'),
	deepPopulate = require('mongoose-deep-populate'),
	Schema = mongoose.Schema;

var PurchaseSchema = new Schema({
	user: {
		type: Schema.ObjectId,
		required: true,
		ref: 'User'
	},
	quantity: {
		type: Number,
		required: true
	},
	data: {
		type: Schema.Types.Mixed
	}
});

PurchaseSchema.plugin(deepPopulate);
PurchaseSchema.plugin(timestamps);
mongoose.model('Purchase', PurchaseSchema);
