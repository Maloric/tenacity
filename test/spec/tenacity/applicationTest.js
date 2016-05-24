'use strict';
define(['tenacity', 'jquery', 'moment', 'events', 'templates'],
    function(Tenacity, $, Moment, Events, Templates) {
        testSetup('Application', function() {
            describe('when an application is instantiated', function() {
                beforeEach(function() {
                    this.hideAllSpy = sinon.spy();
                    Tenacity.PubSub.subscribe(Tenacity.Events.HideAll, this.hideAllSpy);

                    var self = this;
                    this.apiManager = {};
                    this.fakeApiManager = {
                        isFake: true
                    };

                    this.customTemplate = function() {
                        return 'my template string';
                    };

                    this.initCallbackSpy = sinon.spy();
                    this.destroyCallbackSpy = sinon.spy();

                    this.opts = {
                        apiManager: function() {
                            return self.apiManager;
                        },
                        fakeApiManager: function() {
                            return self.fakeApiManager;
                        },
                        templates: {
                            MyCustomTemplate: this.customTemplate
                        },
                        initCallback: this.initCallbackSpy,
                        destroyCallback: this.destroyCallbackSpy
                    };
                    this.unit = new Tenacity.App(this.opts);
                });

                it('should initialize the apiManager and attach it to the application', function() {
                    expect(this.unit.apiManager).to.equal(this.apiManager);
                });

                it('should initialize a fake apiManager if configured to do so', function() {
                    this.opts.useFakeApiManager = true;

                    this.unit.init(this.opts);

                    expect(this.unit.apiManager).to.not.equal(undefined, 'Api Manager was set');
                    expect(this.unit.apiManager.isFake).to.equal(true, 'Fake Api Manager was used');
                });

                it('should call the initCallback if supplied', function() {
                    sinon.assert.calledOnce(this.initCallbackSpy);
                });

                it('should call the destroyCallback if supplied and destroy is called', function() {
                    this.unit.destroy();
                    sinon.assert.calledOnce(this.destroyCallbackSpy);
                });

                it('should modify the Templates list to include any custom templates', function() {
                    expect(Templates.MyCustomTemplate).to.equal(this.customTemplate);
                });

                it('should publish a HideAll method', function() {
                    sinon.assert.calledOnce(this.hideAllSpy);
                });

                it('should initialize a router when initRouter is called', function() {
                    var appRoutes = {
                        '/route/path': 'routeName'
                    };
                    expect(this.unit.router).to.equal(undefined, 'Router is not set to begin with');
                    this.unit.initRouter(appRoutes);
                    expect(this.unit.router).to.not.equal(undefined, 'Router is created');
                    expect(this.unit.router instanceof Tenacity.Router).to.equal(true, 'Router is of correct type');
                    expect(this.unit.router.routes).to.equal(appRoutes, 'Routes are provided');
                });

                it('should, every 60 seconds, update any displayed dates that are relative to the present', function() {
                    var spy = sinon.spy(window, 'setInterval');
                    var context = this.unit;

                    // The only way to test the anonymous function passed to setInterval (which is needed
                    // in order to correctly pass the context to the updateTimes method) is to create a
                    // custom matcher and use a spy to test that updateTimes was called with the correct
                    // context parameter
                    var anonymousFunc = sinon.match(function (func) {
                        var updateTimesSpy = sinon.spy(context, 'updateTimes');
                        func(context);

                        context.updateTimes.restore();
                        if (updateTimesSpy.calledOnce && updateTimesSpy.calledWith(context)) {
                            return true;
                        }
                        return false;
                    }, '(anonymous function provided to setInterval)');

                    this.unit.init(this.opts);

                    sinon.assert.calledOnce(spy);
                    sinon.assert.calledWith(spy, anonymousFunc, 60000);
                    expect(this.unit.timestampUpdateInterval).to.not.equal(undefined, 'Timestamp setInterval has been created');
                    window.setInterval.restore();
                });

                it('should clear the update timestamp interval if the application is destroyed', function() {
                    var spy = sinon.spy(window, 'clearInterval');
                    this.unit.init(this.opts);

                    this.unit.destroy();

                    sinon.assert.calledOnce(spy);
                    sinon.assert.calledWith(spy, this.unit.timestampUpdateInterval);
                });

                it('should refresh any displayed date when the updateTimes function is called', function() {
                    var randomDate = function() {
                        var startDate = new Date('2000-01-01T00:00:00');
                        var endDate = new Date();
                        var randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
                        var timestamp = parseInt(randomDate.getTime() / 1000);
                        return timestamp;
                    };

                    this.unit.init(this.opts);

                    for(var i = 0; i < 10; i++) {
                        var timestamp = randomDate();
                        $('#content').append('<span data-timestamp="' + timestamp + '">' + Moment.unix(timestamp).fromNow() + '</span>');
                    }

                    // The easiest way to test this is to change the timestamp and test that the times are updated,
                    // but in reality the timestamp remains the same and Moment is simply called to update the date
                    // every sixty seconds.

                    $('[data-timestamp]').each(function() {
                        $(this).attr('data-timestamp', randomDate());
                    });

                    this.unit.updateTimes();

                    $('[data-timestamp]').each(function() {
                        var $el = $(this);
                        var timestamp = parseInt($(this).attr('data-timestamp'));
                        expect($el.text()).to.equal(Moment.unix(timestamp).fromNow(), 'New date text is set correctly');
                    });
                });
            });
        });
    });
