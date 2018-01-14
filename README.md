- 主要方法
- zepto.qsa可以看作是document.querySelectAll的一个优化方法,最终返回一个数组(Array),然后在zepto.Z方法在将该数组的原型改写(改写之后非Array)

## 主要成员
### $函数
用于调用z.init进行css selector，最终生产一个z对象

### $.fn对象
作为Z构造函数的原型(其实为什么不创建个对象当作Z构造函数的原型，而挂在$上？？)

### 挂在$上的工具函数
即暴露给全局使用的工具函数

````
    $.extend = function (target) {
        var deep,
            args = slice.call(arguments, 1);

        if (typeof target === 'boolean') {
            deep = target;
            target = args.shift();
        }

        args.forEach(function (arg) {
            extend(target, arg, deep);
        });

        return target;
    };

    $.trim = function (str) {
        return str == null ? "" : String.prototype.trim.call(str);
    };
    
    $.type = type;
    $.isArray = isArray;
    $.isPlainObject = isPlainObject;
````

### zepto对象
疑问：为什么要设计zepto对象，其实zepto对象里的方法完全可以写成私有函数。zepto对象里的方法比较少，就下面几个

![](https://ws1.sinaimg.cn/large/006tNc79gy1fngjau4ww1j308m04uq34.jpg)


### Z构造函数
一个类数组

````
function Z(dom, selector) {
    var i, len = dom ? dom.length : 0
    for (i = 0; i < len; i++) this[i] = dom[i]
    this.length = len
    this.selector = selector || ''
}
````

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

#### 私有函数

````
    function isObject(obj) {
        return type(obj) == "object";
    }

    function isFunction(value) {
        return type(value) == "function";
    }

	function .....
````

	
			
#### 赋值给全局变量的函数
即开头顶部声明的函数，如

````
emptyArray = [],
concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
````

#### $.fn对象里的函数

#### 挂在$函数上的函数

## 已读
  - compact 删除数组中的 null 和 undefined
  - likeArray 类数组判断
  - uniq 数组去重
  - flatten 数组扁平化






  
 ![](https://ws1.sinaimg.cn/large/006tKfTcgy1fne4ezb09yj31kw11pafx.jpg)
 