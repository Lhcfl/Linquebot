export function random_seed(seed) {
    if (typeof seed == 'number') {
        return Math.abs(Math.sin(seed * 1145141 % 19260817));
    } else if (typeof seed == 'string') {
        return Math.abs(Math.sin(hash_string(seed) * 1145141 % 19260817));
    }
}


export function hash_string(str) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}