import md5 from 'md5';

export function paySign(params: Record<string, string | number>, key: string): string {
    const paramsArr = Object.keys(params);
    paramsArr.sort();
    const stringArr: string[] = [];
    paramsArr.forEach(k => {
        stringArr.push(k + '=' + params[k]);
    });
    // 最后加上 商户Key
    stringArr.push("key=" + key);
    const string = stringArr.join('&');
    return md5(string).toString().toUpperCase();
}
