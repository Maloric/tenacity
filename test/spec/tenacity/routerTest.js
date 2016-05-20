'use strict';
define(['tenacity', 'backbone', 'jquery', 'pubsub', 'router', 'events'],
    function(Tenacity, Backbone, $, PubSub, Router, Events) {
        testSetup('Router', function() {
            before(function() {
                this.originalUrl = window.location.href.split(window.location.host)[1];
            });

            beforeEach(function() {
                this.hideAllSpy = sinon.spy();
                var appRoutes = {
                    'my/:arg1/application/:arg2': 'myRouteName'
                };
                this.unit = new Router(appRoutes);
                PubSub.subscribe(Events.HideAll, this.hideAllSpy);
            });

            afterEach(function() {
                window.history.pushState({}, '', this.originalUrl);
                this.hideAllSpy.reset();
            });

            it('should navigate to the url provided by the Navigate event and provide a leading slash', function() {
                var spy = sinon.spy(Backbone.history, 'navigate');
                var url = 'testUrl';

                PubSub.publish(Events.Navigate, url);

                sinon.assert.calledOnce(spy);
                var call = spy.getCall(0);
                expect(call.args[0]).to.equal(url, 'Url is correct');
                expect(call.args[1]).to.deep.equal({
                    trigger: true,
                    replace: false
                }, 'The correct options are passed');
                Backbone.history.navigate.restore();
            });

            it('should SILENTLY navigate to the url provided by the Navigate event if the second parameter is false', function() {
                var spy = sinon.spy(Backbone.history, 'navigate');
                var url = 'testUrl';

                PubSub.publish(Events.Navigate, url, false);

                sinon.assert.calledOnce(spy);
                var call = spy.getCall(0);
                expect(call.args[0]).to.equal(url, 'Url is correct');
                expect(call.args[1]).to.deep.equal({
                    trigger: false,
                    replace: false
                }, 'The correct options are passed');
                Backbone.history.navigate.restore();
            });

            it('should not create a history entry if the third parameter provided to the Navigate event is true', function() {
                var spy = sinon.spy(Backbone.history, 'navigate');
                var url = 'testUrl';

                PubSub.publish(Events.Navigate, url, true, true);

                sinon.assert.calledOnce(spy);
                var call = spy.getCall(0);
                expect(call.args[0]).to.equal(url, 'Url is correct');
                expect(call.args[1]).to.deep.equal({
                    trigger: true,
                    replace: true
                }, 'The correct options are passed');
                Backbone.history.navigate.restore();
            });


            it('should raise a RouteChanged (ROUTENAME) event when the user navigates to the ROUTENAME url', function() {
                var spy = sinon.spy();
                PubSub.subscribe(Events.RouteChanged, spy);

                this.unit.navigate('my/custom/application/route', {
                    trigger: true
                });

                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, {
                    route: 'myRouteName',
                    options: ['custom', 'route', null]
                });
            });

        });
    });
