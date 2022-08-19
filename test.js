import oicq from "oicq";
import events from "events";

setTimeout(() => {
    console.log(
        `--------------------
Welcome to Linquebot Test Context
--------------------
Type your first message: `
    )
}, 200);

export let segment = oicq.segment;
export let testing = false;
let account;
export let createClient = (uin, config) => {
    account = new events.EventEmitter();
    account.login = function() {
        console.log("已登录测试环境");
    }
    console.log(`Your Account:${uin}, config:${config}`);
    return account;
};

// const readline = rdl.createInterface({
//     input: process.stdin,
//     output: process.stdout
// })

// let msg = "";



process.stdin.on('readable', () => {
    let chunk;
    // Use a loop to make sure we read all available data. 
    while ((chunk = process.stdin.read()) !== null) {
        chunk = String(chunk).slice(0, String(chunk).length - 2);
        
        if (chunk == ".poke") {
            let e = {
                operator_id: "锦心",
                group: {
                    pokeMember: (member) => {
                        console.log(`琳酱戳了戳${member}的脑袋`);
                    }
                }
            }
            console.log(e);
            account.emit("notice.group.poke", e);
            
        } else {
            let e = {
                sender: {
                    user_id: "Lhcfl",
                    nickname: "锦心",
                    role: "owner"
                },
                raw_message: chunk,
                message: [
                    {
                        text: chunk,
                        type: "text"
                    }
                ],
                group_id: "test-group",
                group: {
                    sendMsg: async (words) => {
                        console.log(`-------------`);
                        console.log(`琳酱：`);
                        console.log(words);
                        console.log(`-------------`);
                        
                        return {
                            seq: "seq"+Math.random(),
                            rand: Math.random()
                        }
                    },
                    recallMsg: async (seq, rand) => {
                        console.log(`抱歉：测试环境不能撤回seq=${seq}, rand=${rand}的内容`)
                    }
                },
            }
            console.log(e);
            account.emit("message.group", e);
        }
        
        
        
    }
});