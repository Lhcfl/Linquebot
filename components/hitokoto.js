const api_addr = "https://v1.hitokoto.cn/?c="; //网址

export async function get_hitokoto(arg = "") {
    let res = await fetch(api_addr + arg);
    return (await res.json())
}
