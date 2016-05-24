'use strict';
define(['underscore'], function(_) {
    var baseEvents = {
        'HideAll': 'avius.tenacity.hideAll',

        'Navigate': 'avius.tenacity.router.navigate',
        'RouteChanged': 'avius.tenacity.router.changed'
    };

    var events = baseEvents;
    if (window.tenacityEvents) {
        events = _.extend(baseEvents, window.tenacityEvents);
    }
    return events;
});
