const helper = [];

helper[""] =`OoO这里是linca喂养的人工智障琳
对任意用户：
.bot status输出bot状态（显然bot未开机则不会输出）
.status输出您的状态
对于未封禁用户：
以.开头的任何句子会被bot语料收集忽略
.help输出此条帮助信息
.help user输出您可以执行的操作
.help admin输出管理员操作
.help hitokoto查看「一言」的帮助`

helper["admin"] = `OoO这里是linca喂养的人工智障琳
管理员操作
.bot clear清除bot历史
.bot cc 撤回bot的上一句话
.ban @某人 禁止其对bot使用权
.deban @某人 恢复其对bot使用权
.auth @某人 授予其对bot管理权
.authoff @某人 撤销其对bot管理权
.bot on 开启bot
.learn on 开启语料收集`

helper["user"] = `OoO这里是linca喂养的人工智障琳
未封禁用户操作：
.help输出此条帮助信息
.bot off 关闭bot
.hitokoto 调用一言
.rand [事件] 掷骰子
.randnoid不用加你的id，但是必须带参数
可以通过“揉揉bot”让我回揉你
投喂[食物] 进行投喂
可以帮你们复读
甚至可以帮你们当面点大师
------
测试性功能：
.learn off 关闭语料收集
.search [关键词] 查百度百科
.reply [句首] ai生成一句话
琳酱说说话 也是ai生成一句话
使用测试功能请谨慎，可能对他人有影响。`

helper["hitokoto"] = `OoO这里是linca喂养的人工智障琳
一言网（hitokoto.cn）创立于 2016 年，隶属于萌创团队，目前网站主要提供一句话服务。
.hitokoto [参数]
参数列表：
不加参数：随机
a：动画\tb：漫画\tc：游戏
d：文学\te：原创\tf：来自网络
g：其他\th：影视\ti：诗词
j：网易云\tk：哲学\tl：抖机灵
访问一言的网站 https://hitokoto.cn/`

const helper_fallback = `QxQ 找不到这部分帮助呢
.help输出帮助总览
.help user输出您可以执行的操作
.help admin输出管理员操作
.help hitokoto查看「一言」的帮助`;

/**
 * Generate the help message
 *
 * @param {"" | "admin" | "user" | "hitokoto"} part - Which part of help message should be generated
 */
export function generate_help(part) {
    if (helper[part] == undefined) {
        return helper_fallback;
    } else {
        return helper[part];
    }
}

