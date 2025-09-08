export function freeze(obj) {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "object" && obj[key] !== null) {
      freeze(obj[key]);
    }
  }
  return obj;
}
