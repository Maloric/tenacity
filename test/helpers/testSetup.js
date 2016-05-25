/* global define, describe, afterEach */

'use strict';
define(['jquery', 'pubsub'], function($, PubSub) {
    if (!document.getElementById('content')) {
        $('<div id="content"></div>').appendTo('body');
    }

    var globalBeforeEach = function() {
        beforeEach(function() {
            $('#content').show();
        });
    };

    var globalAfterEach = function() {
        afterEach(function() {
            $('#content').hide();
            if (this.unit && this.unit.destroy && typeof(this.unit.destroy) === 'function') {
                this.unit.destroy();
            }

            PubSub.stopListening();

            window.tenacityConfig = {
                debug:false
            };
        });
    };

    var addGlobals = function(fn) {
        return function() {

            this.timeout(600000);

            globalBeforeEach();

            globalAfterEach();

            fn();
        };
    };

    var testSetup = function(title, fn) {
        describe(title, addGlobals(fn));
    };

    testSetup.only = function(title, fn) {
        describe.only(title, addGlobals(fn));
    };
    testSetup.skip = function(title, fn) {
        describe.skip(title, addGlobals(fn));
    };

    return testSetup;
});
