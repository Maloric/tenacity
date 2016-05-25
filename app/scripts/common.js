/* global requirejs */
'use strict';
requirejs.config({
    baseUrl: 'scripts/',
    paths: {
        'backbone'                  :   '../bower_components/backbone/backbone',
        'jquery'                    :   '../bower_components/jquery/dist/jquery',
        'underscore'                :   '../bower_components/lodash/dist/lodash',
        'moment'                    :   '../bower_components/moment/min/moment.min',
        'deepModel'                 :   '../bower_components/backbone-deep-model/distribution/deep-model',
        'ace'                       :   '../bower_components/ace-builds/src-noconflict/ace',
        'ace-mode-json'             :   '../bower_components/ace-builds/src-noconflict/mode-json',

        // Tenacity
        'tenacity'                  :   'tenacity',
        'application'               :   'tenacity/application',
        'router'                    :   'tenacity/router',
        'pubsub'                    :   'tenacity/pubsub',
        'baseView'                  :   'tenacity/views/baseView',
        'baseModel'                 :   'tenacity/models/baseModel',
        'debugView'                 :   'tenacity/views/debugView',
        'debugEventView'            :   'tenacity/views/debugEventView',
        'events'                    :   'tenacity/events',
        'eventExtender'             :   'tenacity/eventExtender',
        'config'                    :   'tenacity/config',
        'renderer'                  :   'tenacity/renderer',
        'utils'                     :   'tenacity/utils',
        'templates'                 :   'templates'

    },
    shim: {
        deepModel: {
            deps: ['backbone', 'underscore'],
            exports: 'deepModel'
        },
        'ace-mode-json': {
            deps: ['ace']
        }
    }
});
