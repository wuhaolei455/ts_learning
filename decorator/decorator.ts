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
