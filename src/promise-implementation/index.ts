/**
 * TypeScript Promise实现教学项目入口文件
 */

// 导出各个阶段的Promise实现
export { MyPromise as BasicPromise } from './01-basic-promise/implementation';
export { MyPromise as AsyncPromise } from './02-async-promise/implementation';
export { MyPromise as ChainPromise } from './03-then-chain/implementation';
export { MyPromise as StaticPromise } from './05-static-methods/implementation';
export { MyPromise as AplusPromise } from './07-promises-aplus/implementation';

// 导出最终完整版本
export { MyPromise } from './05-static-methods/implementation';

// 导出类型定义
export type {
  Executor,
  OnFulfilled,
  OnRejected, PromiseSettledResult, PromiseState, Thenable
} from './05-static-methods/implementation';

/**
 * 演示所有阶段的Promise实现
 */
export async function demonstrateAllStages(): Promise<void> {
  console.log('🚀 TypeScript Promise实现教学项目');
  console.log('📚 包含7个学习阶段，从基础到Promise/A+规范完整实现\n');

  // 基础Promise演示
  console.log('📝 第一阶段：基础Promise');
  const { MyPromise: BasicPromise } = await import('./01-basic-promise/implementation');
  const basicPromise = new BasicPromise<number>(resolve => resolve(42));
  basicPromise.then(value => console.log(`  基础Promise结果: ${value}`));

  // 异步Promise演示
  setTimeout(async () => {
    console.log('\n📝 第二阶段：异步Promise');
    const { MyPromise: AsyncPromise } = await import('./02-async-promise/implementation');
    const asyncPromise = new AsyncPromise<string>(resolve => {
      setTimeout(() => resolve('异步结果'), 100);
    });
    asyncPromise.then(value => console.log(`  异步Promise结果: ${value}`));
  }, 100);

  // 链式调用演示
  setTimeout(async () => {
    console.log('\n📝 第三阶段：链式调用');
    const { MyPromise: ChainPromise } = await import('./03-then-chain/implementation');
    const chainPromise = new ChainPromise<number>(resolve => resolve(10));
    chainPromise
      .then(value => value * 2)
      .then(value => `链式结果: ${value}`)
      .then(result => console.log(`  ${result}`));
  }, 300);

  // 静态方法演示
  setTimeout(async () => {
    console.log('\n📝 第五阶段：静态方法');
    const { MyPromise: StaticPromise } = await import('./05-static-methods/implementation');
    
    const promises = [
      StaticPromise.resolve('第一个'),
      StaticPromise.resolve('第二个'),
      StaticPromise.resolve('第三个')
    ];
    
    StaticPromise.all(promises).then(results => {
      console.log(`  Promise.all结果: ${results.join(', ')}`);
    });
  }, 500);

  // Promise/A+演示
  setTimeout(async () => {
    console.log('\n📝 第七阶段：Promise/A+规范兼容');
    const { MyPromise: AplusPromise } = await import('./07-promises-aplus/implementation');
    
    const aplusPromise = new AplusPromise(resolve => resolve('Promise/A+兼容'));
    aplusPromise.then((value: any) => {
      console.log(`  ${value}实现完成`);
      console.log('\n✅ 所有阶段演示完成！');
      console.log('💡 查看各个目录的README.md了解详细学习内容');
    });
  }, 700);
}

/**
 * 运行所有测试
 */
export async function runAllTests(): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  console.log('🧪 运行所有Promise实现测试\n');

  try {
    const { stdout } = await execAsync('npx ts-node test-runner.ts', {
      cwd: __dirname
    });
    console.log(stdout);
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
  }
}

// 如果直接运行此文件，执行演示
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    runAllTests();
  } else {
    demonstrateAllStages();
  }
}
