'use strict';
define([], function() {
    var stringUtils = {
        format: function(inputString) {
            var args = arguments;
            inputString = inputString.replace(/(\$[0-9]+)/g, function(token) {
                var index = parseInt(token.replace('$', ''));
                return args[index];
            });
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
        var args = [].slice.call(arguments);
        args.unshift(this);
        return stringUtils.format.apply(this, args);
    };

    return stringUtils;
});