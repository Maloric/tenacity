define(['baseView', 'baseModel', 'pubsub', 'events', 'router', 'tenacityApplication', 'utils', 'config', 'templates'],
function(BaseView, BaseModel, PubSub, Events, Router, TenacityApplication, Utils, Config, Templates) {
    return {
        View: BaseView,
        Model: BaseModel,
        PubSub: PubSub,
        Events: Events,
        Router: Router,
        App: TenacityApplication,
        Utils: Utils,
        Config: Config,
        Templates: Templates
    };
});