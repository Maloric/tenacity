'use strict';
define(['backbone', 'utils/timespan', 'utils/stringUtils'], function(Backbone, Timespan, StringUtils) {
    return {
        timespan: Timespan,
        string: StringUtils
    };
});