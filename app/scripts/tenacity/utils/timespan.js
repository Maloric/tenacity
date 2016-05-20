'use strict';
define([], function() {
    return {
        parse: function(input) {
            var pattern1 = /(\d*)\.(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
            var pattern2 = /(\d*)\.(\d{2}):(\d{2}):(\d{2})/;
            var pattern3 = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
            var pattern4 = /(\d{2}):(\d{2}):(\d{2})/;

            var days, hours, minutes, seconds, milliseconds;
            var res = input.match(pattern1);
            if (res) {
                days = parseInt(res[1]);
                hours = parseInt(res[2]);
                minutes = parseInt(res[3]);
                seconds = parseInt(res[4]);
                milliseconds = parseInt(res[5]);
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern2);
            if (res) {
                days = parseInt(res[1]);
                hours = parseInt(res[2]);
                minutes = parseInt(res[3]);
                seconds = parseInt(res[4]);
                milliseconds = 0;
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern3);
            if (res) {
                days = 0;
                hours = parseInt(res[1]);
                minutes = parseInt(res[2]);
                seconds = parseInt(res[3]);
                milliseconds = parseInt(res[4]);
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern4);
            if (res) {
                days = 0;
                hours = parseInt(res[1]);
                minutes = parseInt(res[2]);
                seconds = parseInt(res[3]);
                milliseconds = 0;
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }
        },

        getTimeSpan: function(days, hours, minutes, seconds, milliseconds) {
            return {
                days: days || 0,
                hours: hours || 0,
                minutes: minutes || 0,
                seconds: seconds || 0,
                milliseconds: milliseconds || 0
            };
        }
    };
});