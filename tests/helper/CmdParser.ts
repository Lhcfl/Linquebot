// If there's any way `any`s can be replaced here, it would already been used.
/*eslint @typescript-eslint/no-explicit-any: "off" */
import { CmdParser } from "../../helper/CmdParser.js";
import { strictEqual as assert_eq } from "assert";
import test from "node:test";

test("simple commands", () => {
    const parser = new CmdParser();
    const cmdgen = (cname: string) =>
        (env: any, ...args: string[]) => `${cname} ${env}: ` + args.map(v => `'${v}'`).join(" ");
    parser.cmd("a", {}, cmdgen("a"));
    parser.cmd("b ", { trim: false }, cmdgen("b"));
    parser.cmd("c", { nargs: 3 }, cmdgen("c"));
    assert_eq(parser.parse("a")(1), "a 1: ");
    assert_eq(parser.parse("a bcd ef  ")(1), "a 1: 'bcd ef'");
    assert_eq(parser.parse("b"), null);
    assert_eq(parser.parse("b  cdef gh  ")(1), "b 1: ' cdef gh  '");
    assert_eq(parser.parse("c   qaq qwq  abc def")(1), "c 1: 'qaq' 'qwq' 'abc def'");
    assert_eq(parser.parse("c 1 2 3")(1), "c 1: '1' '2' '3'");
});
