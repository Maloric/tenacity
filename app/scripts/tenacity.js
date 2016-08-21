define(['baseComponent', 'baseModel', 'pubsub', 'events', 'router', 'application', 'utils', 'config', 'templates', 'eventExtender', 'renderer', 'debugComponent'],
function(BaseComponent, BaseModel, PubSub, Events, Router, Application, Utils, Config, Templates, EventExtender, Renderer, DebugComponent) {
    return {
        Component: BaseComponent,
        Model: BaseModel,
        PubSub: PubSub,
        EventExtender: EventExtender,
        Events: Events,
        Router: Router,
        App: Application,
        Utils: Utils,
        Config: Config,
        Templates: Templates,
        Renderer: Renderer,
        DebugComponent: DebugComponent
    };
});