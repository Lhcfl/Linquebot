// 解析：rawmsg为命令，cmdlist参考下面。
/**
 * @param {String} rawmsg e.raw_message
 *
 * @param {[[String, function]]} cmdlist
 * 
 * @returns func's return
 */
export async function parse_cmd(rawmsg, cmdlist) {
    for (const [cmd, func] of cmdlist) {
        if (rawmsg.slice(0, cmd.length) == cmd) {
            return await func({
                iter: cmd.length,
                left: rawmsg.slice(cmd.length, rawmsg.length)
            });
        }
    }
}