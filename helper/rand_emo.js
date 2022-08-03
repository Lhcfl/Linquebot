export function rand_emo () {
    const emos = [
        "开心",
        "钦佩",
        "崇拜",
        "欣赏",
        "厌倦",
        "冷静",
        "困惑",
        "着迷",
        "嫉妒",
        "兴奋",
        "快乐",
        "怀旧",
        "浪漫",
        "悲伤",
        "满意",
        "同情",
        "满足",
        "想起了什么",
        "不知道在说什么",
        "叹气",
        "骄傲",
        "错误"
    ]
    return emos[Math.floor(Math.random() * emos.length)];
}
