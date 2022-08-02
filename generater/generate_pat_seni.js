export function generate_pat_seni() {
    function rand_bao() {
        let ans = "抱抱";
        while (Math.random() < 0.4) {
            ans+="抱";
        }
        return ans;
    }
    function rand_rou() {
        let ans = "揉揉";
        while (Math.random() < 0.6) {
            ans+="揉";
        }
        return ans;
    }
    function rand_sigh() {
        let ans = ["x_x ", "sigh... "];
        return ans[Math.floor(Math.random() * ans.length)];
    }
    function rand_kuohao() {
        let ans = "";
        while (Math.random() < 0.5) {
            ans+="(";
        }
        return ans;
    }
    if (Math.random() < 0.5) {
        return rand_bao() + rand_rou() + "的说 " + rand_sigh() + "(超小声" + rand_kuohao();
    } else {
        return rand_rou() + rand_bao() + "的说 " + rand_sigh() + "(超小声" + rand_kuohao();
    }

}
