import fs from "fs";
let cis = JSON.parse(fs.readFileSync('./components/lib/Chenyu-cis.json'));
let inv = JSON.parse(fs.readFileSync('./components/lib/Chenyu-inv.json'));
let cy = JSON.parse(fs.readFileSync('./components/lib/Chenyu-cy.json'));
let cylist = JSON.parse(fs.readFileSync('./components/lib/Chenyu-cylist.json'));
let py = JSON.parse(fs.readFileSync('./components/lib/Chenyu-py.json'));

class jielong {
    counted = {};
    st = "";
    ing = false;
    clear() {
        this.counted = [];
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
    check_chenyu(chenyu) {
        if (this.counted[chenyu] == true) { return [["这个是接过的成语哦！", 500, 0]]; }
        else if (cy[chenyu] != undefined) {
            return [["接对啦，分数+1", 500, 1]];
        } else {
            return [];
        }
    }

}
export { jielong };