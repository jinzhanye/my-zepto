1. 创建一个事件对象 document.createEvent(event)
2. 初始化事件对象 event.initEvent(type, bubbles, true)
3. 分发事件 dom.dispatchEvent(event)

新式利用CustomEvent自定义事件
http://javascript.ruanyifeng.com/dom/event.html

### 事件默认行为
- a标签点击事件默认跳转
- checkbox点击事件默认行为将样式改为有勾
https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault

### eventPhrase 
- 1 捕获
- 2 目标
- 3 冒泡



## event.cancelable，event.defaultPrevented
以下属性与事件的默认行为有关。

（1）cancelable

cancelable属性返回一个布尔值，表示事件是否可以取消。该属性为只读属性，只能在新建事件时改变。除非显式声明，Event构造函数生成的事件，默认是不可以取消的。
````
var bool = event.cancelable;
````
如果要取消某个事件，需要在这个事件上面调用preventDefault方法，这会阻止浏览器对某种事件部署的默认行为。

（2）defaultPrevented

defaultPrevented属性返回一个布尔值，表示该事件是否调用过preventDefault方法。
````
if (e.defaultPrevented) {
  // ...
}
````

event.preventDefault()
preventDefault方法取消浏览器对当前事件的默认行为，比如点击链接后，浏览器跳转到指定页面，或者按一下空格键，页面向下滚动一段距离。该方法生效的前提是，事件对象的cancelable属性为true，如果为false，则调用该方法没有任何效果。