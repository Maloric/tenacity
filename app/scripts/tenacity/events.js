'use strict';
define([], function() {
    var events = {
        'HideAll': 'avius.tenacity.hideAll',

        'Navigate': 'avius.tenacity.router.navigate',
        'RouteChanged': 'avius.tenacity.router.changed'
    };
    return events;
});
