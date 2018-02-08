#Zepto与AJAX

url时间戳清浏览器缓存法

````
与GET响应有关
因为GET通过url传参
            // Whether the browser should be allowed to cache GET responses
            cache:true
````

window.location.protocol不准确？？

````
                //protocol 为协议，匹配一个或多个以字母、数字或者 - 开头，并且后面为 :// 的字符串。优先从配置的 url 中获取，如果没有配置 url，则取 window.location.protocol。            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
````

MIME type/subtype */* 

Multipurpose Internet Mail Extensions type
多用途Internet邮件扩展

浏览器通常使用MIME类型（而不是文件扩展名）来确定如何处理文档；因此服务器设置正确以将正确的MIME类型附加到响应对象的头部是非常重要的。

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fo8tdsyzqhj30tt0bqgod.jpg)

````
                        // 如果数据为 arraybuffer 或 blob 对象时，即为二进制数据时，result 从 response 中直接取得。
                        // 否则，用 responseText 获取数据，然后再对数据尝试解释。
                        if (xhr.responseType == 'arraybuffer' || xhr.responseType == 'blob')
                            result = xhr.response
                        else{
                            result = xhr.responseText
````


statusText是干嘛的？response与responseText

### zepto 针对 ajax 的发送过程，定义了以下几个事件，正常情况下的触发顺序如下：
1. ajaxstart : XMLHttpRequest 实例化前触发
2. ajaxBeforeSend： 发送 ajax 请求前触发，返回false可终ajax请求
3. ajaxSend : ajaxBeforeSend之后，发送 ajax 请求之前触发
4. ajaxSuccess / ajaxError : 请求成功/失败时触发
5. ajaxComplete： 请求完成（无论成功还是失败）时触发
6. ajaxStop: 请求完成后触发，这个事件在 ajaxComplete 后触发。

        // 原生事件
        // req.addEventListener("progress", updateProgress, false);
        // req.addEventListener("load", transferComplete, false);
        // req.addEventListener("error", transferFailed, false);
        // req.addEventListener("abort", transferCanceled, false);
        // ontimeout事件绑定 xhr.timeout 设置超时时间
    
    　　xhr.timeout = 3000;
    
    上面的语句，将最长等待时间设为3000毫秒。过了这个时限，就自动停止HTTP请求。与之配套的还有一个timeout事件，用来指定回调函数。
    
    　　xhr.ontimeout = function(event){
    
    　　　　alert('请求超时！');
    
    　　}
    
           调用了xhr.send() xhr.loadstart
           xhr.loadend
(1,eval)windows作用域？

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fo8189lre2j30wh08m0ub.jpg)