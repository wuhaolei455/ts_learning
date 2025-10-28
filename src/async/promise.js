console.log('Start');

setTimeout(() => {
  console.log('Timeout 1');
  Promise.resolve().then(() => {
    console.log('Promise in Timeout 1');
  });
}, 0);

new Promise((resolve) => {
  console.log('Promise executor');
  resolve();
})
  .then(() => {
    console.log('Promise 1');
    setTimeout(() => {
      console.log('Timeout 2');
    }, 0);
  })
  .then(() => {
    console.log('Promise 2');
  });

setTimeout(() => {
  console.log('Timeout 3');
}, 0);

console.log('End');

// Start
// Promise executor
// End
// Promise 1
// Promise 2
// Timeout 1
// Promise in Timeout 1
// Timeout 3
// Timeout 2