(function () {
'use strict';
define('baseModel',['backbone', 'underscore', 'deepModel'], function(Backbone, _) {
    _.first = _.take; // Fix for the lack of a "first" method in Lodash, as DeepModel uses underscore
    var baseModel = Backbone.DeepModel.extend({
        defaults: {}
    });
    return baseModel;
});

define('config',['underscore'], function(_) {
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


define('events',[], function() {
    var events = {
        'HideAll': 'avius.tenacity.hideAll',

        'Navigate': 'avius.tenacity.router.navigate',
        'RouteChanged': 'avius.tenacity.router.changed'
    };
    return events;
});


define('pubsub',['backbone', 'underscore', 'config', 'events'], function(Backbone, _, Config, Events) {
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
        subscribe: function(eventName, fn) {
            if (eventName !== '*') {
                this.listenTo(this, eventName, fn);
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


define('router',['jquery', 'underscore', 'backbone', 'pubsub', 'events', 'config'],
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
            resetViews: function() {
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

define('templates',[],function(){

this["JST"] = this["JST"] || {};

this["JST"]["app/scripts/tenacity/templates/debugEventView.ejs"] = function(model) {
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
__p += '<li class="event">\r\n    <div class="title">\r\n        <span event-name>' +
((__t = ( model.get('shortEventName') || model.get('event')  )) == null ? '' : __t) +
'</span>\r\n        <span date></span>\r\n        ';
 if (model.get('data').length > 0) { ;
__p += '\r\n            <span event-args-small>' +
((__t = ( JSON.stringify(model.get('data')) )) == null ? '' : __t) +
'</span>\r\n        ';
 } ;
__p += '\r\n    </div>\r\n    <div class="buttons">\r\n        <button type="button" edit title="Edit"><i class="fa fa-pencil"></i></button>\r\n        <button type="button" replay title="Replay"><i class="fa fa-retweet"></i></button>\r\n    </div>\r\n    <div class="content">\r\n        <label>Data:</label>\r\n        <pre event-args>' +
((__t = ( JSON.stringify(model.get('data'), null, 2) )) == null ? '' : __t) +
'</pre>\r\n\r\n        <label>Stacktrace:</label>\r\n        <pre stack-trace>' +
((__t = ( JSON.stringify(model.get('stack'), null, 2) )) == null ? '' : __t) +
'</pre>\r\n    </div>\r\n</li>';
return __p
};

this["JST"]["app/scripts/tenacity/templates/debugView.ejs"] = function(model) {
var __t, __p = '', __e = _.escape;
__p += '<input type="text" class="form-control" placeholder="(filter events)" filter />\r\n<button type="button" clear class="btn btn-danger btn-xs">Clear</button>\r\n<button type="button" bookmark class="btn btn-info btn-xs">Bookmark</button>\r\n<button type="button" export class="btn btn-warning btn-xs">Export</button>\r\n<button type="button" show-import class="btn btn-warning btn-xs">Import</button>\r\n<ul class="events">\r\n</ul>\r\n<div class="export">\r\n    <button class="close" title="close"><i class="fa fa-times"></i></button>\r\n    <pre class="value"></pre>\r\n</div>\r\n<div class="import">\r\n    <button class="close" title="close"><i class="fa fa-times"></i></button>\r\n    <textarea id="importEvents" class="value form-control"></textarea>\r\n    <button type="button" import class="btn btn-warning btn-sm">Import</button>\r\n</div>';
return __p
};

  return this["JST"];

});

define('utils/timespan',[], function() {
    return {
        parse: function(input) {
            var pattern1 = /(\d*)\.(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
            var pattern2 = /(\d*)\.(\d{2}):(\d{2}):(\d{2})/;
            var pattern3 = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
            var pattern4 = /(\d{2}):(\d{2}):(\d{2})/;

            var days, hours, minutes, seconds, milliseconds;
            var res = input.match(pattern1);
            if (res) {
                days = parseInt(res[1]);
                hours = parseInt(res[2]);
                minutes = parseInt(res[3]);
                seconds = parseInt(res[4]);
                milliseconds = parseInt(res[5]);
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern2);
            if (res) {
                days = parseInt(res[1]);
                hours = parseInt(res[2]);
                minutes = parseInt(res[3]);
                seconds = parseInt(res[4]);
                milliseconds = 0;
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern3);
            if (res) {
                days = 0;
                hours = parseInt(res[1]);
                minutes = parseInt(res[2]);
                seconds = parseInt(res[3]);
                milliseconds = parseInt(res[4]);
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }

            res = input.match(pattern4);
            if (res) {
                days = 0;
                hours = parseInt(res[1]);
                minutes = parseInt(res[2]);
                seconds = parseInt(res[3]);
                milliseconds = 0;
                return this.getTimeSpan(days, hours, minutes, seconds, milliseconds);
            }
        },

        getTimeSpan: function(days, hours, minutes, seconds, milliseconds) {
            return {
                days: days || 0,
                hours: hours || 0,
                minutes: minutes || 0,
                seconds: seconds || 0,
                milliseconds: milliseconds || 0
            };
        }
    };
});

define('utils/stringUtils',[], function() {
    return {
        format: function(inputString) {
            for(var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                inputString = inputString.replace('$' + i, arg);
            }
            return inputString;
        }
    };
});

define('utils',['backbone', 'utils/timespan', 'utils/stringUtils'], function(Backbone, Timespan, StringUtils) {
    return {
        timespan: Timespan,
        string: StringUtils
    };
});

define('renderer',['backbone', 'baseModel', 'underscore', 'moment', 'config', 'utils', 'templates'], function(Backbone, BaseModel, _, Moment, Config, Utils, t) {
    return {
        render: function(template, data, force) {
            var templateFn;

            templateFn = t[template];

            if (!templateFn && !force) {
                var templateName = template.replace('.ejs', '').substring(template.lastIndexOf('/') + 1);
                return 'No template found for <em>' + templateName + '</em>';
            }

            _.Moment = Moment;
            _.Config = Config;
            _.Utils = Utils;
            //TODO: Allow custom methods to be attached to Underscore in order to be available in templates
            // _.Translate = TranslationManager.translate;

            var model = data;
            if (data && !(model instanceof Backbone.Model)) {
                model = new BaseModel(data);
            }

            if (templateFn) {
                return templateFn(model);
            } else {
                return _.template(template)(model);
            }
        }
    };
});

define('application',['pubsub', 'tenacity', 'events', 'templates', 'router', 'renderer', 'jquery', 'moment'],
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

define('tenacity',['baseView', 'baseModel', 'pubsub', 'events', 'router', 'application', 'utils', 'config', 'templates'],
function(BaseView, BaseModel, PubSub, Events, Router, Application, Utils, Config, Templates) {
    return {
        View: BaseView,
        Model: BaseModel,
        PubSub: PubSub,
        Events: Events,
        Router: Router,
        App: Application,
        Utils: Utils,
        Config: Config,
        Templates: Templates
    };
});

define('eventExtender',['backbone', 'tenacity', 'router', 'underscore', 'pubsub', 'events'], function(Backbone, Tenacity, Router, _, PubSub, Events) {
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

        registerEvent: function(e) {
            if (e.indexOf('route:') === -1) {
                PubSub.subscribe(Events[e] || e, this.createEventHandler(e));
            } else {
                this.createEventHandler(e);
            }
        },

        createEventHandler: function(eventName) {
            var handlerName = this.events[eventName];
            this.eventHandlers[eventName] = this[handlerName];
            return this[handlerName];
            // var self = this;
            // return function() {
            //     self[handlerName].apply(self, arguments);
            // };
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


define('baseView',['backbone', 'eventExtender', 'underscore', 'jquery', 'events', 'renderer'],
    function(Backbone, EventExtender, _, $, Events, Renderer) {
        var baseViewExt = {
            initialize: function(data) {
                if (!this.events) {
                    this.events = {};
                }
                if (!this.ignoreHideAll) {
                    this.events.HideAll = 'hide';
                } else {
                    delete this.events.HideAll;
                }
                this.views = [];

                if (data && data.model) {
                    if (data.model instanceof Backbone.Model) {
                        var merged = _.defaultsDeep(data.model.attributes, this.defaultModel);
                        this.model = new Backbone.Model(merged);
                    } else {
                        this.model = new Backbone.Model(_.defaultsDeep(data.model, this.defaultModel));
                    }
                } else if (this.defaultModel) {
                    this.model = new Backbone.Model(this.defaultModel);
                }

                if (data && data.el) {
                    this.domElementProvided = true;
                }

                this.render();
                EventExtender.prototype.initialize.apply(this, arguments);
            },

            render: function() {
                var html = '';

                if (this.model) {
                    html = this.getTemplate(this.model);
                } else {
                    html = this.getTemplate();
                }

                var $children = $(html);
                if (!this.domElementProvided && this.rendered && $children.size() === 1) {
                    this.$el.unbind().replaceWith($children);
                    this.setElement($children);
                    this.registerDomEvents();
                } else {
                    if (!this.domElementProvided && $children.size() === 1) {
                        this.setElement($children.eq(0));
                        html = $children.html();
                    }
                    this.$el.html(html);
                }
                this.rendered = true;
                return this;
            },

            registerEvent: function(e) {
                if (e.indexOf(' ') > -1) {
                    this.registerDomEvent(e);
                } else {
                    EventExtender.prototype.registerEvent.apply(this, arguments);
                }
            },

            registerDomEvents: function() {
                if (!this.$el) {
                    throw window.console.error('Cannot register DOM events without an attached DOM element');
                }
                for (var e in this.events) {
                    if (e.indexOf(' ') > -1) {
                        this.registerDomEvent(e, true);
                    }
                }
            },

            registerDomEvent: function(e) {
                var firstSpace = e.indexOf(' ');
                var domEvent = e.substring(0, firstSpace);
                var selector = e.substring(firstSpace + 1);
                var $domElement = this.$(selector);
                if ($domElement.size() === 0 && this.$el.is(selector)) {
                    // Backbone already handles normal events,
                    // but this allows the selector to be the
                    // DOM element the view is attached to.
                    this.$el.bind(domEvent, this.createEventHandler(e));
                }
            },

            getTemplate: function(attributes) {
                return Renderer.render(this.template, attributes, true);
            },

            getDom: function(view) {
                if (!view) {
                    view = this;
                }
                return view.el;
            },

            destroyViews: function() {
                _.invoke(this.views, 'destroy');
                this.views = [];
            },

            destroy: function() {
                this.unregisterEvents();
                this.undelegateEvents();
                this.destroyViews();
                this.$el.removeData().unbind();
                this.remove();

                if (this.model && this.model instanceof Backbone.Model) {
                    this.model.trigger('destroy', this.model);
                }
                delete this.model;
            },

            remove: function() {
                this.$el.empty().off();
                this.stopListening();
                return this;
            },

            hide: function() {
                this.$el.hide();
            },

            show: function() {
                this.$el.show();
            },

            block: function() {
                this.$el.addClass('blocked');
            },

            unblock: function() {
                this.$el.removeClass('blocked');
            }
        };

        var baseView = Backbone.View.extend(baseViewExt);
        baseView.prototype = _.create(EventExtender.prototype, Backbone.View.prototype);
        baseView.prototype = _.create(baseView.prototype, baseViewExt);

        return baseView;
    });

define('../scripts/tenacity',['baseView', 'baseModel', 'pubsub', 'events', 'router', 'application', 'utils', 'config', 'templates'],
function(BaseView, BaseModel, PubSub, Events, Router, Application, Utils, Config, Templates) {
    return {
        View: BaseView,
        Model: BaseModel,
        PubSub: PubSub,
        Events: Events,
        Router: Router,
        App: Application,
        Utils: Utils,
        Config: Config,
        Templates: Templates
    };
});
}());