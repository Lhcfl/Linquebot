export async function baike (term) {
    let resp = await fetch("https://baike.baidu.com/item/" + term);
    if (!resp.ok)
        return { success: false, text: "response:" + resp.status };
    let body = await resp.text();
    let desc = body.match(/<meta name="description" content="(.*)">\n/);
    if (desc)
        return { success: true, text: desc[1] };
    else
        return { success: false, text: "not found" };
}
