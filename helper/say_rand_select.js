/**
 * Iterate msglist, each has possibility to be selected, and say the selected one.
 *
 * @param {(msg: Sendable, delay?: number) => void} msg_say The function to say a message
 * @param {[number, ([Sendable, number?] | () => [Sendable, number?])][]} msglist The list of messages to be selected,
 * where the first item is the possibility to be selected, the second is the message.
 *
 * @returns {boolean} Whether said a message
 */
export function say_rand_select(msg_say, msglist) {
    for (const [possibility, msg] of msglist) {
        if (Math.random() < possibility) {
            let send = msg instanceof Function ? msg() : msg;
            msg_say.apply(msg_say, send);
            return true;
        }
    }
    return false;
}
