'use strict';
define(['backbone', 'baseModel', 'underscore', 'moment', 'config', 'utils', 'templates'], function(Backbone, BaseModel, _, Moment, Config, Utils, t) {
    return {
        render: function(template, data, force) {
            var templateName = template;
            var templateFn;
            if (window.tenacityTemplates && window.tenacityTemplates[template]) {
                templateFn = window.tenacityTemplates[template];
            } else {
                templateFn = t[template];
            }

            if (!templateFn){
                if (!force) {
                    templateName = template.replace('.ejs', '').substring(template.lastIndexOf('/') + 1);
                    return 'No template found for <em>' + templateName + '</em>';
                }
                templateName = 'ad-hoc';
            }

            _.Moment = Moment;
            _.Config = Config;
            _.Utils = Utils;

            var model = data;
            if(data && !(model instanceof Backbone.Model)) {
                model = new BaseModel(data);
            }

            var res;
            if (templateFn) {
                res = templateFn(model);
            } else {
                res = _.template(template)(model);
            }

            if(Config.get('debug')) {
                res = '<!-- Template: $1 -->$2<!-- /Template: $1 -->'.format(templateName, res);
            }

            return res;
        }
    };
});