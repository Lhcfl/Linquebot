const api_addr = "https://v1.hitokoto.cn/?c="; //网址

export async function get_hitokoto(arg = "") {
    try {
        let res = await fetch(api_addr + arg);
        return (await res.json());
    } catch (error) {
        return ({hitokoto: "网络错误", from: ""});
    }
    
}
