class redbag {
    redbags = [];
    takelist = [];
    taken = {};
    from = "";
    st_date = new Date();
    clear() {
        this.redbags = [];
        this.takelist = [];
        this.taken = {};
        this.from = "";
        this.st_date = new Date()
    }
    /**
     * 
     * @param {String} arg 
     */
    gen_redbag(e, arg, check_func) {
        if (this.redbags.length != 0) {
            return {
                success: false,
                coin: 0,
                word: `包红包失败：还有一个红包`
            }
        }
        this.clear();
        let [coin, num] = arg.split(" ");
        num = Number(num); coin = Number(coin);
        if (check_func(coin)) {
            this.from = e.sender.nickname;
            if (num <= 1) {
                this.redbags.push(coin);
            }
            let listin = [];
            for (let i = 1; i < num; i++) {
                listin.push(Math.random() * coin);    
            }
            listin.sort( (a,b) => a-b )
            this.redbags.push(listin[0]);
            for (let i = 1; i < listin.length - 1; i++) {
                this.redbags.push(listin[i]-listin[i-1]);
            }
            this.redbags.push(coin - listin.pop())
            return {
                success: true,
                coin: coin,
                word: `${this.from}已经成功包了一个好感度为${coin}，数量${num}的红包！`
            }
        } else {
            return {
                success: false,
                coin: 0,
                word: `包红包失败：好感额错误`
            }
        }
        
    }
    take_redbag(e) {
        if (this.redbags.length == 0) {
            return {
                coin: 0,
                msg: []
            }
        }
        if (this.taken[e.sender.user_id] != undefined) {
            return {
                coin: 0,
                msg: [["你已经领过一次啦！", 500]]
            }
        }
        let tmp = this.redbags[this.redbags.length - 1];
        if (this.redbags.length > 1) {
            this.redbags.pop();
            this.taken[e.sender.user_id] = true
            this.takelist.push({
                name: e.sender.nickname,
                coin: tmp
            })
            return {
                coin: tmp,
                msg: [[`${e.sender.nickname}打开了${this.from}的红包并获得${tmp}点好感`, 500]]
            }
        } else {
            this.takelist.sort( (a,b) => b.coin - a.coin)
            return {
                coin: tmp,
                msg: [
                    [`${e.sender.nickname}打开了${this.from}的红包并获得${tmp}点好感`, 500],
                    [`${this.from}的红包已被领完，${this.takelist[0].name}是运气王`, 1500]
                ]
            }
            
        }
    }

}
export { redbag };