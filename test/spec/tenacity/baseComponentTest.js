'use strict';

define(['backbone', 'jquery', 'underscore', 'pubsub', 'baseComponent', 'events'],
    function(Backbone, $, _, PubSub, BaseComponent, Events) {
        testSetup('BaseComponent', function() {
            it('can be inherited and a model passed to the template', function() {
                var ChildComponent = BaseComponent.extend({
                    'template': '<h1><%= get(\'msg\') %></h1>'
                });

                var model = new Backbone.Model({
                    'msg': 'Hello world'
                });

                this.unit = new ChildComponent({
                    model: model,
                    el: '#content'
                });
                expect(this.unit).to.not.equal(undefined);
                expect(this.unit.$el.html()).to.equal('<h1>Hello world</h1>');
            });

            it('should subscribe to any events provided', function() {
                var spy = sinon.spy();
                PubSub.subscribe('secondEvent', spy);

                var ChildComponent = BaseComponent.extend({
                    events: {
                        'firstEvent': 'firstEventHandler'
                    },
                    firstEventHandler: function(obj) {
                        PubSub.publish('secondEvent', obj);
                    }
                });

                this.unit = new ChildComponent();

                PubSub.publish('firstEvent', {
                    'stuff': 'things'
                });
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, {
                    'stuff': 'things'
                });
            });

            it('should subscribe to DOM events', function() {
                var spy = sinon.spy();
                PubSub.subscribe('event', spy);

                var model = new Backbone.Model({});
                var ChildComponent = BaseComponent.extend({
                    events: {
                        'click div a.test': 'clickHandler'
                    },
                    'template': '<div><a class="test">test</a></div>',
                    'clickHandler': function() {
                        PubSub.publish('event', 'myTestData');
                    }
                });

                this.unit = new ChildComponent({
                    model: model,
                    el: '#content'
                });

                this.unit.$('a.test').trigger('click');
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, 'myTestData');
            });

            it('should resubscribe to any DOM events if the Component is replaced by a call to render when there was no DOM element provided', function() {
                var spy = sinon.spy();
                PubSub.subscribe('event', spy);

                var model = new Backbone.Model({});
                var ChildComponent = BaseComponent.extend({
                    events: {
                        'click a.test': 'clickHandler1',
                        'click div.element': 'clickHandler2'
                    },
                    'template': '<div class="element"><a class="test">test</a></div>',
                    'clickHandler1': function() {
                        PubSub.publish('event', 'myTestData1');
                    },
                    'clickHandler2': function() {
                        PubSub.publish('event', 'myTestData2');
                    }
                });

                this.unit = new ChildComponent({
                    model: model
                });

                $('#content').append('<div class="parent"></div>').html(this.unit.getDom());
                this.unit.render();

                this.unit.$('a.test').trigger('click');
                sinon.assert.calledTwice(spy);
                sinon.assert.calledWith(spy, 'myTestData1');
                sinon.assert.calledWith(spy, 'myTestData2');
            });

            it('should subscribe to any RouteChanged events', function() {
                var spy = sinon.spy();
                PubSub.subscribe('secondEvent', spy);

                var ChildComponent = BaseComponent.extend({
                    events: {
                        'route:myTestRoute': 'firstEventHandler'
                    },
                    firstEventHandler: function(obj) {
                        PubSub.publish('secondEvent', obj);
                    }
                });

                this.unit = new ChildComponent();

                PubSub.publish(Events.RouteChanged, {
                    route: 'myTestRoute',
                    options: [{
                        'stuff': 'things'
                    }]
                });
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, {
                    'stuff': 'things'
                });
            });

            it('should hide the Component if a non-matching RouteChanged event is published', function() {
                var ChildComponent = BaseComponent.extend({
                    events: {
                        'route:myTestRoute': 'firstEventHandler'
                    },
                    firstEventHandler: function() {

                    }
                });

                this.unit = new ChildComponent();
                var hideSpy = sinon.spy(this.unit, 'hide');

                PubSub.publish(Events.RouteChanged, {
                    route: 'myOTHERTestRoute',
                    options: []
                });

                sinon.assert.calledOnce(hideSpy);
            });

            it('should NOT hide the Component if a non-matching RouteChanged event is published but the Component has ignoreHideAll = true', function() {
                var ChildComponent = BaseComponent.extend({
                    ignoreHideAll: true,
                    events: {
                        'route:myTestRoute': 'firstEventHandler'
                    },
                    firstEventHandler: function() {

                    }
                });

                this.unit = new ChildComponent();
                var hideSpy = sinon.spy(this.unit, 'hide');

                PubSub.publish(Events.RouteChanged, {
                    route: 'myOTHERTestRoute',
                    options: []
                });

                sinon.assert.notCalled(hideSpy);
            });

            it('should match a parent route when a subset of that route is published', function() {
                var spy = sinon.spy();
                PubSub.subscribe('secondEvent', spy);

                var ChildComponent = BaseComponent.extend({
                    events: {
                        'route:myTestRoute': 'firstEventHandler'
                    },
                    firstEventHandler: function(obj) {
                        if (obj) {
                            PubSub.publish('secondEvent', obj);
                        }
                    }
                });

                this.unit = new ChildComponent();

                PubSub.publish(Events.RouteChanged, {
                    route: 'myTestRoute:selected',
                    options: [{
                        'stuff': 'things'
                    }]
                });
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, {
                    'stuff': 'things'
                });
            });

            it('should not wrap an inner Component with a random div', function() {
                var data = [new Backbone.Model({
                    prop: 'val1'
                }), new Backbone.Model({
                    prop: 'val2'
                }), new Backbone.Model({
                    prop: 'val3'
                })];
                var ChildComponent = BaseComponent.extend({
                    'template': '<li><%=get(\'prop\')%></li>'
                });

                var ParentComponent = BaseComponent.extend({
                    events: {
                        'myEvent': 'myHandler'
                    },
                    'template': '<ul></ul>',
                    'myHandler': function(data) {
                        this.destroyComponents();
                        this.collection = new Backbone.Collection(data);
                        this.Components = this.collection.map(this.createComponent, this);
                        this.$el.children('ul').append(_.map(this.Components, this.getDom, this));
                    },
                    createComponent: function(model) {
                        return new ChildComponent({
                            model: model
                        });
                    }
                });

                this.unit = new ParentComponent({
                    el: '#content'
                });

                PubSub.publish('myEvent', data);

                expect(this.unit.$el.children('ul').children('div').size()).to.equal(0, 'Div is not added');
                expect(this.unit.$el.children('ul').children('li').size()).to.equal(3, 'Correct child is added');
            });

            it('should hide a Component when the hideAll event is raised', function() {
                var ChildComponent = BaseComponent.extend({
                    'template': '<h1><%= get(\'msg\') %></h1>'
                });

                var model = new Backbone.Model({
                    'msg': 'Hello world'
                });

                this.unit = new ChildComponent({
                    model: model,
                    el: '#content'
                });
                expect(this.unit).to.not.equal(undefined);
                expect(this.unit.$el.html()).to.equal('<h1>Hello world</h1>');
                expect(this.unit.$el.is(':visible')).to.equal(true);

                PubSub.publish(Events.HideAll);
                expect(this.unit.$el.is(':visible')).to.equal(false);
            });

            it('should NOT hide a Component when the hideAll event is raised if the Component has ignoreHideAll', function() {
                var ChildComponent = BaseComponent.extend({
                    ignoreHideAll: true,
                    'template': '<h1><%= get(\'msg\') %></h1>'
                });

                var model = new Backbone.Model({
                    'msg': 'Hello world'
                });

                this.unit = new ChildComponent({
                    model: model,
                    el: '#content'
                });
                expect(this.unit).to.not.equal(undefined);
                expect(this.unit.events.HideAll).to.equal(undefined, 'No hide event is created');
                expect(this.unit.$el.html()).to.equal('<h1>Hello world</h1>');
                expect(this.unit.$el.is(':visible')).to.equal(true);

                PubSub.publish(Events.HideAll);
                expect(this.unit.$el.is(':visible')).to.equal(true);
            });

            it('should block and unblock the Component when the block / unblock method is called', function() {
                var ChildComponent = BaseComponent.extend({
                    'template': '<div></div>'
                });

                this.unit = new ChildComponent({
                    el: '#content'
                });

                expect(this.unit.$el.hasClass('blocked')).to.equal(false, 'UI is unblocked to begin with');

                this.unit.block();
                expect(this.unit.$el.hasClass('blocked')).to.equal(true, 'UI is blocked');

                this.unit.unblock();
                expect(this.unit.$el.hasClass('blocked')).to.equal(false, 'UI is unblocked');
            });

            describe('default model', function() {
                beforeEach(function() {
                    this.ChildComponentWithDefaults = BaseComponent.extend({
                        defaultModel: {
                            testProp1: 'testVal1',
                            testProp2: 'testVal2',
                            testProp3: 'testVal3',
                            testInt: 123
                        }
                    });
                });

                it('should add a default model if configured and no model was provided', function() {
                    this.unit = new this.ChildComponentWithDefaults();
                    expect(this.unit.model.get('testProp1')).to.equal('testVal1');
                    expect(this.unit.model.get('testProp2')).to.equal('testVal2');
                    expect(this.unit.model.get('testProp3')).to.equal('testVal3');
                    expect(this.unit.model.get('testInt')).to.equal(123);
                });

                it('should merge a provided model with the default properties', function() {
                    this.unit = new this.ChildComponentWithDefaults({
                        model: {
                            'testProp2': 'newTestVal2',
                            'testProp4': 'testVal4'
                        }
                    });

                    expect(this.unit.model.get('testProp1')).to.equal('testVal1');
                    expect(this.unit.model.get('testProp2')).to.equal('newTestVal2');
                    expect(this.unit.model.get('testProp3')).to.equal('testVal3');
                    expect(this.unit.model.get('testProp4')).to.equal('testVal4');
                    expect(this.unit.model.get('testInt')).to.equal(123);
                });

                it('should merge a provided proper model with the default properties', function() {
                    this.unit = new this.ChildComponentWithDefaults({
                        model: new Backbone.Model({
                            'testProp2': 'newTestVal2',
                            'testProp4': 'testVal4'
                        })
                    });

                    expect(this.unit.model.get('testProp1')).to.equal('testVal1');
                    expect(this.unit.model.get('testProp2')).to.equal('newTestVal2');
                    expect(this.unit.model.get('testProp3')).to.equal('testVal3');
                    expect(this.unit.model.get('testProp4')).to.equal('testVal4');
                    expect(this.unit.model.get('testInt')).to.equal(123);
                });

                it('should copy default properties rather than modifying them', function() {
                    this.unit = new this.ChildComponentWithDefaults({
                        model: {
                            testInt: 124
                        }
                    });
                    this.unit.model.set('testInt', 125);

                    expect(this.ChildComponentWithDefaults.prototype.defaultModel.testInt).to.equal(123, 'Default value is unchanged');
                });
            });

            describe('when a Component has handlers', function() {
                beforeEach(function() {
                    var ChildComponent = BaseComponent.extend({
                        events: {
                            'click div a.test': 'clickHandler',
                            'TestEvent': 'eventHandler',
                            'route:myTestRoute': 'routeHandler'
                        },
                        'template': '<div><a class="test">test</a></div>',
                        'clickHandler': function(){},
                        'eventHandler': function(){},
                        'routeHandler': function(){}
                    });

                    this.clickSpy = sinon.spy(ChildComponent.prototype, 'clickHandler');
                    this.eventSpy = sinon.spy(ChildComponent.prototype, 'eventHandler');
                    this.routeSpy = sinon.spy(ChildComponent.prototype, 'routeHandler');

                    this.unit = new ChildComponent({
                        el: '#content'
                    });

                    this.triggerClickEvent = function() {
                        this.unit.$('a.test').trigger('click');
                    };

                    this.triggerPubSubEvent = function() {
                        PubSub.publish('TestEvent');
                    };

                    this.triggerRoute = function() {
                        PubSub.publish(Events.RouteChanged, {
                            route: 'myTestRoute',
                            options: [{
                                'stuff': 'things'
                            }]
                        });
                    };

                });

                it('should respond to DOM events', function() {
                    this.triggerClickEvent();
                    sinon.assert.calledOnce(this.clickSpy);
                });

                it('should respond to PubSub events', function() {
                    this.triggerPubSubEvent();
                    sinon.assert.calledOnce(this.eventSpy);
                });

                it('should respond to routes', function() {
                    this.triggerRoute();
                    sinon.assert.calledOnce(this.routeSpy);
                });

                describe('and the Component is destroyed', function() {
                    beforeEach(function() {
                        this.unit.destroy();
                    });

                    it('should no longer respond to DOM events', function() {
                        this.triggerClickEvent();
                        sinon.assert.notCalled(this.clickSpy);
                    });

                    it('should no longer respond to PubSub events', function() {
                        this.triggerPubSubEvent();
                        sinon.assert.notCalled(this.eventSpy);
                    });

                    it('should no longer respond to routes', function() {
                        this.triggerRoute();
                        sinon.assert.notCalled(this.routeSpy);
                    });
                });
            });

            describe('routing', function() {
                beforeEach(function() {
                    var ChildComponent = BaseComponent.extend({
                        events: {
                            'route:myTestRoute123': 'routeHandler'
                        },
                        routeHandler: function() {},
                        hide: function() {}
                    });

                    this.unit = new ChildComponent({
                        el: '#content'
                    });

                    this.hideSpy = sinon.spy(this.unit, 'hide');
                });

                it('should call hide when a Component does not match the route', function() {
                    PubSub.publish(Events.RouteChanged, {
                        route:'SOMEOTHERURL',
                        options: [null]
                    });

                    sinon.assert.calledOnce(this.hideSpy);
                });

                it('should NOT call hide when a Component matches the route', function() {
                    PubSub.publish(Events.RouteChanged, {
                        route:'myTestRoute123',
                        options: [null]
                    });

                    sinon.assert.notCalled(this.hideSpy);
                });

                it('should NOT call hide when a Component matches only part of the route', function() {
                    PubSub.publish(Events.RouteChanged, {
                        route:'myTestRoute123:another:level',
                        options: [null]
                    });

                    sinon.assert.notCalled(this.hideSpy);
                });

                it('should not try to call hide if it does not exist (for instance when the data manager registers for routes)', function() {
                    delete this.unit.hide;

                    PubSub.publish(Events.RouteChanged, {
                        route:'myTestRoute123',
                        options: [null]
                    });
                });
            });

        });
    });
