export function rand_unsure () {
    const unsure = [
        "大概……也许……可能？",
        "我想想……",
        "可能吧（",
        "其实我也不知道（逃",
        "啥，我刚刚说了什么吗？（无辜脸",
        "应该……不是……吧（"
    ]
    return unsure[Math.floor(Math.random() * unsure.length)];
}
