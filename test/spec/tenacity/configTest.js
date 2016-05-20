'use strict';

define([],
    function() {
        testSetup('Config', function() {
            it('has the correct default values', function() {
                var vals = {
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

                expect(require('config').get()).to.deep.equal(vals);
            });

            it('overrides any default values with ones found on the window.tenacityConfig object', function() {
                window.tenacityConfig = {
                    debug: true
                };
                var value = require('config').get().debug;
                expect(value).to.equal(true, 'Default value is overridden');
                window.tenacityConfig = {
                    debug: false
                };
            });
        });
    });
