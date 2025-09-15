// 配置化调用
function createLogger(level) {
  return function (message) {
    console.log(`[${level}] ${message}`);
  };
}

const infoLogger = createLogger("INFO");
const errorLogger = createLogger("ERROR");

infoLogger("This is an informational message.");
errorLogger("This is an error message.");
