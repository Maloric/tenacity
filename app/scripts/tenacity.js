define(['baseView', 'baseModel', 'pubsub', 'events', 'router', 'application', 'utils', 'config', 'templates', 'eventExtender'],
function(BaseView, BaseModel, PubSub, Events, Router, Application, Utils, Config, Templates, EventExtender) {
    return {
        View: BaseView,
        Model: BaseModel,
        PubSub: PubSub,
        EventExtender: EventExtender,
        Events: Events,
        Router: Router,
        App: Application,
        Utils: Utils,
        Config: Config,
        Templates: Templates
    };
});