export function NameLogger(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`method name: ${propertyKey}`);
    return originalMethod.apply(this, args);
  };

  return descriptor;
}

export function onNetworkException(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    return new Promise((resolve, reject) => {
      originalMethod.apply(this, args).then((res) => {
        resolve(res);
      }).catch((error) => {
        handleNetworkException(error);
        reject(error)
      })
    });
  };

  return descriptor;
}

function handleNetworkException(error: any) {
  console.log('捕获Network Exception: ', error.message);
}

export function classLogger(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    console.log(`${propertyKey} started------------------------`);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} finished------------------------`);
    return result;
  };
}

export function methodLogger<T extends Function>(fn: T): T {
  return function (this: any, ...args: any[]) {
    const methodName = fn.name;
    console.log(`${methodName} started------------------------`);
    const result = fn.apply(this, args);
    console.log(`${methodName} finished-------------------------`);
    return result;
  } as any;
}


