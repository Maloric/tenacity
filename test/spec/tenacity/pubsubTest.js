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
        });
    });
