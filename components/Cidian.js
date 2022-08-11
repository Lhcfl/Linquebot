import fs from "fs";
let dic = JSON.parse(fs.readFileSync('./components/lib/dictionary.json'));

export function Cidian_query(str) {
    if (dic[str] == undefined) {
        return "词典里没有这个词。";
    } else {
        let ret = `${str}: 拼音：${dic[str].pinyin}` 
        if(dic[str].explanation != '无') { ret += `\n释义：${dic[str].explanation}`; }
        if(dic[str].derivation != '无') { ret += `\n来源：${dic[str].derivation}`; }
        if(dic[str].example != '无') { ret += `\n例子：${dic[str].example}`; }
        return ret;
    }
}