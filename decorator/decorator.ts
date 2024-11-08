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
  console.log('Network Exception: ', error);
}

