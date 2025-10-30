function doHeavyWork(index) {
  const start = performance.now();
  while (performance.now() - start < 5) {
    // do nothing, just wait
  }
  console.log(`Doing heavy work: ${index}`);
}

/**
 * 使用 setTimeout 实现的时间切片
 * 切片拆分成1000个小任务，每次执行50个任务，然后让出主线程
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
async function timeSlicedWorkWithRAF(tasks = [], options = { timeout: 17 }) {
  let currentIndex = 0;
  function handleTask(deadline: IdleDeadline) {
    try {
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout) && currentIndex < tasks.length) {
        tasks[currentIndex]();
        currentIndex++;
      }
    } catch (e) {
      console.error('Error executing task:', e);
    }

    if (currentIndex < tasks.length) {
      requestAnimationFrame(() => {
        requestIdleCallback(handleTask, options);
      });
    }
  }

  requestIdleCallback(handleTask, options);
}

/**
 * generator实现的基础版本
 */
async function timeSlicedWorkWithIdle(tasks = [], options = { timeout: 17 }) {
  function* TaskGenerator() {
    for (const task of tasks) {
      yield task;
    }
  }
  const generator = TaskGenerator();
  function handleTask(deadline: IdleDeadline) {
    try {
      while ((deadline.timeRemaining() > 0 || deadline.didTimeout)) {
        const result = generator.next();
        if (result.done) {
          break;
        }
        const task = result.value;
        task();
      }
    } catch (e) {
      console.error('Error executing task:', e);
    } finally {
      requestAnimationFrame(() => {
        requestIdleCallback(handleTask, options);
      });
    }
  }
  requestIdleCallback(handleTask, options);
}


const tasks = [];
for (let i = 0; i < 1000; i++) {
  tasks.push(() => doHeavyWork(i));
}
