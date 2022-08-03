// If there's any way `any`s can be replaced here, it would already been used.
/*eslint @typescript-eslint/no-explicit-any: "off" */

/**
 * The information about the command
 */
class CmdInfo {
    /**
     * How many arguments the command has.
     * If is 0, than any more text is not allowed.
     */
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
    ctnt: [string, CmdInfo, (env: any, ...args: string[]) => any][] = [];

    /**
     * Add a command into the parser
     *
     * @param name - The name of the command
     * @param config - The information of the command
     * @param fn - The processing function of the command
     */
    cmd(name: string, config: CmdInfo, fn: (env: any, ...args: string[]) => any) {
        this.ctnt.push([name, new CmdInfo(config), fn]);
    }

    /**
     * Parse the command, returning a function to call the handler with appropriate argument.
     *
     * @param raw_msg - The raw message string
     */
    parse(raw_msg: string): ((env: any) => any) | null {
        for (const [name, info, proc] of this.ctnt) {
            if (info.nargs == 0) {
                if (name == (info.trim ? raw_msg.trim() : raw_msg)) {
                    return (env) => proc(env);
                }
            }
            else if (raw_msg.slice(0, name.length) == name) {
                return function(env) {
                    let rest = raw_msg.slice(name.length);
                    const args = [];
                    for (let i = 1; i < info.nargs; ++i) {
                        rest = rest.trimStart();
                        let end = rest.indexOf(" ");
                        if (end == -1)
                            end = rest.length;
                        args.push(rest.slice(0, end));
                        rest = rest.slice(end).trimStart();
                        if (rest.length == 0)
                            break;
                    }
                    if (rest.length > 0)
                        args.push(info.trim ? rest.trim() : rest);
                    return proc(env, ...args);
                }
            }
        }
        return null;
    }
}

export default { CmdParser };
