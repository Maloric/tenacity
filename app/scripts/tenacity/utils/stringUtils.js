'use strict';
define([], function() {
    return {
        format: function(inputString) {
            for(var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                inputString = inputString.replace('$' + i, arg);
            }
            return inputString;
        }
    };
});