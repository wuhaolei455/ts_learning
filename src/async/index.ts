function async(arg, callback) {
  console.log("参数为 " + arg + " , 1秒后返回结果");
  setTimeout(function () {
    callback(arg * 2);
  }, 1000);
}

// callback hell, 1s, 2s, 3s, 4s, 5s分别做一件事
function callbackHell() {
  async("1s", function (result1) {
    console.log("1s over, result: ", result1);
    async("2s", function (result2) {
      console.log("2s over, result: ", result2);
      async("3s", function (result3) {
        console.log("3s over, result: ", result3);
        async("4s", function (result4) {
          console.log("4s over, result: ", result4);
          async("5s", function (result5) {
            console.log("5s over, result: ", result5);
          });
        });
      });
    });
  });
}

// 通过递归优化, 实现串行执行
function single() {
  var items = [1, 2, 3, 4, 5, 6];
  var results = [];

  function final(value) {
    console.log("完成: ", value);
  }

  function series(item) {
    if (item) {
      async(item, function (result) {
        results.push(result);
        return series(items.shift());
      });
    } else {
      return final(results[results.length - 1]);
    }
  }

  series(items.shift());
}

// 并行执行
function parallel() {
  var items = [1, 2, 3, 4, 5, 6];
  var results = [];

  function async(arg, callback) {
    console.log("参数为 " + arg + " , 1秒后返回结果");
    setTimeout(function () {
      callback(arg * 2);
    }, 1000);
  }

  function final(value) {
    console.log("完成: ", value);
  }

  items.forEach(function (item) {
    async(item, function (result) {
      results.push(result);
      if (results.length === items.length) {
        final(results[results.length - 1]);
      }
    });
  });
}

// 并行两个, 然后串行
function parallelAndSeries() {
  var items = [1, 2, 3, 4, 5, 6];
  var results = [];
  var running = 0;
  var limit = 2;

  function async(arg, callback) {
    console.log("参数为 " + arg + " , 1秒后返回结果");
    setTimeout(function () {
      callback(arg * 2);
    }, 1000);
  }

  function final(value) {
    console.log("完成: ", value);
  }

  function launcher() {
    while (running < limit && items.length > 0) {
      var item = items.shift();
      async(item, function (result) {
        results.push(result);
        running--;
        if (items.length > 0) {
          launcher();
        } else if (running === 0) {
          final(results);
        }
      });
      running++;
    }
  }

  launcher();
}

// JavaScript 原生支持 Promise 对象, 有pending、fulfilled、rejected三种来管理任务的状态
function testPromise() {
  const step1 = () => async("1s", () => {
    console.log("1s over");
  });
  const step2 = () => async("2s", () => {
    console.log("2s over");
  });
  const step3 = () => async("3s", () => {
    console.log("3s over");
  });
  const step4 = () => async("4s", () => {
    console.log("4s over");
  });
  const step5 = () => async("5s", () => {
    console.log("5s over");
  });
  new Promise(step1).then(step2).then(step3).then(step4).then(step5);
}


// Promise支持链式调用, 通过then方法来处理异步任务的结果
// 通过then方法可以将多个异步任务串联起来, 形成一个任务链, 当前一个任务完成(resolve)后, 会自动执行下一个任务
// 值得注意的是, console.log只显示step3的返回值，
// 而console.error可以显示p1、step1、step2、step3之中任意一个发生的错误。这就是说，Promise 对象的报错具有传递性。
function testPromise2() {
  const step1 = () => new Promise((resolve) => async("1s", (result) => {
    console.log("1s over", result);
    resolve('1s结束咯');
  }));
  const step2 = () => new Promise((resolve) => async("2s", (result) => {
    console.log("2s over", result);
    resolve('2s结束咯');
  }));
  const step3 = () => new Promise((resolve) => async("3s", (result) => {
    console.log("3s over", result);
    resolve('3s结束咯');
  }));
  const step4 = () => new Promise((resolve) => async("4s", (result) => {
    console.log("4s over", result);
    resolve('4s结束咯');
  }));
  const step5 = () => new Promise((resolve) => async("5s", (result) => {
    console.log("5s over", result);
    resolve('5s结束咯');
  }));

  step1().then(step2).then(step3).then(step4).then(step5).then(console.log, console.error);
}

function testPromise3() {
  const step1 = () => new Promise((resolve) => async("1s", (result) => {
    console.log("1s over", result);
    resolve('1s结束咯');
  }));
  const step2 = (prevResult) => new Promise((resolve) => async("2s", (result) => {
    console.log("2s over", result, '上一个结果是', prevResult);
    resolve('2s结束咯');
  }));
  const step3 = (prevResult) => new Promise((resolve) => async("3s", (result) => {
    console.log("3s over", result, '上一个结果是', prevResult);
    resolve('3s结束咯');
  }));
  const step4 = (prevResult) => new Promise((resolve) => async("4s", (result) => {
    console.log("4s over", result, '上一个结果是', prevResult);
    resolve('4s结束咯');
  }));
  const step5 = (prevResult) => new Promise((resolve) => async("5s", (result) => {
    console.log("5s over", result, '上一个结果是', prevResult);
    resolve('5s结束咯');
  }));

  step1()
    .then(step2)
    .then(step3)
    .then(step4)
    .then(step5)
    .then(finalResult => console.log('所有步骤完成，最后一个结果是:', finalResult))
    .catch(error => console.error('发生错误:', error));
}

// setTimeout(0)的执行时机, 跳过本轮事件循环
// Promise的机制, 微任务, 在本轮事件循环的末尾执行, 也是nextTick的实现原理
console.log("1");
new Promise((resolve) => {
  resolve(2);
}).then(console.log);
setTimeout(() => {
  console.log(3);
}, 0);




// callbackHell();
// single();
// parallel();
// parallelAndSeries();
// testPromise();
// testPromise2();
// testPromise3();

