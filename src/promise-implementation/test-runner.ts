/**
 * 统一测试运行器
 * 运行所有阶段的测试
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TestResult {
  stage: string;
  passed: boolean;
  output: string;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🚀 开始运行所有Promise实现测试\n');

    const stages = [
      { name: '第一阶段：基础Promise', path: '01-basic-promise/test.ts' },
      { name: '第二阶段：异步Promise', path: '02-async-promise/test.ts' },
      { name: '第三阶段：Then链式调用', path: '03-then-chain/test.ts' },
      { name: '第五阶段：静态方法', path: '05-static-methods/test.ts' },
      { name: '第七阶段：Promise/A+兼容', path: '07-promises-aplus/test.ts' }
    ];

    for (const stage of stages) {
      await this.runSingleTest(stage.name, stage.path);
    }

    this.printSummary();
  }

  private async runSingleTest(stageName: string, testPath: string): Promise<void> {
    console.log(`📋 运行 ${stageName}`);
    
    try {
      const { stdout, stderr } = await execAsync(`npx ts-node ${testPath}`, {
        cwd: __dirname,
        timeout: 30000
      });

      const passed = !stderr && !stdout.includes('失败') && !stdout.includes('❌');
      
      this.results.push({
        stage: stageName,
        passed,
        output: stdout,
        error: stderr
      });

      if (passed) {
        console.log(`  ✅ 通过\n`);
      } else {
        console.log(`  ❌ 失败\n`);
        if (stderr) {
          console.log(`  错误: ${stderr}\n`);
        }
      }
    } catch (error) {
      console.log(`  ❌ 执行失败: ${error instanceof Error ? error.message : error}\n`);
      
      this.results.push({
        stage: stageName,
        passed: false,
        output: '',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private printSummary(): void {
    console.log('📊 测试总结\n');
    
    const passedCount = this.results.filter(r => r.passed).length;
    const totalCount = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.stage}`);
    });
    
    console.log(`\n🎯 总体结果: ${passedCount}/${totalCount} 通过`);
    
    if (passedCount === totalCount) {
      console.log('🎉 所有测试通过！Promise实现完成！');
    } else {
      console.log('💥 有测试失败，需要检查实现');
    }
  }

  async runPromiseAplusTests(): Promise<void> {
    console.log('🧪 运行Promise/A+官方测试套件\n');
    
    try {
      // 首先编译TypeScript文件
      console.log('📦 编译TypeScript文件...');
      await execAsync('npx tsc 07-promises-aplus/implementation.ts --target es2018 --module commonjs --outDir 07-promises-aplus/', {
        cwd: __dirname
      });
      
      // 运行Promise/A+测试
      console.log('🔬 运行Promise/A+测试...');
      const { stdout, stderr } = await execAsync('npx promises-aplus-tests 07-promises-aplus/aplus-adapter.js', {
        cwd: __dirname,
        timeout: 120000 // 2分钟超时
      });
      
      console.log(stdout);
      if (stderr) {
        console.error('错误输出:', stderr);
      }
      
      if (stdout.includes('passing')) {
        console.log('🎉 通过Promise/A+官方测试！');
      } else {
        console.log('💥 Promise/A+测试失败');
      }
      
    } catch (error) {
      console.error('❌ Promise/A+测试执行失败:', error instanceof Error ? error.message : error);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const runner = new TestRunner();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--aplus')) {
    await runner.runPromiseAplusTests();
  } else if (args.includes('--all')) {
    await runner.runAllTests();
    console.log('\n' + '='.repeat(50) + '\n');
    await runner.runPromiseAplusTests();
  } else {
    await runner.runAllTests();
  }
}

if (require.main === module) {
  main().catch(console.error);
}
