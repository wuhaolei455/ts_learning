function doHeavyWork(index) {
  const start = performance.now();
  while (performance.now() - start < 5) {
    // do nothing, just wait
  }
  console.log(`Doing heavy work: ${index}`);
}

/**
 * 使用 setTimeout 实现的时间切片
 */
async function timeSlicedWork() {
  for (let i = 0; i < 1000; i += 50) {
    for (let j = i; j < i + 50; j++) {
      doHeavyWork(j);
    }
    await new Promise(resolve => setTimeout(resolve, 0)); // 让出主线程
  }
}

/**
 * 使用 requestIdleCallback + requestAnimationFrame 实现的时间切片
 * 更智能地利用浏览器空闲时间执行任务
 */
async function timeSlicedWorkWithIdle() {
  // requestIdleCallback 的 polyfill（兼容性处理）
  const requestIdleCallbackPolyfill = window.requestIdleCallback || function(callback) {
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
      });
    }, 1);
  };

  return new Promise((resolve) => {
    let currentIndex = 0;
    const totalTasks = 1000;

    function processTask(deadline) {
      // 当还有剩余时间且有任务时，继续执行
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && currentIndex < totalTasks) {
        doHeavyWork(currentIndex);
        currentIndex++;

        // 如果所有任务完成
        if (currentIndex >= totalTasks) {
          resolve();
          return;
        }
      }

      // 如果还有任务，继续调度
      if (currentIndex < totalTasks) {
        // 使用 requestAnimationFrame 确保在下一帧之前更新
        requestAnimationFrame(() => {
          // 在下一帧中使用 requestIdleCallback 继续执行
          requestIdleCallbackPolyfill(processTask);
        });
      }
    }

    // 开始处理
    requestIdleCallbackPolyfill(processTask);
  });
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
  await timeSlicedWork();
}
