'use strict';

define(['pubsub'],
    function(PubSub) {
        testSetup('PubSub', function() {
            it('logs an event to the console if debug is true', function() {
                var spy = sinon.spy(window.console, 'log');
                window.tenacityConfig = {
                    debug: true
                };

                PubSub.publish('testEvent', { myKey: 'myValue' });

                sinon.assert.calledOnce(spy);

                window.console.log.restore();
                window.tenacityConfig = {
                    debug: false
                };
            });

            it('does not trigger an event if the event name is undefined', function() {
                var spy = sinon.spy(PubSub, 'trigger');
                PubSub.publish(undefined);
                sinon.assert.notCalled(spy);
                PubSub.trigger.restore();
            });

            it('does not trigger an event if the event name is blank', function() {
                var spy = sinon.spy(PubSub, 'trigger');
                PubSub.publish('');
                sinon.assert.notCalled(spy);
                PubSub.trigger.restore();
            });

            it('subscribes an event handler as the last handler (so far) if the third parameter is falsey', function() {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();

                PubSub.subscribe('testEvent', spy2);
                PubSub.subscribe('testEvent', spy1);

                PubSub.publish('testEvent');

                expect(spy2.calledBefore(spy1)).to.equal(true, 'Spy2 was called before Spy1');
            });

            it('subscribes an event handler as the FIRST handler (so far) if the third parameter is true', function() {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();

                PubSub.subscribe('testEvent', spy2);
                PubSub.subscribe('testEvent', spy1, true);

                PubSub.publish('testEvent');

                expect(spy1.calledBefore(spy2)).to.equal(true, 'Spy1 was called before Spy2');
            });

            it('does not register for events containing a space (since these are DOM event handlers)', function() {
                var spy1 = sinon.spy();
                var spy2 = sinon.spy();

                PubSub.subscribe('testEvent', spy1);
                PubSub.subscribe('click a.myLink', spy2);

                expect(Object.keys(PubSub._events).length).to.equal(1, 'No handlers are added for the DOM event');
            });
        });
    });
