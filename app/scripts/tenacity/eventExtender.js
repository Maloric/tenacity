'use strict';
define(['backbone', 'router', 'underscore', 'pubsub', 'events'], function(Backbone, Router, _, PubSub, Events) {
    var eventExtender = function() {
        this.initialize.apply(this, arguments);
    };

    _.extend(eventExtender.prototype, {
        events: {},
        initialize: function() {
            var self = this;
            _.bindAll(this, _.functionsIn(self));
            this.registerEvents();
        },

        destroy: function() {
            this.unregisterEvents();
        },

        registerEvents: function() {
            this.eventHandlers = {};

            for (var e in this.events) {
                this.registerEvent(e);
            }

            PubSub.subscribe(Events.RouteChanged, this.routeChangedHandler);
        },

        registerEvent: function(eventName, prepend) {
            if (eventName.indexOf('route:') === -1) {
                PubSub.subscribe(Events[eventName] || eventName, this.createEventHandler(eventName), prepend);
            } else {
                this.createEventHandler(eventName);
            }
        },

        createEventHandler: function(eventName) {
            var handlerName = this.events[eventName];
            this.eventHandlers[eventName] = this[handlerName];
            return this[handlerName];
        },

        unregisterEvents: function() {
            for (var handler in this.eventHandlers) {
                PubSub.unsubscribe(this.eventHandlers[handler]);
            }
            PubSub.unsubscribe(this.routeChangedHandler);
            delete this.eventHandlers;
        },

        routeChangedHandler: function(data) {
            var self = this;
            var handlerName = 'route:' + data.route;
            var routeEvents = _.filter(Object.keys(this.eventHandlers), function(prop) {
                return prop.indexOf('route:') === 0;
            });

            var matchingRoutes = _.filter(routeEvents, function(route) {
                return handlerName.indexOf(route) === 0;
            });

            if (matchingRoutes.length === 0 && !this.ignoreHideAll) {
                if (this.hide) {
                    this.hide();
                }
            } else {
                _.each(matchingRoutes, function(route) {
                    self.eventHandlers[route].apply(self, data.options);
                });
            }
        }
    });

    eventExtender.extend = Backbone.View.extend;

    return eventExtender;
});
