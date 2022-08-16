import { init_app } from "./index.js";

let msgid = 0;

function makemsg(msg) {
    const res = {
        message: msg,
        raw_message: String(msg),
        sender: {
            user_id: 114514,
        },
    };
    return res;
}

init_app((setting_data, process_groupmsg) => {
    process_groupmsg(makemsg(["qwq"]));

    return {
        image: (path) => `(image:${path})`,
        at: (id) => `(at:${id})`,
    };
});
