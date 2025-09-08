/**
 * 第五阶段演示：静态方法使用示例
 */

import { MyPromise } from './implementation';

console.log('🚀 第五阶段：静态方法演示\n');

// 辅助函数：创建延迟Promise
function delay(ms: number, value?: any): MyPromise<any> {
  return new MyPromise((resolve) => {
    setTimeout(() => resolve(value ?? `延迟${ms}ms`), ms);
  });
}

// 示例1：Promise.resolve
console.log('📝 示例1：Promise.resolve');

// resolve普通值
const resolved1 = MyPromise.resolve(42);
resolved1.then(value => {
  console.log(`  resolve普通值: ${value}`);
});

// resolve Promise实例
const existingPromise = delay(100, 'existing');
const resolved2 = MyPromise.resolve(existingPromise);
resolved2.then(value => {
  console.log(`  resolve Promise实例: ${value}`);
});

// resolve thenable对象
const thenable = {
  then(onFulfilled: Function) {
    setTimeout(() => onFulfilled('thenable值'), 50);
  }
};
const resolved3 = MyPromise.resolve(thenable);
resolved3.then(value => {
  console.log(`  resolve thenable: ${value}\n`);
});

// 示例2：Promise.reject
setTimeout(() => {
  console.log('📝 示例2：Promise.reject');
  
  const rejected = MyPromise.reject(new Error('静态reject错误'));
  rejected.catch(error => {
    console.log(`  捕获错误: ${error.message}\n`);
  });
}, 200);

// 示例3：Promise.all
setTimeout(() => {
  console.log('📝 示例3：Promise.all');
  
  const promises = [
    delay(100, 'first'),
    delay(150, 'second'),
    delay(80, 'third')
  ];

  const startTime = Date.now();
  MyPromise.all(promises).then(results => {
    const endTime = Date.now();
    console.log(`  all结果: ${JSON.stringify(results)}`);
    console.log(`  总耗时: ${endTime - startTime}ms (应该约150ms)\n`);
  });
}, 300);

// 示例4：Promise.all失败情况
setTimeout(() => {
  console.log('📝 示例4：Promise.all失败情况');
  
  const mixedPromises = [
    delay(100, 'success1'),
    MyPromise.reject(new Error('中间失败')),
    delay(200, 'success2')
  ];

  MyPromise.all(mixedPromises).catch(error => {
    console.log(`  all失败: ${error.message}\n`);
  });
}, 800);

// 示例5：Promise.race
setTimeout(() => {
  console.log('📝 示例5：Promise.race');
  
  const racePromises = [
    delay(200, 'slow'),
    delay(100, 'fast'),
    delay(300, 'slowest')
  ];

  const startTime = Date.now();
  MyPromise.race(racePromises).then(result => {
    const endTime = Date.now();
    console.log(`  race结果: ${result}`);
    console.log(`  耗时: ${endTime - startTime}ms (应该约100ms)\n`);
  });
}, 1200);

// 示例6：Promise.allSettled
setTimeout(() => {
  console.log('📝 示例6：Promise.allSettled');
  
  const settledPromises = [
    delay(100, 'success'),
    MyPromise.reject(new Error('failure')),
    delay(150, 'another success'),
    MyPromise.reject(new Error('another failure'))
  ];

  MyPromise.allSettled(settledPromises).then(results => {
    console.log('  allSettled结果:');
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`    [${index}] 成功: ${result.value}`);
      } else {
        console.log(`    [${index}] 失败: ${result.reason?.message}`);
      }
    });
    console.log();
  });
}, 1600);

// 示例7：Promise.any
setTimeout(() => {
  console.log('📝 示例7：Promise.any - 成功情况');
  
  const anyPromises = [
    delay(200).then(() => { throw new Error('第一个失败'); }),
    delay(150, '第一个成功'),
    delay(100).then(() => { throw new Error('第二个失败'); })
  ];

  MyPromise.any(anyPromises).then(result => {
    console.log(`  any结果: ${result}\n`);
  });
}, 2000);

// 示例8：Promise.any全部失败
setTimeout(() => {
  console.log('📝 示例8：Promise.any - 全部失败');
  
  const allFailPromises = [
    MyPromise.reject(new Error('错误1')),
    MyPromise.reject(new Error('错误2')),
    MyPromise.reject(new Error('错误3'))
  ];

  MyPromise.any(allFailPromises).catch(error => {
    console.log(`  any全部失败: ${error.name}`);
    console.log(`  错误数量: ${error.errors?.length}\n`);
  });
}, 2500);

// 示例9：类型安全演示
setTimeout(() => {
  console.log('📝 示例9：TypeScript类型安全');
  
  // all的类型推断
  const typedAll = MyPromise.all([
    MyPromise.resolve(42),
    MyPromise.resolve('hello'),
    MyPromise.resolve(true)
  ]);

  typedAll.then(([num, str, bool]) => {
    // TypeScript应该正确推断类型
    console.log(`  类型安全的all: number=${num}, string=${str}, boolean=${bool}`);
  });

  // race的类型推断
  const typedRace = MyPromise.race([
    delay(100, 'string result'),
    delay(200, 42)
  ]);

  typedRace.then(result => {
    console.log(`  类型安全的race: ${result} (类型: ${typeof result})\n`);
  });
}, 3000);

// 示例10：复杂组合使用
setTimeout(() => {
  console.log('📝 示例10：复杂组合使用');
  
  // 创建一个复杂的异步流程
  const step1 = MyPromise.resolve(['task1', 'task2', 'task3']);
  
  step1
    .then(tasks => {
      console.log(`  开始处理任务: ${tasks.join(', ')}`);
      // 并行处理所有任务
      return MyPromise.all(
        tasks.map((task, index) => delay(50 + index * 30, `${task}完成`))
      );
    })
    .then(results => {
      console.log(`  所有任务完成: ${results.join(', ')}`);
      // 竞争获取最快的结果
      return MyPromise.race([
        delay(100, '快速处理'),
        delay(200, '慢速处理')
      ]);
    })
    .then(winner => {
      console.log(`  获胜者: ${winner}`);
      // 最终确认所有状态
      return MyPromise.allSettled([
        MyPromise.resolve('最终成功'),
        MyPromise.reject(new Error('预期的错误'))
      ]);
    })
    .then(finalResults => {
      console.log('  最终状态:');
      finalResults.forEach((result, index) => {
        console.log(`    结果${index}: ${result.status}`);
      });
    });
}, 3500);

// 示例11：性能测试
setTimeout(() => {
  console.log('📝 示例11：大量Promise的性能测试');
  
  const startTime = Date.now();
  const manyPromises = Array.from({ length: 1000 }, (_, i) => 
    MyPromise.resolve(i)
  );

  MyPromise.all(manyPromises).then(results => {
    const endTime = Date.now();
    console.log(`  处理1000个Promise: ${endTime - startTime}ms`);
    console.log(`  结果长度: ${results.length}`);
    console.log(`  前5个结果: ${results.slice(0, 5).join(', ')}\n`);
  });
}, 4500);

// 等待所有示例完成
setTimeout(() => {
  console.log('✅ 第五阶段演示完成！');
  console.log('💡 现在Promise拥有完整的静态方法支持：');
  console.log('   - Promise.resolve() / Promise.reject()');
  console.log('   - Promise.all() / Promise.race()');
  console.log('   - Promise.allSettled() / Promise.any()');
  console.log('   - 完整的TypeScript类型支持');
  console.log('   - 符合ES2020+规范');
}, 6000);
