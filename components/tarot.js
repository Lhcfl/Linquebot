import fs from "fs";
let tarots = JSON.parse(fs.readFileSync('./components/tarots.json'))

/**
 * 获得单张不重复塔罗牌
 *
 * @returns string of tarots
 * 
 */
let checkgroup = []
function get_one_tarot() {
    let res = "";
    do {
        let t = tarots[Math.floor(Math.random() * tarots.length)];
        res = Math.random() < 0.5 ? `${t.name} 顺位：\n${t.cis}` : `${t.name} 逆位：\n${t.trans}`;
    } while(checkgroup[res] != undefined);
    checkgroup[res] = 1;
    return res;
}

/**
 * 获得一组塔罗牌
 *
 * @param arg - 字符串，描述摸牌数,
 * where the first item is the weight to be selected, the rest are the messages.
 *
 * @returns list of tarots
 * 
 * 
 */
export function get_tarot(arg = "") {
    checkgroup = [];
    let num = Number(arg);
    if (isNaN(num)) { return "数字不对，不准乱玩琳酱哦！"; }
    if (num <= 0) { num = 1 }
    if (num >= 5) { return "不行，你点的牌太多啦！"; }
    let res = get_one_tarot();
    for (let i = 2; i<=num; i++) {
        res += "\n" + get_one_tarot();
    }
    return res;
}