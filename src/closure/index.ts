// 闭包是指有权访问另一个函数作用域中(非本函数作用域)的变量的函数。
// 每个闭包都会在堆上分配内容, 即内存中保持对作用域外变量的引用
// 闭包会导致额外的内存创建开销、潜在的内存泄漏风险

export function testClosure() {
  // demo1 largeArray并不会被回收
  function outer() {
    let largeArray = new Array(1000000).fill(0);
    return function inner() {
      return largeArray[0];
    };
  }

  let closure = outer();
  // over

  // demo2 性能敏感场景下，使用函数传参代替闭包
  let arr = [0, 1, 2];

  function foo(): number {
    return arr[0] + arr[1];
  }
  foo();

  function foo2(array: number[]): number {
    return array[0] + array[1];
  }
  foo2(arr);
  // over

  // demo3 潜在的内存泄漏
  // 如果这个DOM元素被移除，但闭包依然引用它，会导致内存泄漏，无法正确释放内存。
  function attachEventListener(element) {
    element.addEventListener('click', function onClick() {
      console.log(element.id);
    });
  }

  // attachEventListener(document.getElementById('myButton'))
  // over
}
