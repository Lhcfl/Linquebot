import fs from "fs";
let cy = JSON.parse(fs.readFileSync('./components/lib/Chenyu-cy.json'));
let cylist = JSON.parse(fs.readFileSync('./components/lib/Chenyu-cylist.json'));
let py = JSON.parse(fs.readFileSync('./components/lib/Chenyu-py.json'));

class jielong {
    counted = {};
    champ_list = {};
    time = new Date()
    st = "";
    gaming = false;
    clear() {
        this.counted = [];
        this.champ_list = {};
        this.gaming = false;
        this.st = "";
        this.time = new Date();
    }
    join(e) {
        if (this.champ_list[e.sender.user_id] == undefined) {
            this.champ_list[e.sender.user_id] = {
                score: 0,
                name: e.sender.nickname
            }
        }
    }
    start_game(input = "") {
        if (this.gaming == true) {
            return {
                open: false,
                word: `现在正在游戏哦，接龙开头词是：${this.st}`
            }
        } else {
            if (input == "") { return this.start_game(this.random_chenyu()); }
            this.clear();
            if (cy[input] == undefined) {
                return {
                    open: false,
                    word: "开始游戏失败：错误的成语"
                }
            } else {
                this.st = cy[input].ed;
                this.gaming = true;
                return {
                    open: true,
                    word: `开始游戏成功：接龙开头词是：${this.st}`
                }
            }
        }
    }
    random_chenyu(start = "") {
        if (start == "" || cylist[start] == undefined) {
            return this.random_chenyu(py[Math.floor(Math.random() * py.length)]);
        } else {
            let find = cylist[start][Math.floor(Math.random() * cylist[start].length)];
            this.counted[find] = true;
            return find;
        }
    }
    gameover() {
        this.gaming = false;
        this.st = "";
        function numToChinese(n) {
            if (n <= 10) {
                return "零一二三四五六七八九十"[n];
            } else {
                return n;
            }
        }
        let list = []
        let res = "";
        for (let i in this.champ_list) {
            list.push(this.champ_list[i]);
        }
        list.sort((a, b) => b.score - a.score);
        for (let i = 0; i < list.length; i++) {
            res += `\n第${numToChinese(i + 1)}名：${list[i].name}，${list[i].score}分`;
        }
        this.clear();
        return [["成语接龙结束啦！琳酱来宣布结果：" + res, 4000, 0]];
    }
    check_chenyu(e, chenyu) {
        if ((new Date) - this.time > 600000) {
            return this.gameover();
        }
        if (this.counted[chenyu] == true) { return [["这个是接过的成语哦！", 500, 0]]; }
        else if (cy[chenyu] != undefined && cy[chenyu].st == this.st) {
            this.join(e);
            this.champ_list[e.sender.user_id].score += 1;
            this.st = cy[chenyu].ed;
            this.counted[chenyu] = true;
            return [[`接对啦，${e.sender.nickname}分数+1。`, 500], [`下一个开头：${this.st}`, 1000]];
        } else {
            return [];
        }
    }

}
export { jielong };