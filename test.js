import oicq from "oicq";
import events from "events";
// import rdl from "readline";

console.log(
    `--------------------
Welcome to Linquebot Test Context
--------------------`
)
export let segment = oicq.segment;

export let createClient = (uin, config) => {
    let account = new events.EventEmitter();
    console.log(`Your Account:${uin}, config:${config}`);
    return account;
};

// const readline = rdl.createInterface({
//     input: process.stdin,
//     output: process.stdout
// })


// while () {
//     readline.question(`input:`, input => {
//         console.log(`You inputed ${input}!`)
        
//         readline.close()
//     })    
// }