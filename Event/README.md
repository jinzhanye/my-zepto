 一个事件的触发会经历三个阶段:捕获阶段+目标阶段+冒泡阶段，有了捕获和冒泡才能实现事件代理。
 但IE 中事件模型没有捕获只有冒泡，但focus/blur不支持冒泡，所以IE是无法使用focus的，只能用focusin代替
 
 - mouseover进入子绑定元或绑定元素的子元素都会触发
 ````
    function addColor() {
        this.style.background="red";
    }
    var form = document.forms['form'];
    //还有注意的是DOM0中onfocus这种绑定方式是在冒泡阶段处理的，所以也是不可取的，只能用addEventListener
    if (form.addEventListener) { // 非 IE 浏览器
        form.addEventListener('focus', addColor, true);
    }else{  // IE
        form.onfocusin = addColor
    }
 ````
- focus、blur并不支持事件冒泡。
但focusin、focusout支持冒泡，然而FF并不支持focusin、focusout，所以只要解决兼容性问题就可以用focusin、focusout代替focus、blur
- mouseenter 和 mouseleave 也不支持事件的冒泡
- mouseover 和 mouseout 支持事件冒泡
- 在鼠标事件的 event 对象中，有一个 relatedTarget 的属性
   - mouseover 的 relatedTarget 指向的是移到目标节点上时所离开的节点（ exited from ）
   - mouseout 的 relatedTarget 所指向的是离开所在的节点后所进入的节点（ entered to ）
   
   
   
>注意: 对于事件目标上的事件监听器来说，事件会处于“目标阶段”，而不是冒泡阶段或者捕获阶段。在目标阶段的事件会触发该元素（即事件目标）上的所有监听器，而不在乎这个监听器到底在注册时useCapture 参数值是true还是false。


event.cancelable，event.defaultPrevented
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


可以在捕获阶段实现事件委托？？


### 事件触发发生的事情
触发handler.proxy函数，handler.proxy函数对事件对象做了一些兼容处理，再调用callback函数，
callback函数可能是委派函数，可能是用户传函数。
委派函数对事件对象创建代理对象，再调用用户传函数。

### 事件委派

````
    //原始的委派方式:绑定对象只能作为目标对象的委派者,
    //这样做的缺点是如果li里嵌有其他元素，当用户点击了Li的子元素时，handler不会处理
    Array.form(document.getElementsByClassName('list')).forEach(function (element) {
        element.addEventListener('click',function (event) {
            if(event.target.tagName === 'li'){
                console.log(event)
            }
        })
    })

    //zepto思想实现委派：以绑定对象为起点向下寻找符合selector的节点作为目标对象的委派者,完美实现委派
    Array.form(document.getElementsByClassName('list')).forEach(function (element) {
        element.addEventListener('click',function (event) {
            var target = event.target,
               child = event.currentTarget.getElementsByClassName('li')
            if(child.contains(target)){
                //拷贝event,添加currentTarget与liveFired
                console.log(event)
            }
        })
    })
````
zepto事件绑定只有冒泡阶段没有捕获阶段？