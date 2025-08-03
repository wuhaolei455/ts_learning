async function asyncTask() {
  console.log("Async task started");
  await new Promise((resolve) =>
    setTimeout(() => {
      console.log(111);
    }, 1000)
  );
  console.log("Async task finished");
}

console.log("Before async task");
asyncTask();
console.log("After async task");
setTimeout(() => {
  console.log(555);
}, 500);
