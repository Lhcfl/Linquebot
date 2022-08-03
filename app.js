// 读取配置和模块
import fs from "fs";
import yaml from "js-yaml";
import { Markov } from "./components/Markov.js";
import { createClient, segment } from "oicq";

let setting_data = yaml.load(fs.readFileSync('./settings.yml'));
console.log(setting_data);

// 变量区
let senicount = 1.00;
let groups = {};
let sayings = [];
const account = setting_data.account;
const bot_owner = setting_data.bot_owner;
const client = createClient(account);
let mk = new Markov();

// 文件加载
load_database();


// 客户端登录
client.on("system.online", () => console.log("Logged in!"));

client.on("system.login.qrcode", function () {
  console.log("扫码后按回车登录");
  process.stdin.once("data", () => {
    this.login();
  })
}).login();



// 函数区
import { get_hitokoto } from "./components/hitokoto.js";
import { generate_pat_seni } from "./helper/generate_pat_seni.js";
import { rand_emo } from "./helper/rand_emo.js";
import { baike } from "./components/baike.js";
import { rand_unsure } from "./helper/rand_unsure.js";
import { translate_fwdbot } from "./helper/translate_fwdbot.js";
import { generate_feed_food } from "./helper/generate_feed_food.js";
import { generate_help, generate_help_admin, generate_help_user } from "./helper/generate_help.js";
import { say_rand_select } from "./helper/say_rand_select.js";

/**
 * 检查消息所在的群组是否启用了bot.
 *
 * @param {GroupMessageEvent} e 消息
 *
 * @returns bool
 */
function group_on_accesslist(e) {
    if (setting_data.whitelist == true) {
        for (let listindex in setting_data.whitelist_groups) {
            if (e.group_id == setting_data.whitelist_groups[listindex]) {
                return true;
            }
        }
        return false;
    } else {
        for (let listindex in setting_data.blacklist_groups) {
            if (e.group_id == setting_data.blacklist_groups[listindex]) {
                return false;
            }
        }
        return true;
    }
}


function load_database() {
    try{
        groups = JSON.parse(fs.readFileSync('./libs/rules.json'));
    } catch(err) {
        console.log(err);
        groups = {}
    }
    try{
        sayings = JSON.parse(fs.readFileSync('./libs/sayings.json'));
        for (let i in sayings) {
            mk.feedSentence(sayings[i]);
        }
    } catch(err) {
        console.log(err);
    }
}
function write_database() {
    fs.writeFile('libs/rules.json', JSON.stringify(groups),  function(err) {
        if (err) {
            return console.error(err);
        }
     });
    fs.writeFile('libs/sayings.json', JSON.stringify(sayings),  function(err) {
        if (err) {
            return console.error(err);
        }
    });
    if (Math.random() < 0.001) {
        fs.writeFile('libs/sayings' + (new Date()).toISOString() + ".bak.json", JSON.stringify(sayings),  function(err) {
            if (err) {
                return console.error(err);
            }
        });    
    }
}


/** 发现一个新群组
 *
 * @param {GroupMessageEvent} e
 */
function enter_new_group(e) {
    if (groups[e.group_id] == undefined) {
        groups[e.group_id] = {
            learn: false,
            boton: true,
            admins: {},
            bans: {},
            pre_said: [], // Bot上句话
            preword1: "",
            preword2: ""
        }
    }
}

function add_saying(e) {
    if (e.message[0].type != "text") {
        return;
    }
    if (e.raw_message[0] == ".") {
        return;
    }
    if (e.raw_message.slice(0,2)== "投喂") {
        return;
    }
    
    if (e.raw_message == "琳酱说说话") {
        return;
    }
    mk.feedSentence(e.raw_message);
    sayings.push(e.raw_message);
}

// 鉴权
function auth(e) {
    return e.sender.user_id == bot_owner ||
    e.sender.role == "owner" ||
    e.sender.role == "admin" ||
    groups[e.group_id].admins[e.sender.user_id] == true
    ;
}

function user_on_accesslist(e) {
    if (groups[e.group_id].bans[e.sender.user_id] == true) {
        return false;
    }
    if (groups[e.group_id].boton == false) {
        return false;
    }
    return true;
}

function repeat(e) {
    if (groups[e.group_id].preword1 == groups[e.group_id].preword2 && e.raw_message == groups[e.group_id].preword1 /*&& e.message[0].type == "text"*/) {
        groups[e.group_id].preword1 = "";
        groups[e.group_id].preword2 = "";
        msg_say(e, e.message, 300);
    } else {
        groups[e.group_id].preword2 = groups[e.group_id].preword1;
        groups[e.group_id].preword1 = e.raw_message;
    }
}

function discount_seni() {
    if (senicount > 2.01) {
        senicount -= 1;
    }
}

/**
 * 让bot说一句话
 *
 * @param {GroupMessageEvent} e
 */
function msg_say(e, words, typing_time = 4000) {
    function say_a_sentense() {
        const pro_temp = e.group.sendMsg(words)
        Promise.all([pro_temp]).then((values) => {
            const seq = values[0].seq;
            const rand = values[0].rand;
            groups[e.group_id].pre_said.push({seq: seq, rand: rand}); 
        })
    }
    setTimeout(say_a_sentense, typing_time);
    if(Math.random()<0.1) { discount_seni(); }
}

// client监控区

// 戳一戳
client.on("notice.group.poke", function (e) {

    if (e.target_id === this.uin){
        console.log(e);
        e.group.pokeMember(e.operator_id);
    }
})

/**
 * @param {GroupMessageEvent} e The event object.
 *
 * @returns {Promise<void>}
 */
async function process_groupmsg(e) {
    enter_new_group(e);
    translate_fwdbot(e, setting_data);
    console.log(group_on_accesslist(e) ? " " : "未列入白名单或被列入黑名单的群");
    if (group_on_accesslist(e) != true) { return; }

    if (e.raw_message == ".bot status") {

        msg_say(e,
            (groups[e.group_id].boton ? "bot处于打开状态" : "bot处于关闭状态") + "\n" +
            (groups[e.group_id].learn ? "bot正在学习语料" : "bot没在学习语料")
            ,100);

    }
    if (e.raw_message == ".status") {
        const saying_msg = [
            segment.at(e.sender.user_id),
            "您的bot状态是：\n禁用：",
            (groups[e.group_id].bans[e.sender.user_id] == true ? "是" : "否"),
            "\n管理：",
            (auth(e) ? "是" : "否"),
        ]
        msg_say(e, saying_msg, 100);
    }
    // console.log(e);
    if (auth(e)) {
        console.log("-----\n鉴权的发言者");
        if (e.raw_message == ".bot cc") {
            if (groups[e.group_id].pre_said.length == 0) return;
            console.log(groups[e.group_id]);
            const pre_tmp = groups[e.group_id].pre_said[groups[e.group_id].pre_said.length -1]
            
            e.group.recallMsg(pre_tmp.seq, pre_tmp.rand);   
            groups[e.group_id].pre_said = groups[e.group_id].pre_said.slice(0, groups[e.group_id].pre_said.length-1);
        }

        if (e.raw_message == ".bot on") {
            groups[e.group_id].boton = true;
            msg_say(e, "bot 已打开", 100);

        }

        if (e.raw_message == ".bot clear") {
            groups[e.group_id].pre_said = [];
            msg_say(e, "已清除历史", 100);
        }
        if (e.raw_message == ".bot nuclear") {
            msg_say(e, "boom！！！！！！", 100);
        }

        if (e.message[0].text == ".auth " && e.message[1] != undefined && e.message[1].type == "at") {
            groups[e.group_id].admins[e.message[1].qq] = true;
            const saying_msg = [
                "已经对",
                segment.at(e.message[1].qq),
                "授予bot admin权限",
            ]
            msg_say(e, saying_msg, 100);
        }

        if (e.message[0].text == ".authoff " && e.message[1] != undefined && e.message[1].type == "at") {
            groups[e.group_id].admins[e.message[1].qq] = false;
            const saying_msg = [
                "已经对",
                segment.at(e.message[1].qq),
                "撤销bot admin权限",
            ]
            msg_say(e, saying_msg, 100);
        }

        if (e.message[0].text == ".ban " && e.message[1] != undefined && e.message[1].type == "at") {
            groups[e.group_id].bans[e.message[1].qq], true;
            const saying_msg = [
                "已经撤销",
                segment.at(e.message[1].qq),
                "的bot使用权限",
            ]
            msg_say(e, saying_msg, 100);
        }

        if (e.message[0].text == ".deban " && e.message[1] != undefined && e.message[1].type == "at") {
            groups[e.group_id].bans[e.message[1].qq], false;
            const saying_msg = [
                "已经恢复",
                segment.at(e.message[1].qq),
                "的bot使用权限",
            ]
            msg_say(e, saying_msg, 100);
        }
        if (e.raw_message == ".learn on") {
            groups[e.group_id].learn = true;
            msg_say(e, "bot 语料收集打开", 100);
            return;
        }

    }

    if (user_on_accesslist(e)){
        
        if (groups[e.group_id].learn) { add_saying(e); }
        if (e.raw_message == ".bot off") {
            groups[e.group_id].boton = false;
            msg_say(e, "bot 关闭", 100);
            return;
        }
        if (e.raw_message == ".learn off") {
            groups[e.group_id].learn = false;
            msg_say(e, "bot 语料收集关闭", 100);
            return;
        }

        let someone_at_me = false;
        repeat(e);

        for (let msgid in e.message) {
            if (e.message[msgid].qq == account) {
                someone_at_me = true;
            }
        }

        if (someone_at_me) {
            if (e.message.length == 1) {
                msg_say(e, e.sender.nickname +"~ 找我有事吗~");
            } else if (e.raw_message.indexOf("说确实") != -1 ) {
                msg_say(e, "确实", 500);
            } else if (e.raw_message.indexOf("说对不") != -1 ) {
                msg_say(e, "对", 500);
            } else if (e.raw_message.indexOf("说对吧") != -1 ) {
                msg_say(e, "对", 500);
            } else if (e.raw_message.indexOf("说是不") != -1 ) {
                msg_say(e, "是", 500);
            } else if (e.raw_message.indexOf("说是吧") != -1 ) {
                msg_say(e, "是", 500);
            } else if (e.raw_message.indexOf("说www") != -1 ) {
                msg_say(e, "www", 500);
            } else if (e.raw_message.indexOf("说问号") != -1 ) {
                msg_say(e, "？", 500);
            } else if (e.raw_message.indexOf("说说得对") != -1 ) {
                msg_say(e, "说得对", 500);
            } else if (e.raw_message.indexOf("说有道理") != -1 ) {
                msg_say(e, "有道理", 500);
            } else if (e.raw_message.indexOf("快面点") != -1 ) {
                msg_say(e, generate_pat_seni(), 500);
            } else if (e.message[1].text.slice(0,3) == " 快说就不说略略略" && !auth(e)) {
                msg_say(e, "你以为我会上当吗略略略", 500);
                const saying_msg = [
                    segment.image("./tmp/jumpjump.gif"),
                ]
                msg_say(e, saying_msg, 4000);
            } else if (e.message[1].text.slice(0,3) == " 快说" && !auth(e)) {
                msg_say(e, "就不说略略略", 500);
            } else if (e.message[1].text.indexOf("智障") != -1 && !auth(e)) {
                msg_say(e, "不准你说我是人工智障！", 500);
            } else if (e.message[1].text.indexOf("智障") != -1 && auth(e)) {
                msg_say(e, "好吧琳酱会努力的啦……", 500);
            } else if (e.raw_message.indexOf("摸摸头") != -1) {
                msg_say(e, "诶w——谢谢w", 500);
                msg_say(e, "被摸了 嬉しい嬉しい！！", 4000);
            } else if (e.raw_message.indexOf("结婚") != -1) {
                msg_say(e, "琳酱是未成年（超小声认真脸", 500);
                msg_say(e, "毕竟距离诞生还不到一年呢！是小孩子！", 4000);
            } else if (e.raw_message.indexOf("主人") != -1 && !auth(e)) {
                msg_say(e, "你才不是琳酱主人呢！", 500);
            } else if (e.raw_message.indexOf("主人") != -1 && auth(e) && ( e.sender.user_id == bot_owner || e.sender.user_id == setting_data.senioria) ) {
                msg_say(e, "只要不抛弃琳酱" + e.sender.nickname +"就是永远的主人pwq", 500);
            } else if (e.raw_message.indexOf("主人") != -1 && auth(e)) {
                msg_say(e, "你才不是琳酱主人呢！", 500);
                msg_say(e, "等等？好像你是？", 4000);
            } else if (e.raw_message.indexOf("吗") != -1 || e.raw_message.indexOf("？") != -1 ) {
                msg_say(e, rand_unsure(), 500);
            } else {
                const msglist = [
                    [0.2, ["pwq"]],
                    [0.2, ["qwp"]],
                    [0.2, ["pwq"]],
                    [0.2, ["pwp"]],
                    [0.2, ["quq"]],
                    [0.2, ["qup"]],
                    [0.2, ["qaq"]],
                    [0.2, ["quq"]],
                    [0.2, ["qeq"]],
                ];
                say_rand_select((msg, delay) => msg_say(e, msg, delay), msglist);    
            }

        } else {

            if (e.raw_message == "pwq") {
                msg_say(e, "pwq", 1000);
            }
            else if (e.message[0].file == 'ba0be33ac52963615856444798b9288625592-200-200.gif') {
                const msglist = [
                    [0.2, ["摸摸……"]],
                    [0.2, ["摸摸……（超小声"]],
                    [0.2, () => [generate_pat_seni()]],
                    [0.2, ["揉揉揉……"]],
                    [0.2, ["patpat……（超小声"]],
                    [0.2, ["贴贴……"]],
                    [0.2, ["sigh，揉揉的说……（超小声"]],
                ];
                say_rand_select((msg, delay) => msg_say(e, msg, delay), msglist);
            }

            else if (e.sender.user_id == setting_data.senioria){

                if (e.message[0].file== '91bcacbf96b97489ff5f1d540d1d92dc110841-300-300.png') {
                    msg_say(e, generate_pat_seni(), 300);
                } else if(e.message[0].file==  'e587448ca4d53bfaae4e8ec894ab7a20197675-512-449.png') {
                    msg_say(e, generate_pat_seni(), 300);
                } else if (Math.random() < 0.15/senicount ) {
                    msg_say(e, "seni强强（超小声（被打死");
                    senicount+=2;
                }

            }
            else {
                const msglist = [
                    // Lazy evaluate the image loading >_< (Super small voice (Be killed (Run away
                    [0.02, () => [[segment.image("./tmp/emo1.jpg")]]],
                    [0.01, () => [[segment.image("./tmp/emo2.jpg")]]],
                    [0.01, () => [[segment.image("./tmp/emo3.jpg")]]],
                    [0.01, () => [[segment.image("./tmp/jumpjump.gif")]]],
                    [0.01, () => [[segment.image("./tmp/diamao.gif")]]],
                    [0.01, ["说得对"]],
                    [0.01, ["确实"]],
                    [0.01, ["是"]],
                    [0.01, ["有道理"]],
                    [0.01, ["嗯……"]],
                    [0.01, ["www"]],
                ];
                say_rand_select((msg, delay) => msg_say(e, msg, delay), msglist);
            }


            if (e.raw_message == ".help") {
                msg_say(e, generate_help(), 500);
            }
            if (e.raw_message == ".help user") {
                msg_say(e, generate_help_user(), 500);
            }
            if (e.raw_message == ".help admin") {
                msg_say(e, generate_help_admin(), 500);
            }


            if (e.raw_message == "揉揉bot") {
                msg_say(e, "www也揉揉"+e.sender.nickname+"的说", 2000);
            }


            if (e.raw_message == ".hitokoto") {
                const hitokoto_obj = await get_hitokoto();
                msg_say(e, hitokoto_obj.hitokoto + "\n ——" + hitokoto_obj.from, 1000);
            }
            if (e.raw_message == ".hitorino") {
                msg_say(e, "是 .hitokoto 啦，hitorino跑路了pwq", 1000);
            }


            // 被舍弃的搜索版本
            // if (e.raw_message.slice(0,8) == ".search ") {
            //     keyword = e.raw_message.slice(8, e.raw_message.length)
            //     search_e.once(keyword+ "get", function(results) {
            //         console.log(results);
            //         msg_say(e, results, 10);
            //     });
            //     make_search(keyword);
            // }

            if (e.raw_message.slice(0,8) == ".search ") {
                const keyword = e.raw_message.slice(8, e.raw_message.length)
                const result = await baike(keyword);
                msg_say(e, result.success ? result.text: "搜索失败：" + result.text, 10);
            }

            if (e.raw_message == ".rand") {

                msg_say(e, e.sender.nickname + " 掷出的概率是 " + String(Math.floor(Math.random()*100)) + "%", 1000);

            }
            if (e.raw_message == ".rand 琳酱是人工智障" || e.raw_message == ".randnoid 琳酱是人工智障") {

                msg_say(e, "琳酱不是人工智障呜呜呜，琳酱是人工智障的概率是0%", 1000);
                return;

            }
            

            if (e.raw_message.slice(0,6) == ".rand ") {
                msg_say(e,
                    e.sender.nickname + " "
                    + e.raw_message.slice(6, e.raw_message.length) + " 的概率是 "
                    + String(Math.floor(Math.random()*100)) + "%"
                    , 2000
                );

            }
            if (e.raw_message.slice(0,10) == ".randnoid ") {
                msg_say(e,
                    e.raw_message.slice(10, e.raw_message.length) + " 的概率是 "
                    + String(Math.floor(Math.random()*100)) + "%"
                    , 2000
                );

            }

            if (e.raw_message == "琳酱说说话") {
                try{
                    const temp_text = mk.genSentence("");
                    console.log(temp_text);
                    msg_say(e, temp_text, 1000);
                } catch(err) {
                    console.log(err);
                }
            }

            if (e.raw_message.slice(0,7) == ".reply ") {
                const tmp_a = String(e.raw_message.slice(7,e.raw_message.length));
                console.log(tmp_a);
                try{
                    const temp_text = mk.genSentence(tmp_a);
                    console.log(temp_text);
                    msg_say(e, tmp_a + temp_text, 1000);
                } catch(err) {
                    console.log(err);
                }
            }

            if (e.raw_message.slice(0,2) == "投喂") {
                const msglist = generate_feed_food(e.raw_message.slice(2, e.raw_message.length));
                for (const [saying, delay] of msglist) {
                    msg_say(e, saying, delay);
                }
            }

            if (e.raw_message.slice(0,2) == ". ") {
                if (e.raw_message.indexOf("智障") != -1 && !auth(e) && e.raw_message.indexOf("不") == -1) {
                    if (e.raw_message.indexOf("我") != -1 || e.raw_message.indexOf("琳酱") != -1) {
                        msg_say(e, "不准你说我是人工智障！", 500);
                        return;
                    }
                }
                const end_punct = [",", "，", "。", "！", "!", "；", ";", "？", "?", "：", "……", "、", "."];
                if (end_punct.indexOf(e.raw_message[e.raw_message.length - 1]) != -1) {
                    msg_say(e,
                        e.raw_message.slice(2, e.raw_message.length)
                        + "嘟，琳酱" + rand_emo() + "地说。"
                        , 500
                    );
                }
                else {
                    msg_say(e,
                        e.raw_message.slice(2, e.raw_message.length)
                        + "，嘟，琳酱" + rand_emo() + "地说。"
                        , 500
                    );
                }
            }


        }



    }
    write_database();
}

client.on("message.group", async function(e) {
    try {
        await process_groupmsg(e);
    }
    catch (err) {
        console.error(err);
    }
})

