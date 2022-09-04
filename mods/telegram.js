// Telegram模式
import oicq from "oicq";

export let segment = oicq.segment;
export let testing = false;

import events from "events";



import TelegramBot from 'node-telegram-bot-api';
import proxy from 'proxy-agent';





let bot;





setTimeout(() => {
    console.log(
        `--------------------
Welcome to Linquebot Telegram mode
--------------------`
    )
}, 500);

let account;
export let createClient = (token, config) => {
    account = new events.EventEmitter();
    account.login = function(proxy, proxy_address) {
        if (proxy == true && proxy_address != undefined) {
            bot = new TelegramBot(token, {
                polling: true,
                request: {
                    agent: proxy(proxy_address)
                }
            });
        } else {
            bot = new TelegramBot(token, {
                polling: true
            });
        }
        
        bot.on('message', (msg) => {
            if (msg.from.is_bot == true) return;
            // translate
            let e = {
                sender: {
                    user_id: msg.from.username,
                    nickname: msg.from.first_name,
                    role: "admin"
                },
                raw_message: msg.text,
                message: [
                    {
                        text: msg.text,
                        type: "text"
                    }
                ],
                group_id: msg.chat.id,
                group: {
                    sendMsg: async (words) => {
                        let msg_to_send = "";
                        if (typeof words == 'object') {
                            for (const txt of words) {
                                if (typeof txt == 'string') {
                                    msg_to_send += txt;
                                } else if (txt.type == 'at') {
                                    if (txt.qq != 0) msg_to_send += `@${txt.qq}`;
                                    else msg_to_send += `@${txt.id}`
                                } else if (txt.type == "text") {
                                    msg_to_send += txt.text;
                                } else if (txt.type == "image") {
                                    bot.sendPhoto(msg.chat.id, txt.file);
                                }
                            }
                        } else {
                            msg_to_send = words
                        }
                        if (msg_to_send != "") bot.sendMessage(msg.chat.id, msg_to_send);
                        return {
                            seq: "seq"+Math.random(),
                            rand: Math.random()
                        }
                    },
                    recallMsg: async () => {
                        bot.sendMessage(msg.chat.id, `抱歉：tg环境暂不支持撤回内容`);
                    }
                },
            }
            if (e.raw_message == undefined) {
                e.message[0].text = e.raw_message = "[不支持的消息]";
            }
            if (msg.entities != undefined) {
                e.message = [];
                for (let i in msg.entities) {
                    if (msg.entities[i].type == 'mention') {
                        if (i!=0 && msg.entities[i-1].type == 'mention' && e.raw_message.slice(msg.entities[i-1].offset+msg.entities[i-1].length, msg.entities[i].offset) != '') { 
                            e.message.push({
                                type: 'text',
                                text: e.raw_message.slice(msg.entities[i-1].offset+msg.entities[i-1].length, msg.entities[i].offset)
                            });
                        }
                        if (i==0 && e.raw_message.slice(0, msg.entities[i].offset) != '') { 
                            e.message.push({
                                type: 'text',
                                text: e.raw_message.slice(0, msg.entities[i].offset)
                            });
                        }
                        e.message.push({
                            type: 'at',
                            qq: e.raw_message.slice(msg.entities[i].offset+1, msg.entities[i].offset + msg.entities[i].length)
                        })
                    }
                }
                if (msg.entities[msg.entities.length-1].type == 'mention') {
                    let tmp_text =  e.raw_message.slice(msg.entities[msg.entities.length-1].offset+msg.entities[msg.entities.length-1].length+1, e.raw_message.length);
                    if (tmp_text != '') e.message.push({
                        type: 'text',
                        text: tmp_text
                    })
                }
                if (e.message.length == 0) {
                    e.message = [
                        {
                            text: msg.text,
                            type: "text"
                        }
                    ]
                }
            }
            console.log(msg); console.log("Translated:"); console.log(e); console.log("----------------");
            account.emit("message.group", e);
            
        });
        console.log("已登录tg环境");
    }
    console.log(`Your Account:${token}, config:${config}`);
    return account;
};