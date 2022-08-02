var events = require("events");

var emitter = new events.EventEmitter();

emitter.once("some_event",function(){
    console.log("事件触发，调用此回调函数");
});

//触发事件some_event
emitter.emit("some_event");
emitter.emit("some_event");