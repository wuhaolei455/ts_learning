/**
 * 第一阶段演示：基础Promise使用示例
 */

import { MyPromise } from './implementation';

console.log('🚀 第一阶段：基础Promise演示\n');

// 示例1：基础的同步resolve
console.log('📝 示例1：同步resolve');
const promise1 = new MyPromise<number>((resolve, _reject) => {
  console.log('  执行器立即执行');
  resolve(42);
});

console.log(`  Promise状态: ${promise1.getState()}`);
console.log(`  Promise值: ${promise1.getValue()}\n`);

// 示例2：基础的同步reject
console.log('📝 示例2：同步reject');
const promise2 = new MyPromise<string>((_resolve, reject) => {
  reject(new Error('出错了！'));
});

console.log(`  Promise状态: ${promise2.getState()}`);
console.log(`  Promise错误: ${promise2.getReason()?.message}\n`);

// 示例3：then方法的基础使用
console.log('📝 示例3：then方法基础使用');
const promise3 = new MyPromise<number>((resolve) => {
  resolve(10);
});

promise3.then(value => {
  console.log(`  收到值: ${value}`);
  return value * 2;
}).then(value => {
  console.log(`  链式调用结果: ${value}`);
  return `结果是: ${value}`;
}).then(value => {
  console.log(`  最终结果: ${value}`);
});

console.log();

// 示例4：错误处理
console.log('📝 示例4：错误处理');
const promise4 = new MyPromise<number>((_resolve, reject) => {
  reject(new Error('这是一个错误'));
});

promise4.catch(error => {
  console.log(`  捕获错误: ${error.message}`);
  return '错误已处理';
}).then(value => {
  console.log(`  错误处理后的值: ${value}`);
});

console.log();

// 示例5：执行器中的错误
console.log('📝 示例5：执行器中的错误');
const promise5 = new MyPromise<string>((_resolve, _reject) => {
  // 故意抛出错误
  throw new Error('执行器中的错误');
});

promise5.catch(error => {
  console.log(`  自动捕获执行器错误: ${error.message}`);
});

console.log();

// 示例6：类型安全演示
console.log('📝 示例6：TypeScript类型安全');
interface User {
  id: number;
  name: string;
}

const promise6 = new MyPromise<User>((resolve) => {
  resolve({ id: 1, name: '张三' });
});

promise6.then(user => {
  // TypeScript会推断user的类型为User
  console.log(`  用户ID: ${user.id}`);
  console.log(`  用户名: ${user.name}`);
  return user.name.toUpperCase(); // 返回string类型
}).then(upperName => {
  // TypeScript推断upperName为string类型
  console.log(`  大写用户名: ${upperName}`);
});

console.log();

// 示例7：链式调用中的Promise返回
console.log('📝 示例7：链式调用中返回Promise');
const promise7 = new MyPromise<number>((resolve) => {
  resolve(5);
});

promise7.then(value => {
  console.log(`  第一步: ${value}`);
  // 返回一个新的Promise
  return new MyPromise<string>((resolve) => {
    resolve(`处理后的值: ${value * 2}`);
  });
}).then(result => {
  console.log(`  第二步: ${result}`);
});

console.log();

// 示例8：状态的不可逆性
console.log('📝 示例8：状态不可逆性演示');
const promise8 = new MyPromise<string>((resolve, reject) => {
  resolve('第一次resolve');
  resolve('第二次resolve'); // 这次调用会被忽略
  reject(new Error('尝试reject')); // 这次调用也会被忽略
});

console.log(`  最终状态: ${promise8.getState()}`);
console.log(`  最终值: ${promise8.getValue()}`);

console.log('\n✅ 第一阶段演示完成！');
console.log('💡 注意：当前实现只支持同步操作，异步操作将在第二阶段实现。');
