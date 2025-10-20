/**
 * runGenerator 函数详解示例
 * 这是 async/await 的底层实现原理
 */

console.log("=== runGenerator 详解 ===\n");

// ============================================
// 1. 核心实现：自动执行 Generator
// ============================================

function runGenerator(gen) {
  return new Promise((resolve, reject) => {
    const g = gen(); // 创建 Generator 对象

    function step(nextValue) {
      console.log(`  📍 step() 被调用，传入值:`, nextValue);

      const result = g.next(nextValue);
      console.log(`  ⚙️  g.next() 返回:`, result);

      if (result.done) {
        console.log(`  ✅ Generator 执行完毕\n`);
        return resolve(result.value);
      }

      console.log(`  ⏳ 等待 Promise 完成...\n`);
      // 递归处理gen
      Promise.resolve(result.value)
        .then((value) => step(value))
        .catch(reject);
    }

    step(); // 启动执行
  });
}

// ============================================
// 2. 模拟异步操作
// ============================================

function fetchUser(id) {
  console.log(`🌐 开始请求用户 ${id}...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = { id, name: `User${id}`, age: 25 };
      console.log(`✓ 用户数据获取成功:`, user);
      resolve(user);
    }, 500);
  });
}

function fetchPosts(userId) {
  console.log(`🌐 开始请求用户 ${userId} 的文章...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const posts = [
        { id: 1, title: "Post 1", userId },
        { id: 2, title: "Post 2", userId },
      ];
      console.log(`✓ 文章数据获取成功:`, posts);
      resolve(posts);
    }, 500);
  });
}

function fetchComments(postId) {
  console.log(`🌐 开始请求文章 ${postId} 的评论...`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const comments = [
        { id: 1, content: "Great!", postId },
        { id: 2, content: "Nice!", postId },
      ];
      console.log(`✓ 评论数据获取成功:`, comments);
      resolve(comments);
    }, 500);
  });
}

// ============================================
// 3. 使用 Generator 编写异步代码
// ============================================

console.log("--- 示例 1: 基础用法 ---\n");

function* fetchDataBasic() {
  console.log("🚀 Generator 开始执行\n");

  const user = yield fetchUser(1);
  console.log(`\n💾 收到用户数据:`, user);

  const posts = yield fetchPosts(user.id);
  console.log(`\n💾 收到文章数据:`, posts);

  console.log("\n🎯 Generator 即将返回最终结果");
  return { user, posts };
}

runGenerator(fetchDataBasic)
  .then((result) => {
    console.log("\n🎉 最终结果:", result);
    console.log("\n" + "=".repeat(50) + "\n");
    return runExample2();
  })
  .catch((error) => {
    console.error("❌ 错误:", error);
  });

// ============================================
// 4. 更复杂的例子：串行请求
// ============================================

function runExample2() {
  console.log("--- 示例 2: 串行异步请求 ---\n");

  function* fetchAllData() {
    // 步骤 1: 获取用户
    const user = yield fetchUser(1);

    // 步骤 2: 获取文章
    const posts = yield fetchPosts(user.id);

    // 步骤 3: 获取第一篇文章的评论
    const comments = yield fetchComments(posts[0].id);

    // 返回所有数据
    return { user, posts, comments };
  }

  return runGenerator(fetchAllData)
    .then((result) => {
      console.log("\n🎉 所有数据:", result);
      console.log("\n" + "=".repeat(50) + "\n");
      return runExample3();
    })
    .catch(console.error);
}

// ============================================
// 5. 对比：Generator vs async/await
// ============================================

function runExample3() {
  console.log("--- 示例 3: Generator vs async/await ---\n");

  // Generator 写法
  function* generatorVersion() {
    const user = yield fetchUser(1);
    const posts = yield fetchPosts(user.id);
    return { user, posts };
  }

  // 等价的 async/await 写法
  async function asyncVersion() {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  }

  console.log("Generator 版本:");
  return runGenerator(generatorVersion)
    .then((result1) => {
      console.log("Generator 结果:", result1);

      console.log("\nasync/await 版本:");
      return asyncVersion();
    })
    .then((result2) => {
      console.log("async/await 结果:", result2);
      console.log("\n💡 两种方式完全等价！");
      console.log("\n" + "=".repeat(50) + "\n");
      return runExample4();
    });
}

// ============================================
// 6. 错误处理
// ============================================

function runExample4() {
  console.log("--- 示例 4: 错误处理 ---\n");

  function fetchWithError() {
    return Promise.reject(new Error("网络请求失败"));
  }

  function* generatorWithError() {
    try {
      const data = yield fetchWithError();
      return data;
    } catch (error) {
      console.log("Generator 内部捕获错误:", error.message);
      return { error: error.message };
    }
  }

  return runGenerator(generatorWithError)
    .then((result) => {
      console.log("最终返回:", result);
      console.log("\n" + "=".repeat(50) + "\n");
      showSummary();
    })
    .catch((error) => {
      console.log("外部捕获错误:", error.message);
      showSummary();
    });
}

// ============================================
// 7. 总结
// ============================================

function showSummary() {
  console.log("=== 总结 ===\n");

  console.log("📌 runGenerator 的作用：");
  console.log("   1. 自动执行 Generator 函数");
  console.log("   2. 处理 yield 返回的 Promise");
  console.log("   3. 将 Promise 的结果传回 Generator");
  console.log("   4. 返回一个 Promise，包含最终结果\n");

  console.log("📌 执行流程：");
  console.log("   ① 调用 g.next() 执行到第一个 yield");
  console.log("   ② 获取 yield 的 Promise");
  console.log("   ③ 等待 Promise 完成");
  console.log("   ④ 用 Promise 的结果调用 g.next(value)");
  console.log("   ⑤ 重复步骤 ①-④，直到 done: true\n");

  console.log("📌 核心技巧：");
  console.log("   • Promise.resolve() 统一处理返回值");
  console.log("   • 递归调用 step() 实现自动执行");
  console.log("   • g.next(value) 将异步结果传回 Generator\n");

  console.log("💡 这就是 async/await 的实现原理！\n");

  console.log("📚 关键对应关系：");
  console.log("   Generator + yield  ←→  async/await");
  console.log("   runGenerator       ←→  JavaScript 引擎自动执行");
  console.log("   yield Promise      ←→  await Promise\n");

  console.log("=== 演示完成 ===");
}
