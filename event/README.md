# zepto事件模块总结

![](https://ws3.sinaimg.cn/large/006tKfTcly1fnx8hjkz40j31400mi7wh.jpg)

## 设计思想

### handlers 事件响应函数缓存池 
1缓存池 —— n个元素(元素可以是节点对象，也可以是普通对象) <br>
1个元素 —— n个事件 <br>
1个事件 —— n个响应函数

### handlers 的作用
- off方法调用removeEventListener删除DOM对象事件监听时，需要指定删除的handler
- 为非DOM对象绑定事件与触发事件准备的，DOM对象的事件由addEventListener处理
- 当用户仅仅想执行DOM对象上绑定的handler，而不想触发事件，handlers也帮得上忙(triggerHandler)

![](https://ws4.sinaimg.cn/large/006tKfTcly1fnx80tze0gj31fm0jn0u9.jpg)


## 事件绑定
![](https://ws2.sinaimg.cn/large/006tKfTcly1fnx80tovtlj30yn0jd40r.jpg)

### compatible
调用compatible为event对象添加三个方法，重写三个方法，当某个handler,调用了event的stopXX等三个方法时，实际上stopXX内部先调用isXX立个Flag，然后再调用原来的stopaXX方法。当其他handler取得这个event时只需要判断一下isXXX就知道是否应该进行callback。

### DOM对象用户触发事件，compatible响应情况
- 浏览器触发事件，handler.proxy响应，调用了一次compatible

### 这些函数调用过compatible
- $.Event返回时对创建的事件对象调用了compatible
- trigger对传进来的event对象进行compatible
- triggerHandler调用createProxy创建代理对象，createProxy返回时对事件对象调用compatible
- handler.proxy对传进来的event对象进行compatible，再调用callback

### 以下列举一些compatible被多次调用的情况
#### trigger,this不为DOM对象
- triggerHandler -> $.Event(调用不传source) -> createProxy(调用传source) -> handler.proxy(调用不传source),调用了三次compatible
- trigger -> $.Event(调用不传source) -> triggerHandler -> createProxy(调用传source) -> handler.proxy(调用不传source),调用了三次compatible

虽然调用了三次，实际上只做了两次兼容处理，因为compatible内部会判断如果三个isXX立法已经存在证明已经调用过，就不再做兼容处理

- $.Event 第一次因为没传source，又没有isXX方法，做了兼容处理 
- createProxy 第二次因为传了source，做了兼容处理
- handler.proxy 第三次不做兼容处理


## 事件触发

### 浏览器用户触发事件后
handler.proxy函数响应事件，handler.proxy调用compatible，对event对象做了一些兼容处理，再调用callback函数。callback函数可能是委派函数，可能是用户传函数。对于委派函数的情况，为了防止原事件对象受污染，委派函数为事件对象创建代理对象，将代理对象作为实参调用用户绑定事件时传入的函数。

### trigger与triggerHandler手动触发handler

--- | trigger | triggerHandler
--- | --- | ---
冒泡支持 | 可能支持 | 不支持
处理流程 | 如果对象为DOM对象则调用原生dom.dispatchEvent(event)，否则交给triggerHandler处理  | 仅从handlers中取出对象相应的handler然后执行
处理范围 | 所有对象 | 所有对象

## focus/blur/mouseenter/mouseleave 特殊处理

### focus/blur
见focus/blur文章，此文章还有关于`eventCapture与realEvent`的讲解

### mouseover/mouseenter

--- | mouseover | mouseenter
--- | --- | ---
触发时机 | 进入绑定节点区域或它的子节点都会触发 | 进入绑定节点区域只触发一次，子节点不会重复触发
冒泡支持 | 支持 | 不支持
相反事件 | mouseout | mouseleave

- mouseover 的 relatedTarget 指向的是移到目标节点上时所离开的节点（ exited from ）
- mouseout 的 relatedTarget 所指向的是离开所在的节点后所进入的节点（ entered to ）

在zepto中，如果用户注册的是mouseenter，zepto为了能做到事件委派，会用mouseenter模拟mouseover，参考mouseover/index.html。参考JS高程，mouseover、mouseenter不适合事件委派，何必这么费劲做兼容呢。

> 3级DOM事件规范标准化了不冒泡的focusin和focusout事件来取代冒泡的focus和blur事件，标准化了冒泡的mouseenter和mouseleave事件来取代不冒泡的mouseover和mouseout事件  ——《Javascript权威指南》 p447

## 事件委派

> 最适合采用事件委托技术的事件包括click、mousedown、mouseup、keydown、keyup和keypress。虽然mouseover和mouseout事件也冒泡，但是要适当处理它们并不容易，而且经常需要计算元素的位置。（因为当鼠标从一个元素移到其子元素时，或者当鼠标移出该元素时，都会触发mouse事件） ——<\<Javascript高级编程>>第三版 13.5.1 p404

原始的委派方式:绑定对象只能作为目标对象的委派者,这样做的缺点是如果li里嵌有其他元素，当用户点击了Li的子元素时，handler不会处理

````
    Array.form(document.getElementsByClassName('list')).forEach(function (element) {
        element.addEventListener('click',function (event) {
            if(event.target.tagName === 'li'){
                console.log(event)
            }
        })
    })
````

zepto思想实现委派：以绑定对象为起点向下寻找符合selector的节点作为目标对象的委派者,完美实现委派

````
    Array.form(document.getElementsByClassName('list')).forEach(function (element) {
        element.addEventListener('click',function (event) {
            var target = event.target,
            	  //为child进行委派
               child = event.currentTarget.getElementsByClassName('li')
            if(child.contains(target)){
                //拷贝event,添加currentTarget与liveFired
                console.log(event)
            }
        })
    })
````

## 自定义事件

## 收获
