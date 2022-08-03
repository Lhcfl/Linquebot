/**
 * Iterate msglist, each has possibility to be selected, and say the selected one.
 *
 * @param {(msg: Sendable, delay?: number) => void} msg_say The function to say a message
 * @param {[number, ([Sendable, number?] | () => [Sendable, number?])][]} msglist The list of messages to be selected,
 * where the first item is the possibility to be selected, the second is the message.
 *
 * @returns {boolean} Whether said a message
 */
export function say_rand_linear(msg_say, msglist) {
    for (const iter of msglist) {
        if (Math.random() < iter[0]) {
            let msgs = iter.slice(1, iter.length);
            for (const msg of msgs) {
                let send = msg instanceof Function ? msg() : msg;
                msg_say.apply(msg_say, send);
            }
        }
    }
    return false;
}


export function say_rand_equal(msg_say, msglist, possibility) {
    let generated_msglist = [];
    for (const iter of msglist) {
        // 不允许赋太高的权值，因为该过程会按照权重复制值
        for (let i = 1; i <= iter[0]; i++) {
            generated_msglist.push(iter.slice(1, iter.length));
        }
    }
    if (Math.random() < possibility) {
        let msgs = generated_msglist[Math.floor(Math.random() * generated_msglist.length)];
        for (const msg of msgs) {
            let send = msg instanceof Function ? msg() : msg;
            msg_say.apply(msg_say, send);
        }
        return true;
    }
    return false;
}