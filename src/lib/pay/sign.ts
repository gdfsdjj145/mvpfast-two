import md5 from 'md5';

export function paySign(params, key) {
    const paramsArr = Object.keys(params);
    paramsArr.sort();
    const stringArr = []
    paramsArr.map(key => {
        stringArr.push(key + '=' + params[key]);
    })
    // 最后加上 商户Key
    stringArr.push("key=" + key)
    const string = stringArr.join('&');
    return md5(string).toString().toUpperCase();
}
