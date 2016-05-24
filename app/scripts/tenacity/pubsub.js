'use strict';
define(['backbone', 'underscore', 'config', 'events'], function(Backbone, _, Config, Events) {
    var pubsub = _.extend(Backbone.Events, {
        publish: function() {
            if (Config.get('debug') && window.console) {
                var data = this.getData.apply(this, arguments);

                window.console.log(data);
            }
            if (arguments[0]) {
                this.trigger.apply(this, arguments);
            }
        },
        subscribe: function(eventName, fn, prependEvent) {
            if (eventName.indexOf(' ') > -1) {
                return;
            }

            if (eventName !== '*') {
                this.listenTo(this, eventName, fn);
            }

            if (prependEvent) {
                var lastEvent = this._events[eventName].pop();
                this._events[eventName].unshift(lastEvent);
            }
        },
        unsubscribe: function(obj) {
            // if (typeof(obj) === 'object') {
            //     this.stopListening(obj);
            // } else if (typeof(obj) === 'string') {
            //     this.stopListening(null, obj);
            // } else if (typeof(obj) === 'function') {
            this.stopListening(null, null, obj);
            // }
        },
        getData: function() {
            var excludedPatterns = [
                'backbone.js',
                'requirejs.js',
                'lodash.js',
                'jquery.js'
            ];
            var data = {
                'event': arguments[0],
                'data': [].slice.call(arguments, 1)
            };

            Error.stackTraceLimit = 100;
            var e = new Error('dummy');
            if (e.stack) {
                data.stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                    .replace(/^\s+at\s+/gm, '')
                    .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                    .split('\n');
            }

            data.stack = _.reject(data.stack, function(stackEntry) {
                return _.some(excludedPatterns, function(pattern) {
                    return stackEntry.indexOf(pattern) > -1;
                });
            });

            data.shortEventName = _.find(Object.keys(Events), function(key) {
                return Events[key] === data.event;
            });

            return data;
        }
    });

    return pubsub;
});