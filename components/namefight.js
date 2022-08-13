// 人物总共7个属性：HP，AT，DF，AC（体力），MG（魔力），MS（闪避），SK（技能）
// 值都需要小于200
function get_random(left, right) {
    return Math.round (left + Math.random() * (right - left));
}
const player_job = [
    () => { return {
        // 刺客
        HP: get_random(50, 80),
        AT: get_random(150, 200),
        DF: get_random(20, 50),
        AC: get_random(150, 200),
        MG: get_random(50, 80),
        MS: get_random(80, 150),
        SK: [{
            name: "瞬"
        }]
    }},
    () => { return {
        // 坦克
        HP: get_random(150, 200),
        AT: get_random(150, 200),
        DF: get_random(150, 200),
        AC: get_random(0, 30),
        MG: get_random(10, 30),
        MS: get_random(0, 10),
        SK: [{
            name: "轰击"
        }]
    }},
    () => { return {
        // 战士
        HP: get_random(80, 120),
        AT: get_random(80, 120),
        DF: get_random(80, 120),
        AC: get_random(80, 120),
        MG: get_random(80, 120),
        MS: get_random(80, 120),
        SK: [{
            name: "狂暴"
        }]
    }},
    () => { return {
        // 法师
        HP: get_random(30, 50),
        AT: get_random(30, 50),
        DF: get_random(20, 50),
        AC: get_random(180, 200),
        MG: get_random(180, 200),
        MS: get_random(30, 50),
        SK: [{
            name: "咒"
        }]
    }},
    () => { return {
        // 土 豆 墙
        HP: get_random(200, 200),
        AT: get_random(20, 30),
        DF: get_random(200, 200),
        AC: get_random(20, 50),
        MG: get_random(200, 200),
        MS: get_random(0, 0),
        SK: [
            {
                name: "保护"
            },
            {
                name: "回血"
            },
        ]
    }},
    
    
]
function get_job() {
    return player_job[Math.floor(Math.random() * player_job.length)]();
}

class namefight {
    players = {};
    join_date = new Date();
    gaming = false;
    clear() {
        this.players = {};
        this.join_date = new Date();
        this.play_date = new Date();
    }
    /**
     * 
     * @returns msglist item
     */
    join_player(e) {
        if (this.players[e.nickname] == undefined) {
            this.players[e.nickname] = {};
            return [`${e.nickname}成功加入游戏`, 400];
        } else {
            return [`${e.nickname}已经加入过游戏`, 400];
        }
    }
    /**
     * 
     * @param {Number} left 
     * @param {Number} right 
     */
    distribute() {
        let id = 1;
        for (const name in this.players) {
            this.players[name] = get_job();
            this.players[name].id = id++;
        }
    }
    start_game(e) {
        if (this.gaming == true) {
            return [[`现在正在游戏哦`, 500]]
        } else if (this.gaming == false) {
            this.clear();
            this.gaming = "preparing";
            this.join(e);
            return [[`已开始游戏。你有5min的时间召集游戏参加者（人数>=2）`, 500], this.join_player(e)];
        } else {
            this.join(e);
            if (new Date() - this.join_date > 300000) { 
                this.gaming = true;
                this.distribute();
                
            }
            
            return 
        }

        
    }
}

export { namefight };