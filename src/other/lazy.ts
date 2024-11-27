// 懒加载, 延迟初始化
export function lazy<T>(initializer: () => T): () => T {
  let initialized = false;
  let value: T;

  return () => {
    if (!initialized) {
      value = initializer();
      initialized = true;
    }
    return value;
  };
}

const lazyValue = lazy(() => {
  console.log('initializing');
  return { 'NetworkApi': 22 };
});

console.log(lazyValue);
console.log(lazyValue());
console.log(lazyValue());