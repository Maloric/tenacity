'use strict';
define(['backbone', 'jquery', 'pubsub', 'events', 'renderer', 'templates'],
    function(Backbone, $, PubSub, Events, Renderer, t) {
        testSetup('Renderer', function() {

            describe('when the template key is not found', function() {
                describe('and force is falsy', function() {
                    beforeEach(function() {
                        this.res = Renderer.render('not a template key', {});
                    });

                    it('will return an error', function() {
                        expect(this.res).to.contain('No template found for ');
                    });
                });

                describe('and force is truthy', function() {
                    beforeEach(function() {
                        this.renderResult = function() {
                            this.res = Renderer.render('this should <%= get(\'test\') %>', {
                                test: 'render'
                            }, true);
                        };

                        this.renderResult();
                    });

                    it('will treat the template as an ad-hoc one if force is truthy', function() {
                        expect(this.res).to.equal('this should render');
                    });

                    describe('and debug is true', function() {
                        beforeEach(function() {
                            window.tenacityConfig = {
                                debug: true
                            };

                            this.renderResult();
                        });

                        it('will add debug comments with "ad-hoc" as the template key', function() {
                            expect(this.res).to.equal('<!-- Template: ad-hoc -->this should render<!-- /Template: ad-hoc -->');
                        });
                    });
                });
            });

            describe('when the template key is found', function() {
                beforeEach(function() {
                    this.renderResult = function() {
                        var self = this;
                        this.templateKey = 'testTemplate';
                        this.templateHtml = 'this is a template';
                        t[this.templateKey] = function() {
                            return self.templateHtml;
                        };
                        this.res = Renderer.render(this.templateKey);
                    };

                    this.renderResult();
                });

                describe('and debug is true', function() {
                    beforeEach(function() {
                        window.tenacityConfig = {
                            debug: true
                        };

                        this.renderResult();
                    });

                    it('will add debug comments with the template key', function() {
                        expect(this.res).to.equal('<!-- Template: ' + this.templateKey + ' -->' + this.templateHtml + '<!-- /Template: ' + this.templateKey + ' -->');
                    });
                });
            });

        });
    });