'use strict';
define(['backbone', 'underscore', 'deepModel'], function(Backbone, _) {
    _.first = _.take; // Fix for the lack of a "first" method in Lodash, as DeepModel uses underscore
    var baseModel = Backbone.DeepModel.extend({
        defaults: {}
    });
    return baseModel;
});