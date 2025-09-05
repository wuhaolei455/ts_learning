// 3.11.2 3.11.3
// 3.11.2.4 3.11.2 3.11.3 3.11.1
// 3.0 3.0.0.0
function compareVersion1(version1: string, version2: string): number {
  const v1 = version1.split(".");
  const v2 = version2.split(".");
  const minLen = Math.min(v1.length, v2.length);

  for (let i = 0; i < minLen; i++) {
    const a = parseInt(v1[i]);
    const b = parseInt(v2[i]);
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
  }

  if (v1.length > v2.length) {
    return 1;
  }
  if (v1.length < v2.length) {
    return -1;
  }
  return 0;
}

function compareVersion(version1: string, version2: string): number {
  const v1 = version1.split(".");
  const v2 = version2.split(".");
  const len = Math.max(v1.length, v2.length);

  for (let i = 0; i < len; i++) {
    const a = parseInt(v1[i] || "0");
    const b = parseInt(v2[i] || "0");
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
  }

  return 0;
}

function greaterThanOrEqual(version: string): boolean {
  return compareVersion("3.118", version) >= 0;
}

console.log(greaterThanOrEqual("3.118.0.1"));
