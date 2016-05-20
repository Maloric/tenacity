'use strict';
define(['backbone', 'baseModel', 'underscore', 'moment', 'config', 'utils', 'templates'], function(Backbone, BaseModel, _, Moment, Config, Utils, t) {
    return {
        render: function(template, data, force) {
            var templateFn;

            templateFn = t[template];

            if (!templateFn && !force) {
                var templateName = template.replace('.ejs', '').substring(template.lastIndexOf('/') + 1);
                return 'No template found for <em>' + templateName + '</em>';
            }

            _.Moment = Moment;
            _.Config = Config;
            _.Utils = Utils;
            //TODO: Allow custom methods to be attached to Underscore in order to be available in templates
            // _.Translate = TranslationManager.translate;

            var model = data;
            if (data && !(model instanceof Backbone.Model)) {
                model = new BaseModel(data);
            }

            if (templateFn) {
                return templateFn(model);
            } else {
                return _.template(template)(model);
            }
        }
    };
});