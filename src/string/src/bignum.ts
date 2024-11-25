function handleParseJsonWithBigNumber(jsonString) {
    return jsonString.replace(/(\d{15,})/g, '"$1"')
}

export function testParseBigNumber() {
    const jsonString = '{"smallNumber": 123, "bigNumber": 955501589089619968}';
    const parsedJsonString = handleParseJsonWithBigNumber(jsonString);
    const json = JSON.parse(jsonString);
    const parsedJson = JSON.parse(parsedJsonString);

    console.log(parsedJsonString);
    console.log(json.bigNumber);        // 输出："955501589089620000" (字符串)
    console.log(parsedJson.bigNumber);  // 输出："955501589089619968" (字符串)
}