'use strict';
define(['backbone', 'debugEventView', 'jquery', 'moment', 'pubsub'],
    function(Backbone, DebugEventView, $, Moment, PubSub) {
        testSetup('Debugger Event', function() {
            before(function(){
                $('#content').append('<ul></ul>');
            });

            beforeEach(function() {
                this.unit = new DebugEventView({
                    model: {
                        'event': 'thisIsMyEventName',
                        'data': [
                            {
                                some: 'object',
                                representing: 'my'
                            },
                            'data'
                        ],
                        'stack': [
                            'this is part of the stack trace',
                            'this is another part'
                        ]
                    }
                });
                $('#content').children('ul').append(this.unit.getDom(this.unit));
                this.unit.show();
            });

            after(function() {
                $('#content').html('');
            });

            it('will display the provided PubSub event', function() {
                expect(this.unit.$('[event-name]').text()).to.equal(this.unit.model.get('event'), 'Event name is rendered');
                expect(this.unit.$('[event-args-small]').text()).to.equal(JSON.stringify(this.unit.model.get('data')), 'Event args (small) are rendered');
                expect(this.unit.$('[event-args]').text()).to.equal(JSON.stringify(this.unit.model.get('data'), null, 2), 'Event args are rendered');
                expect(this.unit.$('[stack-trace]').text()).to.equal(JSON.stringify(this.unit.model.get('stack'), null, 2), 'Stack trace is rendered');
            });

            it('won\'t display the small event args if it is an empty array', function() {
                this.unit.model.set('data', []);
                this.unit.render();
                expect(this.unit.$('[event-args-small]').size()).to.equal(0, 'Event args (small) are not rendered');
            });

            it('will display a short event name if provided', function() {
                var shortEventName = 'HideAll';
                this.unit.model.set('shortEventName', shortEventName);
                this.unit.render();
                expect(this.unit.$('[event-name]').text()).to.equal(shortEventName, 'Event name is rendered');
            });

            it('will add the current timestamp', function() {
                var $date = this.unit.$('[date]');
                var ts = parseInt($date.attr('timestamp'));

                expect(ts).to.be.lessThan(Date.now() + 1, 'Date is added');
                expect(ts).to.be.greaterThan(Date.now() - 10, 'Date is added');

                expect($date.text()).to.equal(new Moment(ts).format('HH:mm:ss.SSS'));
            });

            it('will hide everything but the event name when it loads', function() {
                expect(this.unit.$('[event-name]').is(':visible')).to.equal(true, 'Event name is visible');
                expect(this.unit.$('[event-args]').is(':visible')).to.equal(false, 'Event args are hidden');
                expect(this.unit.$('[stack-trace]').is(':visible')).to.equal(false, 'Stacktrace is hidden');
            });

            describe('when the user clicks on an event name', function() {
                beforeEach(function() {
                    this.unit.$('.title').trigger('click');
                });

                it('shows the data and stack trace', function() {
                    expect(this.unit.$('[event-args]').is(':visible')).to.equal(true, 'Event args are visible');
                    expect(this.unit.$('[stack-trace]').is(':visible')).to.equal(true, 'Stacktrace is visible');
                });

                it('adds the "open" css class', function() {
                    expect(this.unit.$el.hasClass('open')).to.equal(true, '"open" class is added');
                });

                describe('and the user clicks on the event name again', function() {
                    beforeEach(function() {
                        this.unit.$('.title').trigger('click');
                    });

                    it('removes the "open" css class', function() {
                        expect(this.unit.$el.hasClass('open')).to.equal(false, '"open" class is removed');
                    });

                    it('shows the data and stack trace', function() {
                        expect(this.unit.$('[event-args]').is(':visible')).to.equal(false, 'Event args are hidden');
                        expect(this.unit.$('[stack-trace]').is(':visible')).to.equal(false, 'Stacktrace is hidden');
                    });
                });
            });

            it('shows the view if a matching filter is provided (case insensitive)', function() {
                this.unit.hide();
                this.unit.filter('THisIsMyEVentN');
                expect(this.unit.$el.is(':visible')).to.equal(true, 'Event is visible');
            });

            it('hides the view if a non-matching filter is provided', function() {
                this.unit.show();
                this.unit.filter('thisIsNOTMyEventN');
                expect(this.unit.$el.is(':visible')).to.equal(false, 'Event is visible');
            });

            it('shows the view if a provided filter matches the short event name', function() {
                this.unit.model.set('shortEventName', 'RouteChanged');
                this.unit.hide();
                this.unit.filter('RouteCha');
                expect(this.unit.$el.is(':visible')).to.equal(true, 'Event is visible');
            });

            describe('when the replay button is clicked', function() {
                beforeEach(function() {
                    this.eventSpy = sinon.spy();
                    PubSub.subscribe(this.unit.model.get('event'), this.eventSpy);

                    this.unit.$('[replay]').trigger('click');
                });

                it('should replay the associated event (including arguments)', function() {
                    sinon.assert.calledOnce(this.eventSpy);
                    sinon.assert.calledWith(this.eventSpy, this.unit.model.get('data')[0], this.unit.model.get('data')[1]);
                });
            });

        });
    });
