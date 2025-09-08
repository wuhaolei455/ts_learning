let counter = 0;

function inc() {
  counter++;
}

module.exports = {
  inc: inc,
  count: counter,
};
