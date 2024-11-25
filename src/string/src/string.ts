// 使用indexOf和substring方法提取字符串中的子串
function extractSubstring(input: string, delimiter: string): string {
    const index = input.indexOf(delimiter);
    if (index !== -1) {
        return input.substring(0, index);
    } else {
        return input; // 如果没有找到delimiter，返回原字符串
    }
}


export function testExtractSubstring() {
    const inputString = "xxx--www.baidu.com";
    const delimiter = "--";

    const result = extractSubstring(inputString, delimiter);
    console.log(result); // xxx
}
