import { CmdParser } from "../../helper/CmdParser.js";
import { strictEqual as assert_eq } from "assert";
import test from "node:test";

test("simple commands", () => {
    const parser = new CmdParser();
    const cmdgen = (cname: string) =>
        (...args: string[]) => `${cname}: ` + args.map(v => `'${v}'`).join(" ");
    parser.cmd("a", {}, cmdgen("a"));
    parser.cmd("b ", { trim: false }, cmdgen("b"));
    parser.cmd("c", { nargs: 3 }, cmdgen("c"));
    assert_eq(parser.parse("a")(), "a: ");
    assert_eq(parser.parse("a bcd ef  ")(), "a: 'bcd ef'");
    assert_eq(parser.parse("b"), null);
    assert_eq(parser.parse("b  cdef gh  ")(), "b: ' cdef gh  '");
    assert_eq(parser.parse("c   qaq qwq  abc def")(), "c: 'qaq' 'qwq' 'abc def'");
    assert_eq(parser.parse("c 1 2 3")(), "c: '1' '2' '3'");
});
