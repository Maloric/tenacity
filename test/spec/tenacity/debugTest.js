'use strict';
define(['backbone', 'debugView', 'jquery', 'underscore', 'pubsub', 'events'],
    function(Backbone, DebugView, $, _, PubSub, Events) {
        testSetup('Debugger', function() {
            beforeEach(function() {
                this.unit = new DebugView();
            });

            afterEach(function() {
                delete window.enableTenacityDebugger;
            });

            it('adds a method to the window object to instantiate the view', function() {
                expect(typeof(window.enableTenacityDebugger)).to.equal('function', 'window.enableTenacityDebugger is a function');

                this.unit.destroy();

                this.unit = window.enableTenacityDebugger();
                expect(window.tenacityDebugger instanceof DebugView).to.equal(true, 'Debugger is attached to window');
            });

            it('appends a container to the body when instatiated', function() {
                var $el = $('body').children('#tenacityDebugger');
                expect($el.size()).to.equal(1, 'Container is appended to the body');
                expect($el.children('.events').size()).to.equal(1, 'Template is rendered into body');
            });

            it('attaches the debugger to the window object', function() {
                expect(window.tenacityDebugger instanceof DebugView).to.equal(true, 'Debugger is attached to window');
            });

            it('sets the left position on the wrapper to match the initial width', function() {
                expect($('#tenacityDebuggerPageWrap').css('left')).to.equal(this.unit.$el.css('width'));
            });

            it('makes bookmarks sortable, but not events', function() {
                this.unit.destroy();
                var spy = sinon.spy($.fn, 'sortable');

                this.unit = new DebugView();

                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, {
                    cancel: '.event'
                });

                $.fn.sortable.restore();
            });

            describe('after a PubSub event is published', function() {
                beforeEach(function() {
                    this.scrollSpy = sinon.spy($.fn, 'scrollTop');
                    this.eventName1 = 'anyoldevent';
                    this.arg1 = {
                        myKey: 'myVal'
                    };
                    this.arg2 = 123;
                    PubSub.publish(this.eventName1, this.arg1, this.arg2);

                    this.eventName2 = 'anotherEvent';
                    this.arg3 = 'some value';
                    PubSub.publish(this.eventName2, this.arg3);
                });

                afterEach(function() {
                    $.fn.scrollTop.restore();
                });

                it('should append the published event to a list', function() {
                    var $newEvent = this.unit.$('.event');
                    expect($newEvent.size()).to.equal(2, 'One item is added per event');
                    expect($newEvent.find('[event-name]').eq(0).text()).to.equal(this.eventName1, 'Event name 1 is rendered');
                    expect($newEvent.find('[event-args]').eq(0).text()).to.equal(JSON.stringify([this.arg1, this.arg2], null, 2), 'Event args 1 are rendered');

                    expect($newEvent.find('[event-name]').eq(1).text()).to.equal(this.eventName2, 'Event name 2 is rendered');
                    expect($newEvent.find('[event-args]').eq(1).text()).to.equal(JSON.stringify([this.arg3], null, 2), 'Event args 2 are rendered');
                });

                it('should scroll to the bottom of the list', function() {
                    var $events = this.unit.$('.events');
                    sinon.assert.calledTwice(this.scrollSpy);
                    sinon.assert.calledWith(this.scrollSpy, $events[0].scrollHeight);
                });

                it('should only auto scroll when the current scroll is at the bottom of the view', function() {
                    var $events = this.unit.$('.events');
                    $events.css({
                        'height': '30px',
                        'overflow-y': 'scroll'
                    });
                    for (var i = 0; i < 10; i++) {
                        PubSub.publish('someotherevent');
                    }

                    $events.scrollTop($events[0].scrollTop);
                    this.scrollSpy.reset();

                    PubSub.publish('anotherEvent');

                    sinon.assert.notCalled(this.scrollSpy);
                });

                describe('and the clear button is clicked', function() {
                    beforeEach(function() {
                        this.unit.$('[clear]').trigger('click');
                    });

                    it('should remove all events from the list', function() {
                        expect(this.unit.views.length).to.equal(0);
                        expect(this.unit.$('.event').length).to.equal(0);
                    });
                });

                describe('and a filter is provided', function() {
                    beforeEach(function() {
                        this.spy1 = sinon.spy(this.unit.views[0], 'filter');
                        this.spy2 = sinon.spy(this.unit.views[1], 'filter');

                        this.unit.$('[filter]').val('testEventN').trigger('keyup');
                    });

                    it('passes the filter value to the filter function in each child view', function() {
                        sinon.assert.calledOnce(this.spy1);
                        sinon.assert.calledOnce(this.spy2);
                    });

                    it('will filter a new view when added', function() {
                        PubSub.publish('someotherevent');
                        PubSub.publish('testEventName');

                        expect(this.unit.views[2].$el.is(':visible')).to.equal(false, 'First view is hidden');
                        expect(this.unit.views[3].$el.is(':visible')).to.equal(true, 'Second view is visible');
                    });
                });

                describe('and the export button is clicked', function() {
                    beforeEach(function() {
                        expect(this.unit.$('.export').is(':visible')).to.equal(false, 'Export modal is hidden');
                        this.unit.$('[export]').trigger('click');
                    });

                    it('should show a modal with every event in the log represented as json', function() {
                        var events = [];
                        for (var i = 0; i < this.unit.views.length; i++) {
                            events.push(this.unit.views[i].model.attributes);
                        }
                        var expected = JSON.stringify(events, null, 2);

                        expect(this.unit.$('.export').is(':visible')).to.equal(true, 'Export modal is visible');
                        expect(this.unit.$('.export .value').text()).to.equal(expected, 'Serialized event stream is rendered');
                    });

                    it('should hide the export when the user clicks the close button', function() {
                        this.unit.$('.export > .close').trigger('click');
                        expect(this.unit.$('.export').is(':visible')).to.equal(false, 'Export modal is hidden');
                    });

                    describe('and the <pre> is clicked', function() {
                        beforeEach(function() {
                            this.unit.$('.export .value').trigger('click');
                        });

                        it('should highlight the value', function() {
                            var selectedText = window.getSelection().toString();
                            expect(selectedText).to.equal(this.unit.$('.export .value').text(), 'Export value is selected');
                        });
                    });
                });

                describe('and the import button is clicked', function() {
                    beforeEach(function() {
                        expect(this.unit.$('.import').is(':visible')).to.equal(false, 'Import modal is hidden');
                        this.unit.$('[show-import]').trigger('click');
                    });

                    it('should show a modal with a placeholder event', function() {
                        var expected = JSON.stringify(this.unit.placeholderEvent, null, 2);

                        expect(this.unit.$('.import').is(':visible')).to.equal(true, 'Import modal is visible');
                        expect(this.unit.editor.getValue()).to.equal(expected, 'Placeholder event is rendered');
                    });

                    it('should hide the import when the user clicks the close button', function() {
                        this.unit.$('.import > .close').trigger('click');
                        expect(this.unit.$('.import').is(':visible')).to.equal(false, 'Import modal is hidden');
                    });

                    describe('and the user provides valid input and clicks import', function() {
                        beforeEach(function() {
                            this.fqEventName = 'event1';
                            this.shortEventName = 'HideAll';
                            this.arg1 = 'firstArgument';
                            this.arg2 = {
                                'second': 'argument'
                            };
                            this.events = [{
                                'event': this.fqEventName,
                                'data': [this.arg1, this.arg2]
                            }, {
                                'shortEventName': this.shortEventName,
                                'data': []
                            }];
                            this.value = JSON.stringify(this.events, null, 2);
                            this.unit.editor.setValue(this.value);

                            this.spy1 = sinon.spy();
                            this.spy2 = sinon.spy();
                            PubSub.subscribe(this.fqEventName, this.spy1);
                            PubSub.subscribe(Events[this.shortEventName], this.spy2);

                            this.unit.$('[import]').trigger('click');
                        });

                        it('should close the importer', function() {
                            expect(this.unit.$('.import').is(':visible')).to.equal(false, 'Import modal is hidden');
                        });

                        it('should publish each event', function() {
                            sinon.assert.calledOnce(this.spy1);
                            sinon.assert.calledWith(this.spy1, this.arg1, this.arg2);

                            sinon.assert.calledOnce(this.spy2);
                        });
                    });
                });

                describe('and the edit button is clicked on an event', function() {
                    beforeEach(function() {
                        this.expectedImportValue = _.cloneDeep([this.unit.views[0].model.attributes]);
                        delete this.expectedImportValue[0].stack;
                        this.unit.$('.event [edit]').eq(0).trigger('click');
                    });

                    it('should show the import view prepopulated with the event in question', function() {
                        var expected = JSON.stringify(this.expectedImportValue, null, 2);

                        expect(this.unit.$('.import').is(':visible')).to.equal(true, 'Import modal is visible');
                        expect(this.unit.editor.getValue()).to.equal(expected, 'Placeholder event is rendered');
                    });
                });
            });

            describe('if a PubSub event is published that exists in the Events file', function() {
                beforeEach(function() {
                    PubSub.publish(Events.HideAll);
                });

                it('sets the short event name on the new item', function() {
                    var model = this.unit.views[0].model;
                    expect(model).to.not.equal(undefined);
                    var res = model.get('shortEventName');
                    expect(res).to.equal('HideAll', 'Short event name is set');
                });
            });

            describe('when the user resizes the view', function() {
                beforeEach(function() {
                    this.width = Math.floor((Math.random() * 100) + 1);
                    this.unit.$el.css('width', this.width);
                    this.unit.resize({}, {
                        size: {
                            width: this.width
                        }
                    });
                });

                it('changes the left position of the body wrapper to match the width of the debug view', function() {
                    expect($('#tenacityDebuggerPageWrap').css('left')).to.equal(this.width + 'px');
                });
            });

            describe('when the user clicks on the bookmark button', function() {
                beforeEach(function() {
                    this.unit.$('[bookmark]').trigger('click');
                });

                it('should add a new placeholder element to the end of the events list', function() {
                    var $last = this.unit.$('.events').children().last();
                    expect($last.hasClass('bookmark')).to.equal(true);
                });

                describe('and then clicks on the bookmark', function() {
                    beforeEach(function() {
                        this.focusSpy = sinon.spy($.fn, 'focus');
                        this.$bookmark = this.unit.$('.events').children().last();
                        this.existingLabel = 'test label';
                        this.$bookmark.text(this.existingLabel).trigger('click');
                        this.$input = this.unit.$('.events').children().last().find('input[type=text]');
                    });

                    afterEach(function() {
                        $.fn.focus.restore();
                    });

                    it('should insert a text box (prefilled with whatever was there in the first place)', function() {
                        expect(this.$input.is(':visible')).to.equal(true, 'Textbox is added');
                        expect(this.$input.val()).to.equal(this.existingLabel, 'Textbox has correct text');
                        sinon.assert.calledOnce(this.focusSpy);
                    });

                    it('should do nothing if the user clicks on the bookmark again', function() {
                        this.$bookmark.trigger('click');

                        expect(this.$input.is(':visible')).to.equal(true, 'Textbox is added');
                        expect(this.$input.val()).to.equal(this.existingLabel, 'Textbox has correct text');
                        sinon.assert.calledOnce(this.focusSpy);
                    });

                    it('replaces the textbox with the updated text label when the textbox loses focus', function() {
                        var expected = 'a new value';
                        this.$input.val(expected);

                        this.$input.trigger('blur');

                        expect(this.unit.$('.events').children().last().html()).to.equal(expected);
                    });

                    it('should trigger the blur event if the user hits enter while focused on the textbox', function() {
                        var expected = 'a new value';
                        this.$input.val(expected);

                        var e = $.Event('keypress');
                        e.which = 13; // enter
                        this.$input.trigger(e);

                        expect(this.unit.$('.events').children().last().html()).to.equal(expected);
                    });
                });
            });
        });
    });
