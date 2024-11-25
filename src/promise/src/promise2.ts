setTimeout(() => { console.log(1) }) // 宏任务
let p = new Promise((resolve, reject) => {
    resolve(2) // 微任务
    console.log(3)
    
}).then(() => {
    console.log(4)
})
console.log(5)

let a = undefined
if (a) {
    console.log(6)
}