'use strict';
(function () {

// random character that is a digit, upper case letter, or lower case letter
  function randomCharacter() {
    var num = Math.floor((Math.random() * 62));
    if (num < 10) {
      //digits
      return String.fromCharCode(48 + num);
    } else if (num < 36) {
      // upper case number
      return String.fromCharCode(65 + (num - 10));
    } else {
      // lower case number
      return String.fromCharCode(97 + (num - 36));
    }
  }

  exports.generate = function(length) {
    var code = '';
    for (var i = 0; i < length; i++) {
      code = code + randomCharacter();
    }
    return code;
  };

})();