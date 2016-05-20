define(['baseView', 'baseModel', 'pubsub', 'events', 'router', 'application', 'utils', 'config', 'templates'],
function(BaseView, BaseModel, PubSub, Events, Router, Application, Utils, Config, Templates) {
    return {
        View: BaseView,
        Model: BaseModel,
        PubSub: PubSub,
        Events: Events,
        Router: Router,
        App: Application,
        Utils: Utils,
        Config: Config,
        Templates: Templates
    };
});