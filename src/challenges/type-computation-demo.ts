// TypeScript 类型运算演示

import type { Equal, Expect, NotAny } from './test-utils'

// ============= 基础类型运算演示 =============

// 1. 条件类型运算
type IsString<T> = T extends string ? '是字符串' : '不是字符串'
type Test1 = IsString<string>  // '是字符串'
type Test2 = IsString<number>  // '不是字符串'

// 2. 类型相等判断
type StringTest = Equal<string, string>  // true
type NumberTest = Equal<string, number>  // false
type AnyTest = Equal<any, string>        // false (精确判断)

// 3. Any 类型检测
type IsStringAny = NotAny<string>  // true (string 不是 any)
type IsAnyAny = NotAny<any>        // false (any 是 any)

// ============= HelloWorld 类型运算分解 =============

// 定义我们要测试的类型
type HelloWorld = string

// 分步骤展示类型运算过程
type Step1_NotAnyCheck = NotAny<HelloWorld>      // true
type Step2_EqualCheck = Equal<HelloWorld, string> // true

type Step3_ExpectNotAny = Expect<Step1_NotAnyCheck>  // true
type Step4_ExpectEqual = Expect<Step2_EqualCheck>    // true

// 组合成测试用例数组
type TestCases = [Step3_ExpectNotAny, Step4_ExpectEqual]  // [true, true]

// 最终验证
type FinalResult = TestCases extends readonly true[] ? 'ALL_PASS' : 'SOME_FAIL'  // 'ALL_PASS'

// ============= 类型运算的可视化 =============

// 通过编译时断言来验证每一步
const _step1: true = {} as Step1_NotAnyCheck      // ✅ 编译通过
const _step2: true = {} as Step2_EqualCheck       // ✅ 编译通过  
const _step3: true = {} as Step3_ExpectNotAny     // ✅ 编译通过
const _step4: true = {} as Step4_ExpectEqual      // ✅ 编译通过
const _final: 'ALL_PASS' = {} as FinalResult      // ✅ 编译通过

// ============= 运行时输出 =============
console.log('=== TypeScript 类型运算演示 ===')
console.log()

console.log('🔍 基础类型检查:')
console.log('IsString<string>:', {} as IsString<string>)
console.log('IsString<number>:', {} as IsString<number>)
console.log()

console.log('⚖️  类型相等判断:')
console.log('Equal<string, string>:', {} as Equal<string, string>)
console.log('Equal<string, number>:', {} as Equal<string, number>)
console.log('Equal<any, string>:', {} as Equal<any, string>)
console.log()

console.log('🚫 Any 类型检测:')
console.log('NotAny<string>:', {} as NotAny<string>)
console.log('NotAny<any>:', {} as NotAny<any>)
console.log()

console.log('📝 HelloWorld 类型运算步骤:')
console.log('Step 1 - NotAny<HelloWorld>:', {} as Step1_NotAnyCheck)
console.log('Step 2 - Equal<HelloWorld, string>:', {} as Step2_EqualCheck)
console.log('Step 3 - Expect(Step1):', {} as Step3_ExpectNotAny)
console.log('Step 4 - Expect(Step2):', {} as Step4_ExpectEqual)
console.log('Final Result:', {} as FinalResult)
console.log()

console.log('🎉 结论: HelloWorld 类型定义正确!')
console.log('   - HelloWorld 不是 any 类型 ✅')
console.log('   - HelloWorld 等于 string 类型 ✅')
console.log('   - 所有测试用例都通过 ✅')

// ============= 错误示例 =============
// 如果我们故意定义错误的类型，会发生什么？

// type WrongHelloWorld = number  // 故意定义错误

// 下面的代码会编译失败（注释掉以避免编译错误）
// type WrongStep2 = Equal<WrongHelloWorld, string>  // false
// type WrongStep4 = Expect<WrongStep2>              // 编译错误！因为 false extends true 失败
// const _wrong: true = {} as WrongStep4             // 编译错误！

console.log()
console.log('💡 提示: 如果类型定义错误，TypeScript 会在编译时报错!')
console.log('   这就是类型级别编程的强大之处 - 编译时验证逻辑正确性!')
