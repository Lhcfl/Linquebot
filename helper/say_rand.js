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
    for (const [possibility, msg] of msglist) {
        if (Math.random() < possibility) {
            let send = msg instanceof Function ? msg() : msg;
            msg_say.apply(msg_say, send);
            return true;
        }
    }
    return false;
}

/**
 * Iterate msglist, each has possibility to be selected, and say the selected one.
 *
 * @param {(msg: Sendable, delay?: number) => void} msg_say The function to say a message
 * @param {[Integer, ([Sendable, number?] | () => [Sendable, number?])][]} msglist The list of messages to be selected,
 * where the first item is the possibility to be selected, the second is the message.
 *
 * @returns {boolean} Whether said a message
 */
export function say_rand_equal(msg_say, msglist, possibility) {
    let generated_msglist = [];
    for (const [weight, msg] of msglist) {
        for (let i = 1; i <= weight; i++) {
            generated_msglist.push(msg);
        }
    }
    if (Math.random() < possibility) {
        let msg = generated_msglist[Math.floor(Math.random() * generated_msglist.length)];
        let send = msg instanceof Function ? msg() : msg;
        msg_say.apply(msg_say, send);
        return true;
    }
    return false;
}