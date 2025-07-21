const queuedObservers = new Set();

// export function observable(obj) {
//   return new Proxy(obj, {
//     set(target, prop, value) {
//       target[prop] = value;
//       queuedObservers.forEach((observer) => observer());
//       return true;
//     },
//     get(target, prop) {
//       if (prop === "observe") {
//         return (observer) => queuedObservers.add(observer);
//       }
//       return target[prop];
//     },
//   });
// }

export const observe = (fn) => queuedObservers.add(fn);
export const observable = (obj) => new Proxy(obj, { set });

function set(target, key, value, receiver) {
  const result = Reflect.set(target, key, value, receiver);
  queuedObservers.forEach((observer) => observer());
  return result;
}
