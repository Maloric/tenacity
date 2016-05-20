'use strict';
define(['underscore'], function(_) {
    var defaults = {
        useFakeApiManager: false,
        signalrEndpointUrl: 'signalr',
        debug: false,
        enableDebugger: false,
        feature: {
            createSurvey: false,
            archiveSurvey: false,
            nodeSearch: true
        },
        surveyList: {
            pageSize: 10
        },
        sectionEdit: {
            zoomStep: 15,
            scrollStep: 50,
            position: {
                updateDebounce: 500,
                stepDistance: 50
            },
            readOnly: false
        },
        search: {
            maxResults: 10
        },
        assetManager: {
            urlFormat: 'assets/retrieve/$1/$2'
        },
        defaultLanguage: 'en-GB',
        siteRoot: '/surveyeditor/'
    };

    return {
        get: function(path) {
            var res = defaults;
            if (window.tenacityConfig) {
                res = _.extend(defaults, window.tenacityConfig);
            }

            if (!path) {
                return _.cloneDeep(res);
            }

            return _.cloneDeep(_.get(res, path), true);
        }
    };
});
