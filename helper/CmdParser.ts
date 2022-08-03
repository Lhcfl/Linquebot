/**
 * The information about the command
 */
class CmdInfo {
    /** How many arguments the command has */
    nargs?: number = 1;
    /** Whether trim out the spaces around the rest args */
    trim?: boolean = true;

    constructor(o = {}) {
        Object.assign(this, o);
    }
}

/**
 * A parser and dispatcher for the commands
 */
export class CmdParser {
    ctnt: [string, CmdInfo, (...args: string[]) => any][] = [];

    /**
     * Add a command into the parser
     *
     * @param name - The name of the command
     * @param config - The information of the command
     * @param fn - The processing function of the command
     */
    cmd(name: string, config: CmdInfo, fn: (...args: string[]) => any) {
        this.ctnt.push([name, new CmdInfo(config), fn]);
    }

    /**
     * Parse the command, returning a function to call the handler with appropriate argument.
     *
     * @param raw_msg - The raw message string
     */
    parse(raw_msg: string): (() => any) | null {
        for (const [name, info, proc] of this.ctnt) {
            if (raw_msg.slice(0, name.length) == name) {
                return function() {
                    let rest = raw_msg.slice(name.length);
                    const args = [];
                    for (let i = 1; i < info.nargs; ++i) {
                        rest = rest.trimStart();
                        const end = rest.indexOf(" ");
                        args.push(rest.slice(0, end));
                        rest = rest.slice(end).trimStart();
                        if (rest.length == 0)
                            break;
                    }
                    if (rest.length > 0)
                        args.push(info.trim ? rest.trim() : rest);
                    return proc(...args);
                }
            }
        }
        return null;
    }
}

export default { CmdParser };
