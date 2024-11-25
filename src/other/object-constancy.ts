function freeze(obj) {
  var propNames = Object.getOwnPropertyNames(obj);

  // 遍历每个属性名
  propNames.forEach((name) => {
    var prop = obj[name];

    if (prop !== null && typeof prop === 'object') {
      freeze(prop);
    }
  });

  return Object.freeze(obj);
}

export function testObjectConstancy() {
  // 测试对象
  let testObj = {
    name: 'wuhaolei',
    age: 23,
    details: {
      address: {
        city: 'New York',
        zip: '10001'
      }
    }
  };

  const frozenObject = freeze(testObj);
  console.log('old value: ', frozenObject.details.address.city);
  try {
    frozenObject.details.address.city = 'Los Angeles';
  } catch (e) {
    console.log('对象已经固化无法修改', e.message);
  }
  console.log('new value: ', frozenObject.details.address.city);
}
