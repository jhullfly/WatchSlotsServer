'use strict';
(function () {
	var Q = require('q');

	/*
	 fn: is a function that takes a request and returns a promise.
	 Sends the resolution of the promise as a jsonp response and handles errors.
	 */
	exports.jsonp = function (fn, afterSuccess) {
		return function (req, res, next) {
			var promise = fn(req, res.locals);
			//wrap in a promise in case a value was returned.
			promise = Q.Promise(function (resolve) {
				resolve(promise);
			});
			promise.then(function (data) {
				if (afterSuccess) {
					afterSuccess(req, res, data);
				}
				res.jsonp(data);
			}, function (err) {
				next(err);
			});
		};
	};

	/*
	 fn: is a function that takes a request, id and returns a promise.
	 adds the resolution of promise to the request.
	 */
	exports.param = function (fn, key) {
		return function (req, res, next, id) {
			var promise = fn(req, id, res.locals);
			//wrap in a promise in case a value was returned.
			promise = Q.Promise(function (resolve) {
				resolve(promise);
			});
			promise.then(function (data) {
				//console.log(JSON.stringify(data));
				if (!data) {
					next(new Error('Failed to load ' + key + ' for ' + id));
				} else {
					req[key] = data;
					next();
				}
			}, function (err) {
				next(err);
			});
		};
	};

})();

