import test from "node:test";
import assert from "assert";
import { say_rand_select } from "../../helper/say_rand_select.js"

let data = [];
for (let i = 0; i < 10; ++i) {
    data.push([i, i + 1]);
}

test("say something", () => {
    function check_eq(n, m) {
        return (p, q) => {
            if (n != p || m != q) {
                throw Error(`not eq: expect ${n}, ${m}, got ${p}, ${q}`);
            }
        };
    }

    let p;
    Math.random = () => p;
    p = 1;
    assert.strictEqual(say_rand_select(check_eq(0, 1), data, 2), true);
    p = 2;
    assert.strictEqual(say_rand_select(check_eq(4, 5), data, 2), false);

    Math.random = () => {
        p = p - 1;
        return p;
    };
    p = 9;  // 9 - 4 = 5
    assert.strictEqual(say_rand_select(check_eq(5, 6), data, 4), true);
    p = 10;  // 10 - 0 = 10, not found
    assert.strictEqual(say_rand_select(check_eq(5, 6), data, 0), false);
});