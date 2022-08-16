import { init_app } from "./index.js";

let msgid = 0;
let msgseq = 0;

function sendMsg(msg) {
    console.log(`sendMsg: ${JSON.stringify(msg)}`);
    return { seq: ++msgseq, rand: 0 };
}

function makemsg(raw, msg) {
    if (msg === undefined)
        msg = [{ type: 'text', text: raw }];
    const res = {
        message: msg,
        raw_message: raw,
        sender: {
            user_id: 114514,
        },
        group: {
            sendMsg,
        },
    };
    return res;
}

let process_groupmsg;

init_app((setting_data, procmsg) => {
    process_groupmsg = procmsg;

    return {
        image: (path) => `(image:${path})`,
        at: (id) => `(at:${id})`,
    };
});

process_groupmsg(makemsg(".bot on"));
