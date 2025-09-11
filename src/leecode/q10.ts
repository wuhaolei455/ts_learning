// t时间内执行过一次，不再执行
function throttle(fn: F, t: number): F {
  let start = 0;
  return function (...args) {
    const now = Date.now();
    if (now - start > t) {
      start = now;
      fn(...args);
    }
  };
}

//delay后执行，且只执行一次
function throttle2(fn, delay) {
  let canRun = true;
  return function () {
    if (!canRun) return;
    canRun = false;
    setTimeout(() => {
      fn();
      canRun = true;
    }, delay);
  };
}
