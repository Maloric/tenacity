'use strict';
define(['backbone', 'underscore', 'jquery', 'baseView', 'baseModel', 'debugEventView', 'pubsub', 'events', '../bower_components/jquery-ui/ui/resizable', '../bower_components/jquery-ui/ui/sortable', 'ace'],
    function(Backbone, _, $, BaseView, BaseModel, DebugEventView, PubSub, Events) {
        var DebugView = BaseView.extend({
            ignoreHideAll: true,
            template: 'app/scripts/tenacity/templates/debugView.ejs',
            events: {
                'all': 'appendEvent',
                'keyup [filter]': 'filter',
                'click [clear]': 'clearEvents',
                'click [bookmark]': 'addBookmark',
                'click .bookmark': 'updateBookmarkLabel',
                'click [export]': 'showExportData',
                'click .export > .value': 'selectExportValue',
                'click .export > .close': 'hideExportData',
                'click [show-import]': 'showImportData',
                'click .import > .close': 'hideImportData',
                'click [import]': 'importData',
                'click [edit]': 'editAndReplayEvent'
            },

            initialize: function() {
                $('body').children().wrapAll('<div id="tenacityDebuggerPageWrap"></div>');
                $('#tenacityDebuggerPageWrap').css({
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    minHeight: '100%'
                });

                $('body').append($('<div id="tenacityDebugger"></div>').css({
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: '500px'
                }));

                this.model = new BaseModel({
                    events: []
                });

                this.setElement('#tenacityDebugger');
                this.views = [];
                BaseView.prototype.initialize.call(this, {
                    el: '#tenacityDebugger'
                });

                var self = this;
                this.$el.resizable({
                    resize: self.resize,
                    handles: 'e'
                });

                this.adjustContentLeft();

                this.$('.events').sortable({
                    cancel: '.event'
                });

                this.$('.export, .import').hide();

                this.editor = window.ace.edit('importEvents');
                this.editor.getSession().setMode('ace/mode/json');
                this.editor.$blockScrolling = Infinity;

                window.tenacityDebugger = this;
            },

            appendEvent: function() {
                var newView = new DebugEventView({
                    model: PubSub.getData.apply(this, arguments)
                });

                this.views.push(newView);
                this.appendItem(this.getDom(newView));

                var filterValue = this.$('[filter]').val();
                newView.filter(filterValue);
            },

            appendItem: function(el) {
                var $events = this.$('.events');
                var shouldScroll = $events[0].scrollTop + $events[0].offsetHeight >= $events[0].scrollHeight;

                $events.append(el);

                if (shouldScroll) {
                    $events.scrollTop($events[0].scrollHeight);
                }
            },

            resize: function() {
                this.adjustContentLeft();
            },

            adjustContentLeft: function() {
                $('#tenacityDebuggerPageWrap').css('left', this.$el.css('width'));
            },

            filter: function() {
                var value = this.$('[filter]').val();
                _.each(this.views, function(view) {
                    view.filter(value);
                });
            },

            destroy: function() {
                $('#tenacityDebuggerPageWrap').children().unwrap();
                $('body').css('overflow', 'auto');
                $('#tenacityDebugger').remove();
                BaseView.prototype.destroy.apply(this, arguments);
            },

            clearEvents: function() {
                this.views = [];
                this.$('.events').html('');
            },

            addBookmark: function() {
                this.appendItem('<li class="bookmark"></li>');
            },

            updateBookmarkLabel: function(e) {
                var $tgt = $(e.currentTarget);
                if (!$tgt.hasClass('edit')) {
                    var $input = $('<input type="text" class="form-control" value="' + $tgt.text() + '" />');
                    $tgt.html($input).addClass('edit');
                    $input.focus().on('blur', function() {
                        var val = $(this).val();
                        $tgt.html(val).removeClass('edit');
                    }).on('keypress', function(e) {
                        if (e.which === 13) {
                            $(this).trigger('blur');
                        }
                    });
                }
            },

            showExportData: function() {
                var events = [];
                for (var i = 0; i < this.views.length; i++) {
                    events.push(this.views[i].model.attributes);
                }
                this.$('.export .value').html(JSON.stringify(events, null, 2));
                this.$('.export').show();
            },

            hideExportData: function() {
                this.$('.export').hide();
            },

            selectExportValue: function() {
                var range = document.createRange();
                range.selectNodeContents(this.$('.export .value')[0]);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            },

            placeholderEvent: [{
                event: 'fully.qualified.event.name',
                shortEventName: 'ShortEventName',
                data: ['firstArgument', {
                    second: 'argument'
                }]
            }],

            showImportData: function() {
                this.editor.setValue(JSON.stringify(this.placeholderEvent, null, 2));
                this.$('.import').show();
            },

            hideImportData: function() {
                this.$('.import').hide();
            },

            importData: function() {
                var events = JSON.parse(this.editor.getValue());
                for (var i = 0; i < events.length; i++) {
                    var e = events[i];

                    var args = [Events[e.shortEventName] || e.event];
                    if (e.data) {
                        for (var x = 0; x < e.data.length; x++) {
                            args.push(e.data[x]);
                        }
                    }
                    PubSub.publish.apply(PubSub, args);
                }

                this.hideImportData();
            },

            editAndReplayEvent: function(e) {
                this.showImportData();
                var $event = $(e.currentTarget).closest('.event');
                var indexOfEvent = this.$('.event').index($event);
                var eventData = _.cloneDeep(this.views[indexOfEvent].model.attributes);
                delete eventData.stack;

                this.editor.setValue(JSON.stringify([eventData], null, 2));
            }

        });

        window.enableTenacityDebugger = function() {
            return new DebugView();
        };

        return DebugView;
    });