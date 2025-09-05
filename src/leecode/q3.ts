function createCounter(n: number): () => number {
  let count = n;
  return function () {
    const old = count;
    count++;
    return old;
  };
}

// 它允许函数访问并操作其外部作用域中的变量
