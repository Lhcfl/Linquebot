import oicq from "oicq";

export let createClient = oicq.createClient;

export let segment = oicq.segment;

export let testing = false;

setTimeout(() => {
    console.log(
        `--------------------
Welcome to Linquebot QQ mode
--------------------`
    )
}, 100);