import { Sendable } from "oicq";

/**
 * A message said by the bot. Can be either eager or lazy evaluated.
 * The first field is the message itself, and the second one is the delay of the message.
 */
export type BotMsg = [Sendable, number | undefined] | (() => [Sendable, number | undefined]);
