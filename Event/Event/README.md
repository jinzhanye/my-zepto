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
