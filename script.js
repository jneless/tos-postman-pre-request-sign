// —— 1. 基础变量 —— 
const accessKey = pm.environment.get("accessKey");
const secretKey = pm.environment.get("secretKey");
const region    = pm.environment.get("region");
const service   = pm.environment.get("service");  // 一般填 "tos"

// —— 2. 时间戳 —— 
const amzDate   = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
const dateStamp = amzDate.substr(0, 8);

// —— 3. 方法 & URL 解析 —— 
const method = pm.request.method.toUpperCase();      // GET / POST / HEAD 等
// host 动态取自 URL
const host   = pm.request.url.getHost();
// path 也动态取
const canonicalUri = pm.request.url.getPath() || "/";

// 收集所有未禁用的 query 参数
const params = pm.request.url.query.all().filter(p => !p.disabled);
// 按 key 排序
params.sort((a, b) => a.key.localeCompare(b.key));
// 重新拼接并 encodeURIComponent

const canonicalQueryString = params
  .map(p => {
  // 如果 p.value 是 undefined 或 null，就用空字符串
  const v = (p.value == null) ? "" : p.value;
  return `${encodeURIComponent(p.key)}=${encodeURIComponent(v)}`;
}).join("&")

// —— 4. 计算 payloadHash —— 
// GET/HEAD 空体：SHA256("")；如有 body，可按之前示例动态处理
const payloadHash = CryptoJS.SHA256("").toString(CryptoJS.enc.Hex);

// —— 5. 插入签名前必要的 Header —— 
pm.request.headers.upsert({ key: "x-tos-date",           value: amzDate });
pm.request.headers.upsert({ key: "x-tos-content-sha256", value: payloadHash });
pm.request.headers.upsert({ key: "host",                 value: host });  // 避免有时没自动加

// —— 6. 构造 Canonical Request —— 
const canonicalHeaders =
  `host:${host}\n` +
  `x-tos-content-sha256:${payloadHash}\n` +
  `x-tos-date:${amzDate}\n`;
const signedHeaders = "host;x-tos-content-sha256;x-tos-date";

const canonicalRequest = [
  method,
  canonicalUri,
  canonicalQueryString,
  canonicalHeaders,
  signedHeaders,
  payloadHash
].join("\n");

// —— 7. 构造 StringToSign —— 
const algorithm       = "TOS4-HMAC-SHA256";
const credentialScope = `${dateStamp}/${region}/${service}/request`;
const hashCR          = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
const stringToSign    = [
  algorithm,
  amzDate,
  credentialScope,
  hashCR
].join("\n");

// —— 8. 派生签名密钥 & 计算签名 —— 
const kDate    = CryptoJS.HmacSHA256(dateStamp,     secretKey);
const kRegion  = CryptoJS.HmacSHA256(region,        kDate);
const kService = CryptoJS.HmacSHA256(service,       kRegion);
const kSigning = CryptoJS.HmacSHA256("request",     kService);

const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);

// —— 9. 注入 Authorization —— 
const authHeader = 
  `${algorithm} ` +
  `Credential=${accessKey}/${credentialScope}, ` +
  `SignedHeaders=${signedHeaders}, ` +
  `Signature=${signature}`;
pm.request.headers.upsert({ key: "Authorization", value: authHeader });

// —— 10. 调试日志 —— 
console.log("▶ method:", method);
console.log("▶ host:", host);
console.log("▶ canonicalUri:", canonicalUri);
console.log("▶ canonicalQueryString:", canonicalQueryString);
console.log("▶ canonicalRequest:\n", canonicalRequest);
console.log("▶ stringToSign:\n", stringToSign);
console.log("▶ kSigning (hex):", kSigning.toString(CryptoJS.enc.Hex));
console.log("▶ Authorization:", authHeader);
