'use strict';
define(['jquery', 'underscore', 'backbone', 'pubsub', 'events', 'config'],
    function($, _, Backbone, PubSub, Events, Config) {
        var Router = Backbone.Router.extend({
            initialize: function(appRoutes) {
                var self = this;
                this.routes = appRoutes;
                this._bindRoutes();

                self.buildAppPaths();
                Backbone.history.start({
                    pushState: true,
                    root: Config.get('siteRoot')
                });

                PubSub.subscribe(Events.Navigate, function(url, trigger, replace) {
                    self.navigateToUrl.apply(self, [url, trigger, replace]);
                });

                this.setupLinkHandler();
            },

            _routeToRegExp: function(route) {
                route = Backbone.Router.prototype._routeToRegExp.call(this, route);
                return new RegExp(route.source, 'i');
            },
            resetComponents: function() {
                PubSub.publish(Events.HideAll);
            },
            destroy: function() {
                Backbone.history.stop();
                PubSub.unsubscribe(this.navigate);
            },
            navigateToUrl: function(url, trigger, replace) {
                if (trigger === undefined) {
                    trigger = true;
                }

                if (replace === undefined) {
                    replace = false;
                }

                Backbone.history.navigate(url, {
                    trigger: trigger,
                    replace: replace
                });
            },
            buildAppPaths: function() {
                this.on('route', function() {
                    PubSub.publish(Events.RouteChanged, {
                        route: arguments[0],
                        options: arguments[1]
                    });
                });
            },

            setupLinkHandler: function() {
                $(document).on('click', 'a:not([data-bypass])', this.handleClickEvent);
            },

            handleClickEvent: function(evt) {
                var href = $(this).attr('href');
                var protocol = this.protocol + '//';

                if (href && href.slice(0, protocol.length) !== protocol && href.indexOf('javascript:') !== 0) {
                    evt.preventDefault();
                    PubSub.publish(Events.Navigate, href, true);
                }
            }
        });

        return Router;
    });
