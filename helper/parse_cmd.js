// 解析：rawmsg为命令，cmdlist参考下面。
/**
 * @param {String} rawmsg e.raw_message
 *
 * @param {[[String, function]]} cmdlist
 * 
 * @returns func's return
 */

export function parse_cmd(rawmsg, cmdlist) {
    parse_cmd_impl(rawmsg, cmdlist).catch((e) => console.error(e));
}

async function parse_cmd_impl(rawmsg, cmdlist) {
    for (const [cmd, func] of cmdlist) {
        if (typeof cmd == "string") {
            if (cmd[0] != '!') {
                if (rawmsg.slice(0, cmd.length) == cmd) {
                    return await func({
                        iter: cmd.length,
                        left: rawmsg.slice(cmd.length, rawmsg.length)
                    });
                }
            } else {
                // 以"!"开头的命令要求严格匹配
                if (rawmsg == cmd.slice(1, cmd.length)) {
                    return await func({
                        iter: cmd.length,
                        left: ""
                    });
                }
            }
        } else if (typeof cmd == 'object') {
            for (const cmditem of cmd) {
                if (cmditem[0] != '!') {
                    if (rawmsg.slice(0, cmditem.length) == cmditem) {
                        return await func({
                            iter: cmditem.length,
                            left: rawmsg.slice(cmditem.length, rawmsg.length)
                        });
                    }
                } else {
                    // 以"!"开头的命令要求严格匹配
                    if (rawmsg == cmditem.slice(1, cmditem.length)) {
                        return await func({
                            iter: cmditem.length,
                            left: ""
                        });
                    }
                }
            }
        }
        
    }
}
