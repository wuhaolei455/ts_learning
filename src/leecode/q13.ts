interface Array<T> {
  groupBy(fn: (item: T) => string): Record<string, T[]>;
}

Array.prototype.groupBy = function (fn) {
  let obj = {};
  for (let item of this) {
    let key = "" + fn(item);
    if (!obj.hasOwnProperty(key)) {
      obj[key] = [];
    }
    obj[key].push(item);
  }
  return obj;
};

const list = [{ id: "1" }, { id: "1" }, { id: "2" }];
const listGroupByRes = list.groupBy((item) => {
  return item.id;
});

console.log(listGroupByRes);
