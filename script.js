// —— TOS4-HMAC-SHA256 签名脚本（优化版）——
// 参考官方SDK实现，增强了路径编码、Headers处理和错误处理

// —— 1. 基础变量（从环境变量获取）——
const accessKey = pm.environment.get("accessKey");
const secretKey = pm.environment.get("secretKey");
const region    = pm.environment.get("region");
const service   = pm.environment.get("service");  // 一般填 "tos"

// 基础参数校验
if (!accessKey || !secretKey || !region || !service) {
    throw new Error("Missing required environment variables: accessKey, secretKey, region, service");
}

// —— 2. 时间戳生成（与官方SDK保持一致）——
const now = new Date(new Date().toUTCString());
const amzDate = now.toISOString().replace(/\..+/, '').replace(/-/g, '').replace(/:/g, '') + 'Z';
const dateStamp = amzDate.substr(0, 8);

// —— 3. HTTP方法和URL解析 ——
const method = pm.request.method.toUpperCase();
// const host = pm.request.url.getHost();
const host = pm.variables.replaceIn(pm.request.url.getHost());
let canonicalUri = pm.request.url.getPath() || "/";

// —— 4. 路径编码优化（参考官方SDK的getEncodePath方法）——
function getEncodePath(path, encodeAll = true) {
    if (!path) return '';

    let tmpPath = path;
    if (encodeAll) {
        tmpPath = path.replace(/%2F/g, '/');
    }
    // 处理特殊字符，与官方SDK保持一致
    tmpPath = tmpPath.replace(/\(/g, '%28');
    tmpPath = tmpPath.replace(/\)/g, '%29');
    tmpPath = tmpPath.replace(/!/g, '%21');
    tmpPath = tmpPath.replace(/\*/g, '%2A');
    tmpPath = tmpPath.replace(/\'/g, '%27');
    return tmpPath;
}

// 应用路径编码
canonicalUri = getEncodePath(canonicalUri);

// —— 5. Query参数处理优化 ——
const params = pm.request.url.query.all().filter(p => !p.disabled);
// 按key排序（官方SDK要求）
params.sort((a, b) => a.key.localeCompare(b.key));

const canonicalQueryString = params.map(p => {
    const key = encodeURIComponent(p.key || '');
    const value = encodeURIComponent(p.value || '');
    return `${key}=${value}`;
}).join("&");

// —— 6. Payload Hash计算 ——
let payloadHash;
if (pm.request.body && pm.request.body.mode === 'raw' && pm.request.body.raw) {
    // raw模式，计算实际body的SHA256
    payloadHash = CryptoJS.SHA256(pm.request.body.raw).toString(CryptoJS.enc.Hex);
} else if (['PUT', 'POST'].includes(method) && pm.request.body &&
           ['formdata', 'file'].includes(pm.request.body.mode)) {
    // 文件上传或formdata，使用UNSIGNED-PAYLOAD
    payloadHash = 'UNSIGNED-PAYLOAD';
} else {
    // GET/HEAD或无body情况
    payloadHash = CryptoJS.SHA256("").toString(CryptoJS.enc.Hex);
}

// —— 7. 设置必要的Headers（优化版）——
pm.request.headers.upsert({ key: "x-tos-date", value: amzDate });
pm.request.headers.upsert({ key: "x-tos-content-sha256", value: payloadHash });
pm.request.headers.upsert({ key: "host", value: host });

// —— 8. Headers处理优化（参考官方SDK的getNeedSignedHeaders）——
function getNeedSignedHeaders(headers) {
    const needSignHeaders = [];
    headers.forEach(header => {
        if (header.disabled) return;

        const key = header.key.toLowerCase();
        // 必须包含的headers：host和所有x-tos-开头的headers
        if (key === 'host' || key.startsWith('x-tos-')) {
            if (header.value != null) {
                needSignHeaders.push(header);
            }
        }
    });
    return needSignHeaders.sort((a, b) =>
        a.key.toLowerCase().localeCompare(b.key.toLowerCase())
    );
}

// 获取需要签名的headers
const headersToSign = getNeedSignedHeaders(pm.request.headers.all());

// —— 9. Canonical Headers构建 ——
function canonicalHeaderValues(value) {
    // 标准化header值：压缩多个空格为单个空格，去除首尾空格
    return value.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
}

const canonicalHeaders = headersToSign
    .map(h => `${h.key.toLowerCase()}:${canonicalHeaderValues(h.value)}\n`)
    .join("");

const signedHeaders = headersToSign
    .map(h => h.key.toLowerCase())
    .join(";");

// —— 10. 构造Canonical Request ——
const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
].join("\n");

// —— 11. 构造String to Sign ——
const algorithm = "TOS4-HMAC-SHA256";
const credentialScope = `${dateStamp}/${region}/${service}/request`;
const hashCR = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    hashCR
].join("\n");

// —— 12. 派生签名密钥（与官方SDK相同的四步派生）——
const kDate = CryptoJS.HmacSHA256(dateStamp, secretKey);
const kRegion = CryptoJS.HmacSHA256(region, kDate);
const kService = CryptoJS.HmacSHA256(service, kRegion);
const kSigning = CryptoJS.HmacSHA256("request", kService);

// —— 13. 计算最终签名 ——
const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);

// —— 14. 构造并设置Authorization Header ——
const authHeader =
    `${algorithm} ` +
    `Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, ` +
    `Signature=${signature}`;

pm.request.headers.upsert({ key: "Authorization", value: authHeader });

// —— 15. 调试日志（详细版）——
console.log("=== TOS Signature Debug Info ===");
console.log("▶ Method:", method);
console.log("▶ Host:", host);
console.log("▶ Canonical URI:", canonicalUri);
console.log("▶ Canonical Query String:", canonicalQueryString);
console.log("▶ Signed Headers:", signedHeaders);
console.log("▶ Payload Hash:", payloadHash);
console.log("▶ Canonical Request:\n", canonicalRequest);
console.log("▶ String to Sign:\n", stringToSign);
console.log("▶ Signing Key (hex):", kSigning.toString(CryptoJS.enc.Hex));
console.log("▶ Signature:", signature);
console.log("▶ Authorization Header:", authHeader);
console.log("=== End Debug Info ===");

// 特别注意
// 签名脚本自动注入的参数，如果在 header 中显示声明，但处于非勾选状态，postman 会认为参数被**手动强制**置为 null，导致请求失败。如非特别构造特殊请求，请勿手动在 header 中包含这些参数。