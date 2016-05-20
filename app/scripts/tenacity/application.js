'use strict';
define(['pubsub', 'tenacity', 'events', 'templates', 'router', 'renderer', 'jquery', 'moment'],
    function(PubSub, Tenacity, Events, Templates, Router, Renderer, $, Moment) {
        var tenacityApplication = function(opts) {
            var self = this;

            this.init = function(opts) {

                var ApiManager = opts.useFakeApiManager ? opts.fakeApiManager : opts.apiManager;

                var eventKeys = Object.keys(opts.events);
                for(var i = 0; i < eventKeys.length; i++) {
                    var eventName = eventKeys[i];
                    Events[eventName] = opts.events[eventName];
                }

                var templateKeys = Object.keys(opts.templates);
                for(var n = 0; n < templateKeys.length; n++) {
                    var templateKey = templateKeys[n];
                    Templates[templateKey] = opts.templates[templateKey];
                }

                PubSub.publish(Events.HideAll);

                this.apiManager = new ApiManager();

                if (opts.initCallback) {
                    opts.initCallback();
                }

                this.timestampUpdateInterval = setInterval(function() {
                    self.updateTimes(self);
                }, 60000);

                return this;
            };

            this.initRenderer = function() {
                Renderer.templates = opts.templates;
            };

            this.initRouter = function(appRoutes) {
                // Initialize the router here otherwise the router will detect
                // the URL and attempt to send requests to the server before the
                // connection is ready
                self.router = new Router(appRoutes);
            };

            this.destroy = function() {
                PubSub.unsubscribe(this.initRouter);
                if (this.apiManager && this.apiManager.destroy) {
                    this.apiManager.destroy();
                }
                if (this.router && this.router.destroy) {
                    this.router.destroy();
                }

                clearInterval(this.timestampUpdateInterval);

                if(opts.destroyCallback) {
                    opts.destroyCallback();
                }
            };

            this.updateTimes = function() {
                $('[data-timestamp]').each(function() {
                    var timestamp = parseInt($(this).attr('data-timestamp'));
                    var newTime = Moment.unix(timestamp).fromNow();
                    $(this).text(newTime);
                });
            };

            this.init(opts);
        };
        return tenacityApplication;
    });
