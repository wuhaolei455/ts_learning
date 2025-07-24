import { tPromise } from "../tPromise.js";

new tPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("success", new Date().getTime());
  }, 1000);
  setTimeout(() => {
    reject("failure");
  }, 2000);
  setTimeout(() => {
    throw new Error("An error occurred");
  }, 3000);
})
  .then(
    (result) => {
      console.log("Result:", result);
    },
    (error) => {
      console.log("fulfilled error:", error);
    }
  )
  .catch((error) => {
    console.error("Error:", error);
  });
