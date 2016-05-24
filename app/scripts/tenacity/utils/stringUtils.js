'use strict';
define([], function() {
    var stringUtils = {
        format: function(inputString) {
            for(var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                inputString = inputString.replace('$' + i, arg);
            }
            return inputString;
        },
        capitalizeFirstLetter: function(inputString) {
            return inputString.charAt(0).toUpperCase() + inputString.slice(1);
        }
    };

    String.prototype.capitalizeFirstLetter = function() {
        return stringUtils.capitalizeFirstLetter(this);
    };

    String.prototype.format = function() {
        return stringUtils.format.apply(this, arguments);
    };

    return stringUtils;
});