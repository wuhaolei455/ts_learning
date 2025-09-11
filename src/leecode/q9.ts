type F = (...args: number[]) => void;

// 节流函数
// fn 节流的target
// n 节流时间
// 防止手抖动两次比如，方案是每次重新设置，以最新的一次为触发
function debounce(fn: F, t: number): F {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, t);
  };
}
