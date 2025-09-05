async function sleep(millis: number): Promise<void> {
  await new Promise((res) => setTimeout(res, millis));
}

async function sleep1(millis: number): Promise<void> {
  await new Promise((res) => setTimeout((a: unknown) => res(a), millis));
}

async function sleep2(millis: number): Promise<void> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve();
    }, millis)
  );
}
//暫停millis個毫秒，然后去做

/**
 * let t = Date.now()
 * sleep(100).then(() => console.log(Date.now() - t)) // 100
 */
