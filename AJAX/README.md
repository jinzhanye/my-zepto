#Zepto与AJAX

## RequestHeader

### MIME 
MIME全称Multipurpose Internet Mail Extensions type(多用途Internet邮件扩展)，由`type/subtype `组成

浏览器通常使用MIME类型（而不是文件扩展名）来确定如何处理文档；因此服务器设置正确以将正确的MIME类型附加到响应对象的头部是非常重要的。

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fo8tdsyzqhj30tt0bqgod.jpg)

在浏览器中可以用`XMLHttpRequest.setHeader('Accept',MIME)`来指定服务器返回的数据类型，还可以用`XMLHttpRequest.overrideMimeType`来重写 response 的 content-type

### 服务器识别AJAX请求
如果非跨域请求，Zepto调用xhr.setHeader('X-Requested-With','XMLHttpRequest')，服务器可以利用这个字段识别，但为什么只在非跨域请求添加呢？

## 事件
### zepto 针对 ajax 的发送过程，定义了以下几个事件，正常情况下的触发顺序如下：
1. ajaxstart : XMLHttpRequest 实例化前触发
2. ajaxBeforeSend： 发送 ajax 请求前触发，返回false可终ajax请求
3. ajaxSend : ajaxBeforeSend之后，发送 ajax 请求之前触发
4. ajaxSuccess / ajaxError : 请求成功/失败时触发
5. ajaxComplete： 请求完成（无论成功还是失败）时触发
6. ajaxStop: 请求完成后触发，这个事件在 ajaxComplete 后触发。

只所以这样做是因为并不是所有浏览器都支持原生事件，通过自定义事件可以提高兼容性。

### 异常处理

Zepto统一触发自定义的ajaxError事件处理异常，用type字段来区分不同类型的错误

````
//type可选值 "timeout", "error", "abort", "parsererror"
function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    //回调错误处理函数
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    //触发全局错误事件
    triggerGlobal(settings, context, 'ajaxError', [xhr, type, error])
    //触发ajaxComplete事件
    ajaxComplete(type, xhr, settings)
}
````


### 超时处理
原生JS通过`XMLHttpRequest.timeout`设置超时时间，绑定`timeout事件`处理请求超时。某些浏览器是不支持超时处理的，Zepto通过设置一个定时任务来做超时处理，如果请求成功则取消这个超时任务，以此来提高浏览器兼容性。

````
if (settings.timeout > 0) abortTimeout = setTimeout(function () {
	//abort后浏览器会将readystatechange设置成4，但绑定的onreadystatechange处理函数没必要对这种情况做处理，所以直接将onreadystatechange设为空函数
    xhr.onreadystatechange = empty
    xhr.abort()
    //触发type为timeout的错误事件
    ajaxError(null, 'timeout', xhr, settings, deferred)
}, settings.timeout)
````

## 其他
### 清除GET请求缓存
Zepto通过url后加`_ = 时间戳`，清除浏览器GET请求缓存。因为浏览器缓存是基于url进行缓存的，如果页面允许缓存，则在一定时间内（缓存时效时间前）再次访问相同的URL，浏览器就不会再次发送请求到服务器端，而是直接从缓存中获取指定资源。

非常好的一篇文章，里面详细介绍了原生XHR：[你真的会使用XMLHttpRequest吗?](https://segmentfault.com/a/1190000004322487)  