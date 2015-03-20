'use strict';

module.exports = function() {
	var s = '';
	for(var i = 0; i < arguments.length ; i++) {
		if (typeof arguments[i] === 'string') {
			s += arguments[i];
		} else {
			s += JSON.stringify(arguments[i], null, ' ');
		}
	}
	console.log(s);
};
