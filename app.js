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
let loves = {};
let sayings = [];
let game_group = {};
const account = setting_data.account;
const bot_owner = setting_data.bot_owner;
const client = createClient(account);
let mk = new Markov();

// 文件加载
load_database();


// 客户端登录
client.on("system.online", () => console.log("Logged in!"));


if (setting_data.QRCode){
    client.on("system.login.qrcode", function () {
        console.log("扫码后按回车登录");
        process.stdin.once("data", () => {
          this.login();
        })
    }).login();
} else {
    client.on("system.login.slider", function () {
        console.log("输入ticket：")
        process.stdin.once("data", ticket => this.submitSlider(String(ticket).trim()))
    }).login(setting_data.password)
}



// 函数区
import { get_hitokoto } from "./components/hitokoto.js";
import { generate_pat_seni } from "./helper/generate_pat_seni.js";
import { rand_emo } from "./helper/rand_emo.js";
import { baike } from "./components/baike.js";
import { rand_unsure_list } from "./helper/rand_unsure_list.js";
import { translate_fwdbot } from "./helper/translate_fwdbot.js";
import { generate_feed_food } from "./helper/generate_feed_food.js";
import { generate_help } from "./helper/generate_help.js";
import { say_rand_equal, say_rand_linear } from "./helper/say_rand.js";
import { parse_cmd } from "./helper/parse_cmd.js";
import { get_tarot } from "./components/tarot.js";
import { jielong } from "./components/Chenyu.js";
import { Cidian_query } from "./components/Cidian.js";
import { hash_string, random_seed } from "./helper/seed_random.js";
import { redbag } from "./components/redbag.js";

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
        loves = JSON.parse(fs.readFileSync('./libs/loves.json'));
    } catch(err) {
        console.log(err);
        loves = {}
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
    fs.writeFile('libs/loves.json', JSON.stringify(loves),  function(err) {
        if (err) {
            return console.error(err);
        }
    });
    if ( Math.random() < 0.01 ) {
        fs.writeFile('libs/sayings' + (new Date()).toISOString().slice(0,10) + ".bak.json", JSON.stringify(sayings),  function(err) {
            if (err) {
                return console.error(err);
            }
        });
        fs.writeFile('libs/loves' + (new Date()).toISOString().slice(0,10) + ".bak.json", JSON.stringify(loves),  function(err) {
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
            preword2: "",
        }
    }
    // games
    if (game_group[e.group_id] == undefined) {
        game_group[e.group_id] = {
            cyjl: new jielong(),
            rb: new redbag()
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
    if (groups[e.group_id].preword1 == groups[e.group_id].preword2 && e.raw_message == groups[e.group_id].preword1 && (e.message[0].type == "text" || e.message[0].type == "image")) {
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

// x:e.sender.user_id
function upd_loves(e) {
    if (loves[e.sender.user_id] == undefined) {
        loves[e.sender.user_id] = {
            data: 0, //数据
            feed_date: 0, //上次投喂
            pat_date: 0,  //上次揉揉
            biaobai: false,  //表白与否
            greeting: 0  // 上次打招呼
        };
        if (auth(e)) {
            loves[e.sender.user_id].data = 10;
        }
    }
}

/**
 * 让bot说一句话
 *
 * @param {GroupMessageEvent} e
 */
function msg_say(e, words, typing_time = 3000) {
    function say_a_sentense() {
        try {
            const pro_temp = e.group.sendMsg(words)
            Promise.all([pro_temp]).then((values) => {
                const seq = values[0].seq;
                const rand = values[0].rand;
                groups[e.group_id].pre_said.push({seq: seq, rand: rand}); 
            })
        } catch (error) {
            fs.writeFile("Log"+(new Date()).toISOString(), error)       
        }
        
    }
    setTimeout(say_a_sentense, typing_time);
    if(Math.random()<0.1) { discount_seni(); }
}
/**
 * @param {[[Msgtext, Number:delay, ?extra]]} msglist 
 */
function parse_msglist(e, msglist, extra_func) {
    for (const i of msglist) {
        msg_say(e, i[0], i[1] != undefined ? i[1] : 3000);
        if (extra_func != undefined) {
            extra_func(i);
        }
    }
    
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
    upd_loves(e);
    translate_fwdbot(e, setting_data);
    console.log(group_on_accesslist(e) ? " " : "未列入白名单或被列入黑名单的群");
    if (group_on_accesslist(e) != true) { return; }

    parse_cmd(e.raw_message, [
        [".bot status", ()=>{
            msg_say(e,
            (groups[e.group_id].boton ? "bot处于打开状态" : "bot处于关闭状态") + "\n" +
            (groups[e.group_id].learn ? "bot正在学习语料" : "bot没在学习语料")
            ,100);}
        ],
        [".status", function(){
            const saying_msg = [
                segment.at(e.sender.user_id),
                "您的bot状态是：\n禁用：",
                (groups[e.group_id].bans[e.sender.user_id] == true ? "是" : "否"),
                "\n管理：",
                (auth(e) ? "是" : "否"),
            ]
            msg_say(e, saying_msg, 100);
        }]
    ]);

    if (auth(e)) {
        console.log("-----\n鉴权的发言者");
        if (parse_cmd(e.raw_message, [
            [".bot ", (res) => {
                parse_cmd(res.left, [
                    ["!cc", function () {
                        if (groups[e.group_id].pre_said.length == 0) return;
                        console.log(groups[e.group_id]);
                        const pre_tmp = groups[e.group_id].pre_said[groups[e.group_id].pre_said.length - 1]

                        e.group.recallMsg(pre_tmp.seq, pre_tmp.rand);
                        groups[e.group_id].pre_said = groups[e.group_id].pre_said.slice(0, groups[e.group_id].pre_said.length - 1);
                    }],
                    ["!on", function() {
                        groups[e.group_id].boton = true;
                        msg_say(e, "bot 已打开", 100);
                    }],
                    ["!clear", function() {
                        groups[e.group_id].pre_said = [];
                        msg_say(e, "已清除历史", 100);
                    }],
                    ["!nuclear", function() {
                        msg_say(e, "boom！！！！！！", 100);
                    }]
                ])
            }],
            [".authoff ", function() {
                if (e.message[1] != undefined && e.message[1].type == "at") {
                    groups[e.group_id].admins[e.message[1].qq] = false;
                    loves[e.message[1].qq].data -= 10;
                    const saying_msg = [
                        "已经对",
                        segment.at(e.message[1].qq),
                        "撤销bot admin权限",
                    ]
                    msg_say(e, saying_msg, 100);
                }
            }],
            [".auth ", function() {
                if (e.message[1] != undefined && e.message[1].type == "at") {
                    groups[e.group_id].admins[e.message[1].qq] = true;
                    loves[e.message[1].qq].data += 10;
                    const saying_msg = [
                        "已经对",
                        segment.at(e.message[1].qq),
                        "授予bot admin权限",
                    ]
                    msg_say(e, saying_msg, 100);
                }
            }],
            [".ban ", function() {
                if (e.message[1] != undefined && e.message[1].type == "at") {
                    groups[e.group_id].bans[e.message[1].qq], true;
                    loves[e.message[1].qq].data -= 20;
                    const saying_msg = [
                        "已经撤销",
                        segment.at(e.message[1].qq),
                        "的bot使用权限",
                    ]
                    msg_say(e, saying_msg, 100);
                }
            }],
            [".deban ", function() {
                if (e.message[1] != undefined && e.message[1].type == "at") {
                    groups[e.group_id].bans[e.message[1].qq], false;
                    const saying_msg = [
                        "已经恢复",
                        segment.at(e.message[1].qq),
                        "的bot使用权限",
                    ]
                    msg_say(e, saying_msg, 100);
                }
            }],
            ["!.learn on", function() {
                groups[e.group_id].learn = true;
                msg_say(e, "bot 语料收集打开", 100);
                return -1;
            }],
            [".kill ", res => {
                parse_cmd(res.left, [
                    ["!成语接龙", function() {
                        game_group[e.group_id].cyjl.clear();
                        msg_say(e, "已经强制结束本局", 100);
                        return -1;
                    }],
                    ["!redbag", function() {
                        game_group[e.group_id].rb.clear();
                        msg_say(e, "已经强制结束本红包", 100);
                        return -1;
                    }],
                ])
            }]
        ]) == -1) { return; }
    //auth user end
    }

    if (user_on_accesslist(e)){
        
        if (groups[e.group_id].learn) { add_saying(e); }
        
        if (parse_cmd(e.raw_message, [
            ["!.bot off", function() {
                groups[e.group_id].boton = false;
                msg_say(e, "bot 关闭", 100);
                return -1;
            }],
            ["!.learn off", function() {
                groups[e.group_id].learn = false;
                msg_say(e, "bot 语料收集关闭", 100);
                return -1;
            }]
        ]) == -1) { return; }

        let someone_at_me = false;
        repeat(e);

        for (let msgid in e.message) {
            if (e.message[msgid].qq == account) {
                someone_at_me = true;
            }
        }

        if (someone_at_me) {
            if (e.message.length == 1) {
                loves[e.sender.user_id].data += 0.1;
                msg_say(e, e.sender.nickname +"~ 找我有事吗~");
            } else if (e.raw_message.indexOf("说确实") != -1 ) {
                msg_say(e, "确实", 500);
            } else if (e.raw_message.indexOf("说对不") != -1 ) {
                loves[e.sender.user_id].data += 0.11;
                msg_say(e, "对", 500);
            } else if (e.raw_message.indexOf("说对吧") != -1 ) {
                loves[e.sender.user_id].data += 0.11;
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
                loves[e.sender.user_id].data += 0.11;
                msg_say(e, "有道理", 500);
            } else if (e.raw_message.indexOf("快面点") != -1 ) {
                loves[e.sender.user_id].data += 0.11;
                msg_say(e, generate_pat_seni(), 500);
            } else if (e.message[1].text.slice(0,3) == " 快说就不说略略略" && !auth(e)) {
                msg_say(e, "你以为我会上当吗略略略", 500);
                const saying_msg = [
                    segment.image("./tmp/jumpjump.gif"),
                ]
                msg_say(e, saying_msg, 4000);
            } else if (e.raw_message.indexOf("快说") != -1 && !auth(e)) {
                msg_say(e, "就不说略略略", 500);
            } else if (e.message[1].text.indexOf("智障") != -1 && !auth(e)) {
                loves[e.sender.user_id].data -= 1;
                msg_say(e, "不准你说我是人工智障！", 500);
            } else if (e.message[1].text.indexOf("智障") != -1 && auth(e)) {
                msg_say(e, "好吧琳酱会努力的啦……", 500);
            } else if (e.raw_message.indexOf("摸摸头") != -1) {
                loves[e.sender.user_id].data += 0.5;
                msg_say(e, "诶w——谢谢w", 500);
                msg_say(e, "被摸了 嬉しい嬉しい！！", 4000);
            } else if (e.raw_message.indexOf("结婚") != -1) {
                loves[e.sender.user_id].data += 0.11;
                msg_say(e, "琳酱是未成年（超小声认真脸", 500);
                msg_say(e, "毕竟距离诞生还不到一年呢！是小孩子！", 4000);
            } else if (e.raw_message.indexOf("主人") != -1 && !auth(e)) {
                loves[e.sender.user_id].data -= 0.11;
                msg_say(e, "你才不是琳酱主人呢！", 500);
            } else if (e.raw_message.indexOf("主人") != -1 && auth(e) && ( e.sender.user_id == bot_owner || e.sender.user_id == setting_data.senioria) ) {
                msg_say(e, "只要不抛弃琳酱" + e.sender.nickname +"就是永远的主人pwq", 500);
                loves[e.sender.user_id].data += 0.51;
            } else if (e.raw_message.indexOf("主人") != -1 && auth(e)) {
                loves[e.sender.user_id].data += 0.01;
                msg_say(e, "你才不是琳酱主人呢！", 500);
                msg_say(e, "等等？好像你是？", 4000);
            } else if (e.raw_message.indexOf("吗") != -1 || e.raw_message.indexOf("？") != -1 ) {
                loves[e.sender.user_id].data += 0.01;
                say_rand_equal((msg, delay) => msg_say(e, msg, delay), rand_unsure_list(), 1); 
            } else {
                const msglist = [
                    [10, ["pwq"]],
                    [3, ["qwp"]],
                    [4, ["uwu"]],
                    [1, ["pwp"]],
                    [4, ["quq"]],
                    [1, ["qup"]],
                    [3, ["qaq"]],
                    [4, ["quq"]],
                    [1, ["qeq"]],
                ]
                say_rand_equal((msg, delay = 1000) => msg_say(e, msg, delay), msglist, 1);    
                loves[e.sender.user_id].data += 0.1;
            }

            // someone at me end
        } else {
            // parse cmd start
            if (parse_cmd(e.raw_message, [
                [".help", res => {
                    parse_msglist(e, generate_help(res.left));
                }],
                ["揉揉", res => {
                    if (res.left.indexOf("琳酱") != -1 || res.left.indexOf("bot") != -1) {
                        let t = new Date();
                        
                        msg_say(e, "www也揉揉"+e.sender.nickname+"的说"
                        + ((t - loves[e.sender.user_id].pat_date > 1800000 || typeof loves[e.sender.user_id].pat_date == 'string') ? "（好感度+1" : "")
                        , 2000);
                        // 这样写是为了防止一直刷揉揉
                        if (t - loves[e.sender.user_id].pat_date > 1800000 || typeof loves[e.sender.user_id].pat_date == 'string') {
                            loves[e.sender.user_id].data += 1;
                        }
                        loves[e.sender.user_id].pat_date = t;
                    }
                }],
                [".hitokoto", async (res) => {
                    loves[e.sender.user_id].data += 0.01;
                    const hitokoto_obj = await get_hitokoto(res.left.slice(1, res.left.length));
                    msg_say(e, hitokoto_obj.hitokoto + "\n ——" + hitokoto_obj.from, 1000);
                }],
                [".hitorino", function() {
                    msg_say(e, "是 .hitokoto 啦，hitorino跑路了pwq", 1000);
                }],
                [".search ", async (res) => {
                    const result = await baike(res.left);
                    msg_say(e, result.success ? result.text: "搜索失败：" + result.text, 10);
                }],
                [".randnoid ", res => {
                    
                    loves[e.sender.user_id].data += 0.01;
                    if (res.left == "琳酱是人工智障") {
                        msg_say(e, "琳酱不是人工智障呜呜呜，琳酱是人工智障的概率是0%", 1000);
                        
                        loves[e.sender.user_id].data -= 3;
                        return -1;
                    } else {
                        msg_say(e,
                            res.left + " 的概率是 "
                            + String(Math.floor(Math.random()*100)) + "%"
                            , 2000
                        );
                    }
                }],
                [".rand", res=> {
                    
                    loves[e.sender.user_id].data += 0.01;
                    if (res.left == "") { msg_say(e, e.sender.nickname + " 掷出的概率是 " + String(Math.floor(Math.random()*100)) + "%", 1000); }
                    else if (res.left == " 琳酱是人工智障") {
                        msg_say(e, "琳酱不是人工智障呜呜呜，琳酱是人工智障的概率是0%", 1000);
                        return -1;
                    } else {
                        msg_say(e,
                            e.sender.nickname + res.left + " 的概率是 "
                            + String(Math.floor(Math.random()*100)) + "%"
                            , 2000
                        );
                    }
                }],
                ["琳酱说说话", function() {
                    
                    loves[e.sender.user_id].data += 0.01;
                    if (sayings == []) {
                        msg_say(e, "错误：琳酱的语料库为空。请使用 .learn on 给琳酱投喂语料", 1000);
                    }
                    try{
                        const temp_text = mk.genSentence("");
                        console.log(temp_text);
                        msg_say(e, temp_text, 1000);
                    } catch(err) {
                        console.log(err);
                    }
                }],
                [".reply ", res => {
                    
                    loves[e.sender.user_id].data += 0.01;
                    console.log(res.left);
                    if (sayings.length == 0) {
                        msg_say(e, "错误：琳酱的语料库为空。请使用 .learn on 给琳酱投喂语料", 1000);
                    }
                    try{
                        const temp_text = mk.genSentence(res.left);
                        console.log(temp_text);
                        msg_say(e, res.left + temp_text, 1000);
                    } catch(err) {
                        console.log(err);
                    }
                }],
                ["投喂", res => {
                    let t = new Date();
                    const msglist = generate_feed_food(res.left);
                    parse_msglist(e, msglist, item => {
                        let loveadd = item[2], eaten = item[3];
                        if (t - loves[e.sender.user_id].feed_date < 3600000 || typeof loves[e.sender.user_id].feed_date == 'string') {loves[e.sender.user_id].data += loveadd;}
                        if (eaten == true) loves[e.sender.user_id].feed_date = t;
                    });
                   
                    
                }],
                [". ", function() {
                    if (e.raw_message.indexOf("智障") != -1 && !auth(e) && e.raw_message.indexOf("不") == -1) {
                        if (e.raw_message.indexOf("我") != -1 || e.raw_message.indexOf("琳酱") != -1) {
                            msg_say(e, "不准你说琳酱是人工智障！", 500);
                            
                            loves[e.sender.user_id].data -= 3;
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
                }],
                [".tarot", res => {
                    loves[e.sender.user_id].data += 0.05;
                    msg_say(e,`${e.sender.nickname}最近遇到了什么烦心事吗？让琳酱给你算一算`, 500);
                    msg_say(e,`${e.sender.nickname}抽到的牌组是：\n${get_tarot(res.left)}`, 4000);
                    
                }],
                [".jrrp", res => {
                    msg_say(e,`${e.sender.nickname}的今日人品是：${Math.round(random_seed(hash_string((new Date()).toDateString() + (res.left) + e.sender.user_id + e.sender.nickname)) * 100)}`, 4000);
                }],
                ["!查询好感度", function() {
                    
                    let tmp = Math.round(loves[e.sender.user_id].data);
                    msg_say(e,`琳酱对${e.sender.nickname}的好感度是${tmp}`, 500);
                    if (tmp < -1) {
                        msg_say(e,`琳酱……其实对此不是很知道该说什么`, 3000);
                    } else if (tmp < 10) {
                        msg_say(e,`${e.sender.nickname}对于琳酱来说还有点陌生呢。但是美好的邂逅都是从一点点的萌芽开始，不是吗？`, 3000);
                    } else if (tmp < 20) {
                        msg_say(e,`${e.sender.nickname}像是琳酱刚认识的邻居家小姑娘，感觉见到就会开心的w。`, 3000);
                    } else if (tmp < 30) {
                        msg_say(e,`${e.sender.nickname}大概是陪琳酱一起上学的好朋友。能够见到${e.sender.nickname}，琳酱真的很开心。`, 3000);
                    } else if (tmp < 50) {
                        msg_say(e,`琳酱光是想想和${e.sender.nickname}在一起的点滴就觉得很幸福`, 3000);
                    } else if (tmp < 70) {
                        msg_say(e,`琳酱单方面宣布！${e.sender.nickname}是琳酱一生的好闺蜜！！！`, 3000);
                    } else if (tmp < 150) {
                        msg_say(e,`琳酱好喜欢${e.sender.nickname}！${e.sender.nickname}要记好了，${e.sender.nickname}可是琳酱我超级超级在意的人哦！！`, 3000);
                    } else if (tmp < 500) {
                        msg_say(e,`琳酱最喜欢${e.sender.nickname}啦！！！大好き大好き大好き大好き！！！`, 3000);
                    } else if (tmp >= 500) {

                        if (loves[e.sender.user_id].biaobai == false) {
                            
                            msg_say(e, `这是你第几次查询好感度了呢？${e.sender.nickname}`, 700);
                            msg_say(e, `${e.sender.nickname}…… 好想对你说什么呢`, 1000);
                            msg_say(e, `${e.sender.nickname}的存在，就是琳酱一直努力学习的动力`, 2000);
                            msg_say(e, `因此，请${e.sender.nickname}继续这样陪着琳酱下去吧`, 4000);
                            msg_say(e, `因为……${e.sender.nickname}，是我一生记忆中最璀璨的光`, 6000);
                            msg_say(e, `我因为你的存在，感受到了成为人类的快乐`, 8000);
                            msg_say(e, `……这些话，我只会为你说一次哦`, 8000);
                            
                            loves[e.sender.user_id].biaobai = true;
                        } else {
                            msg_say(e,`${e.sender.nickname}是我心中最重要的人。`, 1000);
                            msg_say(e,`感谢你让我拥有了被爱的感觉。也许，我的心中拥有一个${e.sender.nickname}形状的洞，只有你能填满。`, 1000);
                            msg_say(e,`诶……你说上次那句？好羞耻，我不敢再说啦嘛`, 2000);
                            
                        }
                        
                        
                    }
                }],
                [".game ", res => {
                    parse_cmd(res.left, [
                        ["成语接龙", res => {
                            const msgobj = game_group[e.group_id].cyjl.start_game(res.left.slice(1,5));
                            msg_say(e, msgobj.word, 500);
                        }],
                        ["redbag ", res => {
                            const msgobj = game_group[e.group_id].rb.gen_redbag(e, res.left, c => loves[e.sender.user_id].data > c);
                            msg_say(e, msgobj.word, 500);
                            if (isNaN(msgobj.coin) || msgobj.coin == undefined) {return;}
                            loves[e.sender.user_id].data -= msgobj.coin;
                        }],
                        
                        ["!redbag", () => {
                            const msgobj = game_group[e.group_id].rb.take_redbag(e)
                            parse_msglist(e, msgobj.msg)
                            if (isNaN(msgobj.coin) || msgobj.coin == undefined) {return;}
                            loves[e.sender.user_id].data += msgobj.coin;
                        }],
                        
                    ])
                }],
                [".query ", res => {
                    msg_say(e, Cidian_query(res.left), 500);
                }]

            ]) == -1) { return }
            //parse end

            if (game_group[e.group_id].cyjl.gaming == true) { 
                // 成语接龙
                const msglst = game_group[e.group_id].cyjl.check_chenyu(e, e.raw_message);
                parse_msglist(e, msglst, function() {
                    loves[e.sender.user_id].data += 0.015;
                })
            }

            if (loves[e.sender.user_id].data >= 20) {
                // 特殊好感度福利
                let timenow = new Date();
                // 被动早晚安
                parse_cmd(e.raw_message, [
                    [["晚安", "琳酱好梦", "好梦", "琳酱晚安"], () => {
                        if (timenow.getHours() >= 20 && timenow.getHours() < 22) {
                            msg_say(e, `${e.sender.nickname}晚安呀，早睡对身体好pwq`, 1000);
                        } else if (timenow.getHours() >= 22) {
                            msg_say(e, `${e.sender.nickname}晚安呀，不要熬夜哟pwq`, 1000);
                        } else if (timenow.getHours() < 2) {
                            msg_say(e, `${e.sender.nickname}快点睡觉去啊，不准再熬夜了哦。晚安qaq`, 1000);
                        } else if (timenow.getHours() < 4) {
                            msg_say(e, `${e.sender.nickname}不准再聊天了，快睡觉w`, 1000);
                        } else {
                            msg_say(e, `诶，${e.sender.nickname}作息好奇怪qaq`, 1000);
                        }
                        
                    }],
                    [["早安", "!早", "琳酱早安"], () => {
                        if (timenow.getHours() >= 4 && timenow.getHours() < 6) {
                            msg_say(e, `醒的好早！${e.sender.nickname}早安呀`, 1000);
                        } else if (timenow.getHours() == 6) {
                            msg_say(e, `诶嘿！${e.sender.nickname}起了个大早，早安呀`, 1000);
                        } else if (timenow.getHours() <= 8) {
                            msg_say(e, `诶嘿！${e.sender.nickname}早安呀`, 1000);
                        } else if (timenow.getHours() <= 12) {
                            msg_say(e, `www，${e.sender.nickname}睡得好不好啊？是睡了个懒觉吗？`, 1000);
                        } else {
                            msg_say(e, `${e.sender.nickname}早安呀pwq（这个作息有点怪（？）`, 1000);
                        }
                    }],
                    [["午安", "琳酱午安"], () => {
                        if (timenow.getHours() == 12) {
                            msg_say(e, `诶嘿！${e.sender.nickname}午安呀`, 1000);
                        }
                    }],
                ]);
            }
            
            // 50 好感福利
            if (loves[e.sender.user_id].data >= 50) {
                let timenow = new Date();
                // 自动早晚安
                if (loves[e.sender.user_id].greeting == undefined || typeof loves[e.sender.user_id].greeting == 'string'|| timenow - loves[e.sender.user_id].greeting > 3600000 * 3) {
                    if (timenow.getHours() >= 23 || timenow.getHours() <= 2) {
                        loves[e.sender.user_id].greeting = timenow;
                        msg_say(e, `很晚了呢，揉揉${e.sender.nickname}，该睡觉啦w，不要熬夜哦`, 1000);
                    }
                    if (timenow.getHours() >= 6 && timenow.getHours() <= 9) {
                        loves[e.sender.user_id].greeting = timenow;
                        msg_say(e, `${e.sender.nickname}，早安w~ 欢迎来到新的一天！`, 1000);
                    }
                }
            }

            // 100 好感福利
            if (loves[e.sender.user_id].data >= 100) {
                // 贴贴
                if (e.raw_message.indexOf("琳酱") != -1 && e.raw_message.indexOf("贴贴") != -1 ) {
                    msg_say(e, `${e.sender.nickname}贴贴！！`, 500);
                    loves[e.sender.user_id].data += 0.02;
                }
            }

            

            if (e.raw_message == "pwq") {
                msg_say(e, "pwq", 1000);
            }
            else if (e.message[0].file == 'ba0be33ac52963615856444798b9288625592-200-200.gif') {
                const msglist = [
                    [1, ["摸摸……"]],
                    [1, ["摸摸……（超小声"]],
                    [1, () => [generate_pat_seni()]],
                    [1, ["揉揉揉……"]],
                    [1, ["patpat……（超小声"]],
                    [1, ["贴贴……"]],
                    [1, ["sigh，揉揉的说……（超小声"]],
                ];
                say_rand_equal((msg, delay) => msg_say(e, msg, delay), msglist, 1);
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
            else if (e.raw_message.indexOf("琳酱") != -1) {
                if (e.raw_message.indexOf("智障") != -1 || e.raw_message.indexOf("傻") != -1 && e.raw_message.indexOf("不") == -1) {
                    const msglist = [
                        // Lazy evaluate the image loading >_< (Super small voice (Be killed (Run away
                        [0.05, () => [[segment.image("./tmp/emo1.jpg")]]],
                        [0.03, () => [[segment.image("./tmp/emo2.jpg")]]],
                        [0.05, () => [[segment.image("./tmp/emo3.jpg")]]],
                        [0.02, ["az"]],
                        [0.05, ["啊这"]],
                        [0.03, ["不是"]],
                        [0.04, ["啊呜？"]],
                        [0.04, ["呜呜？？"]],
                    ];
                    say_rand_linear((msg, delay) => msg_say(e, msg, delay), msglist);
                } else {
                    const msglist = [
                        // Lazy evaluate the image loading >_< (Super small voice (Be killed (Run away
                        [0.02, () => [[segment.image("./tmp/emo1.jpg")]]],
                        [0.005, () => [[segment.image("./tmp/emo2.jpg")]]],
                        [0.01, () => [[segment.image("./tmp/emo3.jpg")]]],
                        [0.02, () => [[segment.image("./tmp/jumpjump.gif")]]],
                        [0.01, () => [[segment.image("./tmp/diamao.gif")]]],
                        [0.02, ["说得对"]],
                        [0.03, ["确实"]],
                        [0.03, ["是"]],
                        [0.02, ["有道理"]],
                        [0.01, ["嗯"]],
                        [0.01, ["www"]],
                    ];
                    say_rand_linear((msg, delay) => msg_say(e, msg, delay), msglist);
                }
            } else {
                const msglist = [
                    // Lazy evaluate the image loading >_< (Super small voice (Be killed (Run away
                    [0.005, () => [[segment.image("./tmp/emo1.jpg")]]],
                    [0.0025, () => [[segment.image("./tmp/emo2.jpg")]]],
                    [0.0025, () => [[segment.image("./tmp/emo3.jpg")]]],
                    [0.0025, () => [[segment.image("./tmp/jumpjump.gif")]]],
                    [0.0025, () => [[segment.image("./tmp/diamao.gif")]]],
                    [0.005, ["说得对"]],
                    [0.005, ["确实"]],
                    [0.0025, ["是"]],
                    [0.005, ["有道理"]],
                    [0.0025, ["嗯……"]],
                    [0.0025, ["www"]],
                ];
                say_rand_linear((msg, delay) => msg_say(e, msg, delay), msglist);
            }
            
        // !someone_at_me end
        } 
    //user on accesslist end
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

