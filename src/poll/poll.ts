async function shortPoll(url: string, maxRetries: number = 5, interval: number = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await fetch(url);
      console.log(`Successfully fetched data: ${result}`);
      return result;
    } catch (error) {
      console.log(`Retrying ${retries + 1} of ${maxRetries} in ${interval}ms`);
      retries++;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

shortPoll("https://jsonplace.typicode.com/posts/1", 5, 1000).then(res => {
  console.log(res);
});

/**
 * 指数退避策略（如间隔逐步增加）
 * 缓解服务端压力与网络拥堵
 */
async function exponentialBackoffPoll(url: string, maxRetries: number = 5, interval: number = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const result = await fetch(url);
      console.log(`Successfully fetched data: ${result}`);
      return result;
    } catch (error) {
      console.log(`Retrying ${retries + 1} of ${maxRetries} in ${interval}ms`);
      retries++;
      await new Promise(resolve => setTimeout(resolve, interval * Math.pow(2, retries)));
    }
  }
}

/**
 * 长轮询
 * AbortController 接口表示一个控制器对象，允许你根据需要中止一个或多个 Web 请求。(使用 AbortController 来控制请求超时，防止请求无限挂起。)
 * 收到响应无新数据时，马上重新发起请求，形成“长时间等待-快速重连”的循环。
 * 该实现需要服务器端配合支持长轮询逻辑，客户端根据响应决定是否继续请求。
 */
async function longPoll(url: string, maxRetries: number = 5, timeout: number = 30000) {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      // 向服务器发起请求，注意传入signal支持超时中止
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.hasUpdate) {
        return data;
      }
      // 服务器反应无更新时，立即继续发起请求，形成长轮询循环
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        throw new Error(`长轮询失败，重试次数达到上限: ${error.message}`);
      }
      // 失败时等待一段时间再重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
