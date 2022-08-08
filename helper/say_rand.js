/**
 * Iterate msglist, each has possibility to be selected, and say the selected one.
 *
 * @param msg_say - The function to say a message
 * @param msglist - The list of messages to be selected,
 * where the first item is the possibility to be selected, the rest are the messages.
 *
 * @returns Whether said a message
 */
export function say_rand_linear( msg_say, msglist ){
    for (const iter of msglist) {
        if (Math.random() < iter[0]) {
            const msgs = iter.slice(1);
            for (const msg of msgs) {
                const send = msg instanceof Function ? msg() : msg;
                msg_say.apply(msg_say, send);
            }
            return true;
        }
    }
    return false;
}


/**
 * Say a message with possibility, and select the message to be said by its weight.
 *
 * @param msglist - The list of messages to be selected,
 * where the first item is the weight to be selected, the rest are the messages.
 *
 * @returns Whether said a message
 */
export function say_rand_equal(msg_say, msglist, possibility ) {
    const generated_msglist = [];
    for (const iter of msglist) {
        // 不允许赋太高的权值，因为该过程会按照权重复制值
        for (let i = 1; i <= iter[0]; i++) {
            generated_msglist.push(iter.slice(1, iter.length));
        }
    }
    if (Math.random() < possibility) {
        const msgs = generated_msglist[Math.floor(Math.random() * generated_msglist.length)];
        for (const msg of msgs) {
            const send = msg instanceof Function ? msg() : msg;
            msg_say.apply(msg_say, send);
        }
        return true;
    }
    return false;
}
