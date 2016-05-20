'use strict';
define(['backbone', 'eventExtender', 'underscore', 'jquery', 'events', 'renderer'],
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
