const api_addr = "https://v1.hitokoto.cn/"; //网址

export async function get_hitokoto() {
    let res = await fetch(api_addr);
    return (await res.json())
}
