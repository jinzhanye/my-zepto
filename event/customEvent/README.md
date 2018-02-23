## 自定义事件

1. 创建一个事件对象 document.createEvent(event)
2. 初始化事件对象 event.initEvent(type, bubbles, true)
3. 分发事件 dom.dispatchEvent(event)

新式利用CustomEvent自定义事件

### 事件默认行为
- a标签点击事件默认跳转
- checkbox点击事件默认行为将样式改为有勾
- button submit

## event.bubbles，event.eventPhase

### event.bubbles
bubbles属性返回一个布尔值，表示当前事件是否会冒泡。该属性为只读属性，只能在新建事件时改变。Event构造函数生成的事件，默认是不冒泡的。

### event.eventPhase
- 0 事件目前没有发生
- 1 捕获
- 2 目标
- 3 冒泡，只有bubbles属性为true时，这个阶段才可能发生。



## event.cancelable，event.defaultPrevented
以下属性与事件的默认行为有关。

###（1）cancelable

cancelable属性返回一个布尔值，表示事件是否可以取消。该属性为只读属性，只能在新建事件时改变。除非显式声明，Event构造函数生成的事件，默认是不可以取消的。

````
var bool = event.cancelable;
````
如果要取消某个事件，需要在这个事件上面调用preventDefault方法，这会阻止浏览器对某种事件部署的默认行为。

###（2）defaultPrevented

defaultPrevented属性返回一个布尔值，表示该事件是否调用过preventDefault方法。

````
if (e.defaultPrevented) {
  // ...
}
````

