# Volc-TOS pre-request script for Postman
# 火山引擎对象存储预签名postman工具

* 火山引擎 TOS 的 postman 签名工具，可以使用该脚本在 postman 中构造请求，从而访问 TOS 中存储的私有文件
* It is possible to allow private files to be accessed through AK/SK, so as to use various APIs of the TOS protocol.

## 步骤
1. 设置一个postman 的 【env】
    1. service
        * 默认 `tos`
        * 如果是 tos vectors，则为 `tosvectors`
    2. region
        * eg, `cn-beijing`, `cn-shanghai`
    3. accessKey
    4. secretKey
2. 创建一个请求，并且在右上角选择对应的 【env】
3. 在 [scripts] - [pre-sign] 中粘贴签名脚本

## 参考
* tos vectors public postman
* https://www.postman.com/telecoms-explorer-65390521/volc-tos-vectors/collection/34501207-3a0098ab-d18d-46ca-ac92-2fa3e219d767/?action=share&creator=34501207&active-environment=34501207-51e8760c-870c-4114-adda-7ae60d4b3c34


## 提示
* 发送 POST 请求的时候， 比如 `/?x-tos-process=aigc`, Postman选择 [body]-[raw]-[json] 来传入 json body
* 上传文件的时候，比如 `PutObject`，Postman选择 [body]-[binary]
* vectors 相关 api 全部使用 POST，所以全部body参数通过 [body]-[raw]-[json] 传递

## 注意
1. 本脚本仅适用于火山引擎 TOS 对象存储
2. TOS 签名与火山引擎默认签名方式不同

-----

## Image demo

* create and setup an Env
![image](./doc/img/1.png)


* create a request and binding the Env
* paste script.js into  [Script] - [Pre-request]
![image](./doc/img/2.png)


-----

## Test

| vectors | Process |
| --- | --- |
| ListVectorBuckets | ✅ |
| GetVectorBucket | ✅ |
| CreateVectorBucket | ✅ |
| DeleteVectorBucket | ✅ |
| GetVectorBucket | ✅ |
| ListVectorBuckets | ✅ |
| PutVectorBucketPolicy | ✅ |
| GetVectorBucketPolicy | ✅ |
| DeleteVectorBucketPolicy | ✅ |
| CreateIndex | ✅ |
| Deletelndex | ✅ |
| Getindex | ✅ |
| Listindexes | ✅ |
| PutVectors | ✅ |
| GetVectors | ✅ |
| QueryVectors | ✅ |
| DeleteVectors | ✅ |
| ListVectors | ✅ |

| Bucket | Process |
| --- | --- |
| CreateBucket | x |
| DeleteBucket | x |
| HeadBucket | ✅ |
| ListBuckets | ✅ |
| ListObjects | ✅ |
| ListObjectsV2 | ✅ |
| ListObjectVersions | x |
| PutBucketStorageClass | x |
| GetBucketLocation | x |
| GetBucketlnfo | ✅ |
| PutBucketLifecycle | x |
| GetBucketLifecycle | ✅ |
| DeleteBucketLifecycle | x |
| PutBucketAccessMonitor | x |
| GetBucketAccessMonitor | x |
| PutBucketACL | x |
| GetBucketACL | x |
| PutBucketCORS | x |
| GetBucketCORS | x |
| DeleteBucketCORS | x |
| PutBucketlnventory | x |
| GetBucketInventory | x |
| ListBucketInventory | x |
| DeleteBucketInventory | x |
| PutBucketPolicy | x |
| GetBucketPolicy | x |
| DeleteBucketPolicy | x |
| PutBucketMirrorBack | x |
| GetBucketMirrorBack | ✅ |
| DeleteBucketMirrorBack | x |
| PutBucketReplication | x |
| GetBucketReplication | x |
| DeleteBucketReplication | x |
| PutBucketVersioning | x |
| GetBucketVersioning | x |
| PutBucketWebsite | x |
| GetBucketWebsite | x |
| DeleteBucketWebsite | x |
| PutBucketNotification | x |
| GetBucketNotification | x |
| PutBucketNotificationV2 | x |
| GetBucketNotificationV2 | x |
| PutBucketCustom Domain | x |
| GetBucketCustom Domain | x |
| DeleteBucketCustom Domain | x |
| PutBucketEncryption | x |
| GetBucketEncryption | x |
| DeleteBucketEncryption | x |
| PutBucketTagging | x |
| GetBucketTagging | x |
| DeleteBucketTagging | x |
| PutBucketRename | x |
| GetBucketRename | x |
| DeleteBucketRename | x |
| PutBucket TransferAccelerat | x |
| GetBucket TransferAccelerat | x |
| Pm3u8 | x |
| PutBucketLogging | x |
| GetBucketLogging | x |
| TextTolmage | ✅ |
| ImageTolmage | ✅ |
| PutBucketRequestPayment | x |
| GetBucketRequestPayment | x |

| Objects | Process |
| --- | --- |
| CopyObject | x |
| DeleteObject | ✅ |
| DeleteMultiObjects | x |
| GetObject | ✅ |
| HeadObject | ✅ |
| AppendObject | x |
| PutObject | ✅ |
| PostObject | x |
| SetObjectMeta | ✅ |
| RestoreObject | x |
| RenameObject | x |
| PutObjectACL | x |
| GetObjectACL | x |
| PutObjectTagging | x |
| GetObject Tagging | x |
| Delete Object Tagging | x |
| FetchObject | x |
| PutFetchTask | x |
| GetFetchTask | x |
| PutSymlink | x |
| GetSymlink | x |


| Part | Process |
| --- | --- |
| Create MultipartUpload | x |
| UploadPart | x |
| Complete MultipartUpload | x |
| AbortMultipartUpload | x |
| UploadPartCopy | x |
| ListMultipartUploads | x |
| ListParts | x |

| Data Process | api |
| --- | --- |
| ?job_type=VideoSnapshots&media_jobs | ✅ |
| ?x-tos-process=image/info | ✅ |
| ?x-tos-process=image/crop | ✅ |
| ?x-tos-process=image/resize | ✅ |
| ?x-tos-process=video/info | ✅ |
| ?x-tos-process=video/snapshot | ✅ |
| ?x-tos-async-process (x-tos-async-process=audio/convert) | ✅ |


| qiniu | api |
| --- | --- |
| imageView2 | ✅ |
| imageMogr2 | ✅ |

## Appendix
* TOS Sign in Header https://www.volcengine.com/docs/6349/74839
* TOS API https://www.volcengine.com/docs/6349/74837
* Thanks `Sibin Luo` for bug fixing


## 常见 bug 说明
* "There was an error in evaluating the Pre-request Script:TypeError: Cannot read properties of undefined (reading 'sigBytes')"
    * 可能的原因 1 ：TOS 签名方式和 火山引擎默认签名 两者不同！如果出现该问题，通常是因为参考了火山签名方式，AK和SK明文被手动写入header，请手动删除header。将AK/SK通过 env 变量配置。
    * 可能的原因 2 ：没有配置env，或者是 **配置env之后，新建的request默认env是空，没有手动在右上角切换该 env**
