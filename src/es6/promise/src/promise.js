/**
 * 1. Promise初始化时需要传入一个函数，函数有两个参数resolve和reject
 * 2. Promise包括pending、fulfilled、rejected三种状态，初始是pending状态，reject、throw是rejected状态，resolve是fulfilled状态
 * resolve为fulfilled状态
 * 3. Promise为rejected状态时会执行catch方法，fulfilled状态时会执行then方法，pending状态时不会执行then方法
 * 4. Promise的状态一旦改变就不会再变
 */
export function testPromiseState() {
  let p1 = new Promise((resolve, reject) => {
    resolve("成功");
    reject("失败");
  });
  console.log("p1: ", p1);

  let p2 = new Promise((resolve, reject) => {
    reject("失败");
    resolve("成功");
  }).catch((err) => {
    console.log("p2: ", err);
  });
  console.log("p2: ", p2);

  let p3 = new Promise((resolve, reject) => {
    throw "报错";
  }).catch((err) => {
    console.log("p3: ", err);
  });
  console.log("p3: ", p3);

  let p4 = new Promise((resolve, reject) => {}).then(() => {
    console.log("then");
  });
  console.log("p4: ", p4);
}
