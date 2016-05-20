/* global requirejs */
'use strict';
requirejs.config({
    baseUrl: 'bower_components/',
    paths: {
        'backbone'                  :   'backbone/backbone',
        'jquery'                    :   'jquery/dist/jquery',
        'underscore'                :   'lodash/dist/lodash',
        'moment'                    :   'moment/min/moment.min',
        'deepModel'                 :   'backbone-deep-model/distribution/deep-model',
        'ace'                       :   'ace-builds/src-noconflict/ace',

        // Tenacity
        'tenacity'                  :   '../scripts/tenacity',
        'application'               :   '../scripts/tenacity/application',
        'router'                    :   '../scripts/tenacity/router',
        'pubsub'                    :   '../scripts/tenacity/pubsub',
        'baseView'                  :   '../scripts/tenacity/views/baseView',
        'baseModel'                 :   '../scripts/tenacity/models/baseModel',
        'debugView'                 :   '../scripts/tenacity/views/debugView',
        'debugEventView'            :   '../scripts/tenacity/views/debugEventView',
        'events'                    :   '../scripts/tenacity/events',
        'eventExtender'             :   '../scripts/tenacity/eventExtender',
        'config'                    :   '../scripts/tenacity/config',
        'renderer'                  :   '../scripts/tenacity/renderer',
        'utils'                     :   '../scripts/tenacity/utils',
        'templates'                 :   '../scripts/templates'

    },
    shim: {
        deepModel: {
            deps: ['backbone', 'underscore'],
            exports: 'deepModel'
        }
    }
});
