# Zepto Core

![](https://ws1.sinaimg.cn/large/006tKfTcgy1fne4ezb09yj31kw11pafx.jpg)

## 核心
### $(selector)流程

$(selector)先调用z.init进行各种判断，一般情况下最终调用zepto.qsa(selector)，zepto.qsa为了提高查询节点效率，依次尝试调用以下方法来查询DOM节点。最终z.init返回Z对象

1. Document.getElementById()
2. Document.getElementsByClassName()
3. Document.getElementsByTagName()
4. Document.querySelectorAll()

### Z对象
$(selector) 最终返回一个Z对象，Z对象是一个类数组

Z构造函数

````
/**
 *
 * @param {obj} dom 原生dom节点/节点数组
 * @param selector
 * @constructor
 */
function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
}
````

Z原型

````
zepto.Z.prototype = Z.prototype = $.fn;
````

$.fn

````
$.fn = {
    constructor: zepto.Z,
    length: 0,

    get: function (idx) {
        return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
        //如果是toArray调用get就是
        //return idx === undefined ? slice.call(this)
    },

    toArray: function () {
        return this.get();
    },
    
   ........
   }
````

## 主要成员

### zepto对象
疑问：为什么要设计zepto对象，其实zepto对象里的方法完全可以写成私有函数。zepto对象里的方法比较少，就下面几个

![](https://ws1.sinaimg.cn/large/006tNc79gy1fngjau4ww1j308m04uq34.jpg)

### 常用全局变量

````
//疑问：为什么全局已经定义了key，一些函数内会重新定义key，而有一些函数又没有重新定义key
var undefined, key, document = window.document,

//用于创建原生dom节点
table = document.createElement('table'),
tableRow = document.createElement('tr'),
containers = {
    'tr': document.createElement('tbody'),
    'tbody': table, 'thead': table, 'tfoot': table,
    'td': tableRow, 'th': tableRow,
    '*': document.createElement('div')
},
````

## 函数分类

### 内部使用的私有函数

````
function isObject(obj) {
    return type(obj) == "object";
}

function isFunction(value) {
    return type(value) == "function";
}

function .....
````
			
### 变量保存的函数
即开头顶部声明的函数，如

````
emptyArray = [],
concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
````

### $.fn对象里的函数

#### 挂在$上的工具函数
 
````
$.trim = function (str) {
    return str == null ? "" : String.prototype.trim.call(str);
};
    
$.type = type;
$.isArray = isArray;
$.isPlainObject = isPlainObject;
````

## 其他

### 业务与工具分离
 
例1：工具函数$.extend与内部函数extend
 
````
$.extend = function (target) {
    var deep,
        args = slice.call(arguments, 1);

    if (typeof target === 'boolean') {
        deep = target;
        target = args.shift();
    }

    args.forEach(function (arg) {
        //调用内部extend
        extend(target, arg, deep);
    });

    return target;
};
````    
例2：$.fn.map与工具函数$.map

````    
$.fn.map: function (fn) {
        return $(
        		//工具函数map
            $.map(this, function (element, idx) {
                return fn.call(element, idx, element);
            })
        );
	},
````
 

### default display
对于一个已经隐藏的元素，要将它显示，需要得知它的原来的display属性，Zepto是这样操作的

````
$.fn.show: function () {
    return this.each(function () {
        // 第一步，针对内联样式，将 none 改为空字符串，如 <p id="p2" style="display:none;">p2</p>
        this.style.display == "none" && (this.style.display = '');

        // 第二步，针对css样式，如果是 none 则修改为默认的显示样式
        // show 方法是为了显示对象，而对象隐藏的方式有两种：内联样式 或 css样式
        // 第一步的this.style.display 只能获取内联样式的值（获取属性值）
        // getComputedStyle(this, '').getPropertyValue("display") 可以获取内联、css样式的值（获取 renderTree 的值）
        // 因此，这两步都要做判断
        if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
            this.style.display = defaultDisplay(this.nodeName);
        }
    })
},


//主要思想就是创建一个元素，然后通过getComputedStyle(element, '').getPropertyValue('display')就能获得初始display值了
function defaultDisplay(nodeName) {
    var element, display;
    if (!elementDisplay[nodeName]) {
        element = document.createElement(nodeName);
        document.body.appendChild(element);
        display = getComputedStyle(element, '').getPropertyValue('display');
        element.parentNode.removeChild(element);
        //像 style、 head 和 title 等元素的默认值都是 none 。
        //将 style 和 head 的 display 设置为 block ，并且将 style 的 contenteditable 属性设置为 true ，style 就显示出来了
        display == 'none' && (display = 'block');
        elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
}
````

### funcArg

Zepto中经常有一些函数可以传入一个函数作为参数，funcArg就是用来处理这种情况。如果用户只是传了值，那么直接返回这个值，如果用户传了函数，那么先执行这个函数。具体看attr源码

````
//例如 $(selector).attr
//attr(name, value)   ⇒ self
//attr(name, function(index, oldValue){ ... })   ⇒ self
             
function funcArg(context, arg, idx, payload) {
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
}
````

### [ 'after', 'prepend', 'before', 'append' ]

````
// after    => insertAfter
// prepend  => prependTo
// before   => insertBefore
// append   => insertBefore
// 这几个方法都是将集合中的元素插入到目标元素 target 中，跟 after、before、append 和 prepend 刚好是相反的操作。
````
通过一个方法生成 insertAfter、prependTo、insertBefore、insertBefore 这四个函数，思路是将它们转换成原生的insertBefore来操作。
原生DOM API是没有 insertAfter 方法的。Zepto正是用 insertBefore 方法和 nextSibling 来模拟它。
          


### siblings

````
/**
 *  获取所有集合中所有元素的兄弟节点。
 * @param selector
 * @returns {Array.<*>}
 */
siblings: function (selector) {
    return filtered(this.map(function (i, el) {
        //获取兄弟节点的思路也很简单，对当前集合遍历，找到当前元素的父元素el.parentNode，调用 children 方法，找出父元素的子元素，将子元素中与当前元素不相等的元素过滤出来即是其兄弟元素了。
        // 注：原生js没用直接获取sibling的方法，只有previousSibling,nextSibling
        return filter.call(children(el.parentNode), function (child) {
            return child !== el
        })
        //最后调用 filtered 来过滤出匹配 selector 的兄弟元素。
    }), selector)
},
````
### maybeAddPx

````
/**
* 传入一个 css 的 name 和 value，判断这个 value 是否需要增加 'px'
* @param name
* @param value
*/
function maybeAddPx(name, value) {
return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value;
// !cssNumber[dasherize(name)] 判断转换出来的 css name 是否再这个数组之外
// 如果 value 是数字，并且 name 不在 cssNumber 数组之内，就需要加 'px'，否则不需要
// 例如 'width'、'font-size' 就需要加 'px'， 'font-weight' 就不需要加

// 前文定义----------------------
// cssNumber = {
//   'column-count': 1,
//   'columns': 1,
//   'font-weight': 1,
//   'line-height': 1,
//   'opacity': 1,
//   'z-index': 1,
//   'zoom': 1
// },
}
````
### prop

propMap用于prop与attribute映射


````
propMap = {
    'tabindex': 'tabIndex',
    'readonly': 'readOnly',
    //注意for 与 class 有点特殊
    'for': 'htmlFor',
    'class': 'className',
    'maxlength': 'maxLength',
    'cellspacing': 'cellSpacing',
    'cellpadding': 'cellPadding',
    'rowspan': 'rowSpan',
    'colspan': 'colSpan',
    'usemap': 'useMap',
    'frameborder': 'frameBorder',
    'contenteditable': 'contentEditable'
},
````
