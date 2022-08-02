// Thanks Virginia Senioria(91khr)'s help! --Linca(Lhc_fl)
// Code writed by Senioria

/** 把转发bot的话翻译成人话, 就地转换.
 *
 * @param {GroupMessageEvent} e 消息.
 */

export function translate_fwdbot (e, sd) {
    // Clanstiae bot
    if (e.sender.user_id == sd.fwdbot1) {
        let raw_text = e.raw_message;
        if (e.message[0].type == "at") {
            raw_text = e.message[1].text;
        }
        const regex = /^([^\n]+)[:：]\s*\n((.|\n)*)/;
        const matched = raw_text.match(regex);
        
        console.log(matched);

        e.sender.nickname = matched[1];
        e.raw_message = matched[2];
    }
    if (e.sender.user_id == sd.fwdbot2) {
        let raw_text = e.message[0].text;
        const regex = /^([^\n]+)[:：]\s*\n((.|\n)*)/;
        const matched = raw_text.match(regex);

        console.log(matched);
        
        e.sender.nickname = matched[1];
        e.raw_message = matched[2];
    }
}
