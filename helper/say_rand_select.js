/**
 * Iterate msglist, each has possibility to be selected, and say the selected one.
 *
 * @param {(msg: Sendable, delay?: number) => void} msg_say The function to say a message
 * @param {[Sendable, number?][]} msglist The list of messages to be selected
 * @param {number} possibility The possibility of each message to be selected.
 *
 * @returns {boolean} Whether said a message
 */
export function say_rand_select(msg_say, msglist, possibility) {
    for (const msg of msglist) {
        if (Math.random() < possibility) {
            msg_say.apply(msg_say, msg);
            return true;
        }
    }
    return false;
}
