import { createClient, segment } from "oicq";
import { init_app } from "./index.js";



init_app((setting_data, process_groupmsg) => {

    const account = setting_data.account;
    const client = createClient(account);

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



    // 戳一戳
    client.on("notice.group.poke", function (e) {
        if (e.target_id === this.uin){
            console.log(e);
            e.group.pokeMember(e.operator_id);
        }
    })

    client.on("message.group", async function(e) {
        try {
            await process_groupmsg(e);
        }
        catch (err) {
            console.error(err);
        }
    })

    return segment;
});
