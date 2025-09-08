// 运行所有TDD测试的入口文件
import { runBasicEventEmitterTests } from './01-basic-event-emitter.test';
import { runImprovedEventEmitterTests } from './02-improved-event-emitter.test';
import { runTypedEventEmitterTests } from './03-typed-event-emitter.test';
import { runAsyncEventEmitterTests } from './04-async-event-emitter.test';

async function runAllTests() {
  console.log('🚀 EventEmitter TDD 学习测试套件');
  console.log('=' .repeat(50));
  
  try {
    // 第一阶段：基础EventEmitter
    console.log('\n🎯 第一阶段：基础EventEmitter');
    console.log('-'.repeat(30));
    await runBasicEventEmitterTests().run();
    
    // 第二阶段：改进版EventEmitter
    console.log('\n🎯 第二阶段：改进版EventEmitter');
    console.log('-'.repeat(30));
    await runImprovedEventEmitterTests().run();
    
    // 第三阶段：类型安全EventEmitter
    console.log('\n🎯 第三阶段：类型安全EventEmitter');
    console.log('-'.repeat(30));
    await runTypedEventEmitterTests().run();
    
    // 第四阶段：异步EventEmitter
    console.log('\n🎯 第四阶段：异步EventEmitter');
    console.log('-'.repeat(30));
    await runAsyncEventEmitterTests().run();
    
    console.log('\n🎉 所有测试阶段完成！');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('\n❌ 测试运行出错:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests();
}

export { runAllTests };
