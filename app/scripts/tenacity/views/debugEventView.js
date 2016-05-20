'use strict';
define(['backbone', 'underscore', 'jquery', 'baseView', 'moment', 'pubsub'],
    function(Backbone, _, $, BaseView, Moment, PubSub) {
        var debugEventView = BaseView.extend({
            ignoreHideAll: true,
            template: 'app/scripts/tenacity/templates/debugEventView.ejs',
            events: {
                'click .title': 'eventNameClicked',
                'click [replay]': 'replayEvent'
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var timestamp = new Moment(Date.now());
                this.$('[date]').attr('timestamp', timestamp).text(timestamp.format('HH:mm:ss.SSS'));
                this.$('.content').hide();
            },

            eventNameClicked: function() {
                this.$el.toggleClass('open').find('.content').toggle();
            },

            filter: function(value) {
                if (this.model.get('event').toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                    (this.model.get('shortEventName') && this.model.get('shortEventName').toLowerCase().indexOf(value.toLowerCase()) > -1)) {
                    this.show();
                } else {
                    this.hide();
                }
            },

            replayEvent: function() {
                var args = [this.model.get('event')];
                var data = this.model.get('data');
                for(var i = 0; i  < data.length; i++) {
                    args.push(data[i]);
                }
                PubSub.publish.apply(PubSub, args);
            }
        });
        return debugEventView;
    });