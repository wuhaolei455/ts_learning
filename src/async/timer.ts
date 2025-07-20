var i = 1
var timer = setInterval(function() { // 每隔1秒执行一次
  if (i > 1) {
    clearInterval(timer); // 清除定时器, 可以用来做透明度、偏移动画
    return;
  }
  i++;
  console.log(2);
}, 1000)

var timer2 = setTimeout(function() { // 1秒后执行一次
  console.log(1);
}, 1000);

// debounce 防抖函数, 例如希望间隔一段时间用户点击按钮才会触发网络请求
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// throttle 节流函数, 例如希望用户不要频繁点击一个按钮, 触发点击事件
function throttle(func, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime > delay) {
      lastTime = now;
      func.apply(this, args);
    }
  };
}

// setTimeout(0)的执行时机, 在与同步任务全部执行完成后，才会执行
console.log("开始");
setTimeout(function() {
  console.log("setTimeout 0 执行");
}, 0);
console.log("结束");
