'use strict';
define(['backbone', 'jquery', 'pubsub', 'events', 'renderer'],
    function(Backbone, $, PubSub, Events, Renderer) {
        testSetup('Renderer', function() {
            it('will return an error if force is falsy and the template was not found', function() {
                var res = Renderer.render('not a template key', {});
                expect(res).to.contain('No template found for ');
            });

            it('will treat the template as an ad-hoc one if force is truthy and the template was not found', function() {
                var res = Renderer.render('this should <%= get(\'test\') %>', { test: 'render' }, true);
                expect(res).to.equal('this should render');
            });

            it.only('will prefer any templates attached to window.tenacityTemplates', function() {
                var templateKey = 'app/scripts/tenacity/templates/debugEventView.ejs';
                var expected = 'this is my template output';
                window.tenacityTemplates = {};
                window.tenacityTemplates[templateKey] = function() {
                    return expected;
                };

                var res = Renderer.render(templateKey);
                expect(res).to.equal(expected);
            });
        });
    });
