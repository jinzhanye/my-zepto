#Zepto与AJAX

url时间戳清浏览器缓存法

````
与GET响应有关？
            // Whether the browser should be allowed to cache GET responses
            cache:true
````

IIS returns Javascript as "application/x-javascript"??

window.location.protocol不准确？？

````
                //protocol 为协议，匹配一个或多个以字母、数字或者 - 开头，并且后面为 :// 的字符串。优先从配置的 url 中获取，如果没有配置 url，则取 window.location.protocol。            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
````

mime */* 两边类型代表什么？

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
2. ajaxBeforeSend： 发送 ajax 请求前触发
3. ajaxSend : 发送 ajax 请求时触发
4. ajaxSuccess / ajaxError : 请求成功/失败时触发
5. ajaxComplete： 请求完成（无论成功还是失败）时触发
6. ajaxStop: 请求完成后触发，这个事件在 ajaxComplete 后触发。


(1,eval)windows作用域？

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fo8189lre2j30wh08m0ub.jpg)