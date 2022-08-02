/**
 * Build the sentence from the words.
 */
class SentenceBuilder {
    /** @type {string} the sentence content */
    ctnt = "";
    /** @type {"none" | "zh" | "en"} the status of the sentence, not implemented currently */
    state = "none";

    /**
     * @returns {number} The length of the sentence
     */
    get length() {
        return this.ctnt.length;
    }

    /**
     * Push a word into the sentence
     *
     * @param {string} word The word to be pushed into the sentence
     *
     * @returns {void}
     */
    pushWord(word) {
        this.ctnt += word;
        if (word.match(/\w$/))
            this.ctnt += " ";
    }

    /**
     * Generate the sentence.
     *
     * @returns {string} The generated sentence
     */
    build() {
        return this.ctnt;
    }
}

/**
 * A node in the markov chain.
 */
class Node {
    /** @type {string[]} Possible next word or phase */
    next = [];
    /** @type {number[]} The count of occurance of the words in next */
    occur = [];
    /** @type {number} The total occurance count of all words */
    totoccur = 0;

    /**
     * Construct a node from existing node data.
     *
     * @param {{ next: string[], occur: number[], totoccur: number }=} o The node data
     */
    constructor(o) {
        if (!o)
            return;
        this.next = o.next;
        this.occur = o.occur;
        this.totoccur = o.totoccur;
    }

    /**
     * Update the possibility of the node with the occurance of the word.
     *
     * @param {string} word the incoming word
     * @param {number} weight the weight of the incoming word
     *
     * @returns {void}
     */
    update(word, weight = 1) {
        let id = this.next.indexOf(word);
        if (id == -1) {
            this.next.push(word);
            this.occur.push(weight);
        }
        else {
            this.occur[id] += weight;
        }
        this.totoccur += weight;
    }

    /**
     * Generate the next word according to the possibility.
     *
     * @returns {[string, number]} The next word and its possibility
     */
    generate() {
        let pos = Math.random() * this.totoccur;
        let sum = 0;
        for (let i = 0; i < this.next.length; ++i) {
            sum += this.occur[i];
            if (pos <= sum)
                return [this.next[i], this.occur[i] / this.totoccur];
        }
        let i = this.next.length - 1;
        return [this.next[i], this.occur[i] / this.totoccur];
    }

}

/**
 * The markov-chain text generator.
 */
class Markov {
    /** @type {Map<string, Node>} The state machine. */
    sm;
    /** @type {number} The maximum length of the chain. */
    static MaxLen = 3;
    /** @type {number[]} The weight of chains of a certain length. */
    static Weights = [3, 5, 1];

    /**
     * @param {Map<string, Node>} stateMachine
     */
    constructor(stateMachine) {
        if (!stateMachine)
            stateMachine = new Map();
        this.sm = stateMachine;
    }

    /**
     * Split words in a sentence.
     *
     * @param {string} sentence The sentence to be split
     *
     * @returns {string[]} The words split
     */
    static splitWords(sentence) {
        const regex = /\p{sc=Han}|[a-zA-Z-]+|[0-9]+|[,.:;"'/?<>()（）!~，。！；？：、]|……/gu;
        let res = [...sentence.matchAll(regex)].map(v => v[0]);
        res.push("");
        return res;
    }

    /**
     * Feed a sentence into the chain and update the chain.
     *
     * @param {string} sentence The origin sentence
     * @param {number} weight The weight of the sentence
     *
     * @returns {void}
     */
    feedSentence(sentence, weight = 1) {
        const update = (pre, word) => {
            if (!this.sm.has(pre)) {
                this.sm.set(pre, new Node());
            }
            this.sm.get(pre).update(word, weight);
        };
        let words = Markov.splitWords(sentence);
        if (words.length == 1)  // Only terminator...
            return;
        update("", words[0]);  // Add the initial char
        let pre = [words[0]];
        for (let i = 1; i < words.length; ++i) {
            // Add word into nodes
            for (let j = 1; j <= pre.length && j <= Markov.MaxLen; ++j) {
                update(pre.slice(pre.length - j, pre.length).join(" "), words[i]);
            }
            // Update pre
            pre.push(words[i]);
            if (pre.length > Markov.MaxLen) {
                pre.splice(0, 1);
            }
        }
    }

    /**
     * Create a sentence from a given prefix.
     *
     * @param {string} prefix The prefix sentence
     * @param {number} lenlim The length limit of the generated sentence
     *
     * @returns {string} The generated sentence
     */
    genSentence(prefix, lenlim = Number.MAX_SAFE_INTEGER) {
        let res = new SentenceBuilder();
        // Find the initial state
        let pre = Markov.splitWords(prefix);
        pre = pre.slice(pre.length - 1 - Math.min(Markov.MaxLen, pre.length - 1), pre.length - 1);
        if (pre.length == 0)
            pre = [""];
        // Generate the sentence
        let cur = "";
        do {
            // Get the candidates
            /** @type {[string, number][]} */
            let candidate = [];
            for (let i = 1; i <= pre.length && i <= Markov.MaxLen; ++i) {
                let sub = pre.slice(pre.length - i, pre.length).join(" ");
                let next = this.sm.has(sub) ? this.sm.get(sub).generate() : [this.sm.get("").generate()[0], 0];
                candidate.push(next);
            }
            // Select one from it
            let totp = candidate.map(v => v[1]).reduce((a, b, i) => a * Markov.Weights[i] + b, 0);
            if (candidate.length == 0) {
                cur = "";
            }
            else if (totp == 0) {
                cur = candidate[Math.floor(Math.random() * candidate.length)][0];
            }
            else {
                candidate.forEach((v, i) => v[1] = v[1] * Markov.Weights[i] / totp);
                let p = Math.random();
                cur = "";
                for (let i = 0, sum = 0; i < candidate.length; ++i) {
                    sum += candidate[i][1];
                    if (p < sum) {
                        cur = candidate[i][0];
                        break;
                    }
                }
                if (cur == "")
                    cur = candidate[candidate.length - 1][0];
            }
            // Push it to the result and update previous words list
            res.pushWord(cur);
            pre.push(cur);
            if (pre.length > Markov.MaxLen) {
                pre.splice(0, 1);
            }
        } while (res.length < lenlim && cur.length > 0);
        return res.build();
    }

    /**
     * Convert self to string.
     *
     * @returns {string} converted string
     */
    toString() {
        let pairs = [...this.sm.entries()];
        return JSON.stringify(pairs);
    }

    /**
     * Construct self from a string.
     *
     * @param {string} src The source string
     *
     * @returns {Markov}
     */
    static fromString(src) {
        let pairs = JSON.parse(src);
        let res = new Map();
        for (let cur of pairs) {
            res.set(cur[0], new Node(cur[1]));
        }
        return new Markov(res);
    }
}

export { Markov };

