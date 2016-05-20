require.config({
    baseUrl: '/base/app/bower_components'
});
require(['../scripts/common'], function() {
    require.config({
        baseUrl: '/base/app/bower_components',
        paths: {
            'testSetup': '../../test/helpers/testSetup',
            'apiManager': '../scripts/helpers/apiManager',
            'testData': '../scripts/helpers/testData/testData'
        }
    });

    mocha.setup('bdd');
    require(['testSetup'], function(testSetup) {
        window.expect = chai.expect;
        window.testSetup = testSetup;

        if (window._phantom) {
            // Patch since PhantomJS does not implement click() on HTMLElement. In some
            // cases we need to execute the native click on an element. However, jQuery's
            // $.fn.click() does not dispatch to the native function on <a> elements, so we
            // can't use it in our implementations: $el[0].click() to correctly dispatch.
            if (!HTMLElement.prototype.click) {
                HTMLElement.prototype.click = function() {
                    var ev = document.createEvent('MouseEvent');
                    ev.initMouseEvent(
                        'click',
                        /*bubble*/
                        true, /*cancelable*/ true,
                        window, null,
                        0, 0, 0, 0, /*coordinates*/
                        false, false, false, false, /*modifier keys*/
                        0 /*button=left*/ , null
                    );
                    this.dispatchEvent(ev);
                };
            }
        }

        require([
            '/base/test/specs.js'
        ], function() {
            // mocha.run();
            window.__karma__.start();
        });
    });

});
