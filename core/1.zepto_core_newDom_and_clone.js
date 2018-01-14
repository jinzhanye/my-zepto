var Zepto = (function () {
    //TODO 函数开关声名全部所有要用到的变量

    var undefined,//后面下面判断undefined使用
        key, $,
        emptyArray = [],
        slice = emptyArray.slice,
        zepto = {},

        // 取出html代码中第一个html标签（或注释），如取出 <p>123</p><h1>345</h1> 中的 <p>
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,

        // 匹配 <img /> <p></p>  不匹配 <img src=""/> <p>123</p>
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,

        table = document.createElement('table'),
        tableRow = document.createElement('tr'),

        // 指定特殊元素的 容器
        containers = {
            'tr': document.createElement('tbody'),
            'tbody': table,
            'thead': table,
            'tfoot': table,
            'td': tableRow,
            'th': tableRow,
            // 除了上面指定的，其他所有元素的容器都是 div
            '*': document.createElement('div')
        },

        class2type = {},
        //TODO 什么决定toString输出的结果
        toString = class2type.toString,
        isArray = Array.isArray ||
            function (object) {
                debugger;
                return object instanceof Array
            };

    function type(obj) {
        return obj == null ?
            String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    function isWindow(obj) {
        //TODO 为什么对象比较用==而不是===??
        return obj != null && obj == obj.window;
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    // 判断是否是最基本的object：Object.getPrototypeOf(obj) == Object.prototype
    function isPlainObject(obj) {
        //TODO Object.getPrototypeOf 与 obj.__proto__均可取得对象原型，
        // obj.__proto__以前是非标准的，在ES6已经被纳入标准，MDN建议使用obj.__proto__，不建议使用Object.getPrototypeOf
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    function likeArray(obj) {
        var length = !!obj && 'length' in obj && obj.length,
            type = $.type(obj)

        return 'function' != type && !isWindow(obj) && (
            'array' == type || length === 0 ||
            (typeof length == 'number' && length > 0 && (length - 1) in obj)
        )
    }

    /**
     * $.extend 方法可以用来扩展目标对象的属性。目标对象的同名属性会被源对象的属性覆盖。
     * @param {{}} target
     * @param {{}} source
     * @param {Boolean} deep
     */
    function extend(target, source, deep) {
        // key最顶部已经定义
        for (key in source) {
            // source[key] 必须是数组或者对象，才有必要深度递归（否则没必要）
            if (deep && (isPlainObject(source[key])) || isArray(source[key])) {

                // source[key] 是对象，而 target[key] 不是对象
                // 则 target[key] = {} 初始化一下，否则递归会出错的
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }

                // source[key] 是数组，而 target[key] 不是数组
                // 则 target[key] = [] 初始化一下，否则递归会出错的
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }

                // 执行递归
                extend(target[key], source[key], deep);

            } else if (source[key] !== undefined) target[key] = source[key];
        }
    }

    //将dom原型修改为$.fn
    zepto.Z = function (dom, selector) {
        return new Z(dom, selector)
    };

    // zepto.isZ = function (object) {
    //     return object instanceof zepto
    // };

    function Z(dom, selector) {
        //构造一个对象数组
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) this[i] = dom[i]
        this.length = len
        this.selector = selector || ''
    }


    /**
     *  zepto最核心方法，$('xxx')就是调用这个方法来执行的
     * @param selector
     * @param context
     * @returns {*}
     */
    zepto.init = function (selector, context) {
        var dom;
        //未传参，返回空Zepto对象
        if (!selector) {
            return zepto.Z();
        } else if (typeof selector == 'string') {
            selector = selector.trim();
            //如果是“<>”,基本的html代码时
            if (selector[0] == '<' && fragmentRE.test(selector)) {
                //调用片段生成dom
                // 第一，RegExp.$1取出来的就是第一个标签名称，即正则中 (\w+|!) 对应的内容
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null;//@1
            }
        }

        return zepto.Z(dom, selector)
    };


    /**
     * [fragment 内部函数 HTML 转换成 DOM]
     * @param  {[String]} html       [html片段]
     * @param  {[String]} name       [容器标签名]
     * @param  {[Object]} properties [附加的属性对象]
     * @return {[*]}
     */
    zepto.fragment = function (html, name, properties) {
        var dom, nodes, container;
        if (singleTagRE.test(html)) {
            dom = $(document.createElement(RegExp.$1));//@2
        }
        if (!dom) {
            //修正自闭合标签<input/>转换为<input></input>
            if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>");
            if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
            //设置容器名，如果不是tr,tbody,thead,tfoot,td,th，则容器名为div
            if (!(name in containers)) name = "*";
            container = containers[name]; //创建容器
            container.innerHTML = '' + html; //生成DOM
            //取容器的子节点
            dom = $.each(slice.call(container.childNodes), function () {
                container.removeChild(this);
            });
            //TODO 第三个参数properties带有属性
        }
        return dom;
    };

    $ = function (selector, context) {
        return zepto.init(selector, context);
    };


    //传参形式
    // (targetObj, srcObj1, srcObj2, srcObj1...)
    // 或者
    // (true, targetObj, srcObj1, srcObj2, srcObj1...)
    // 有没有发现很有多态的味道，函数名相同，但不同的参数调用可以产生不同的效果
    $.extend = function (target) {
        var deep,
            args = slice.call(arguments, 1);

        if(typeof target === 'boolean'){
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

    // 遍历 elements 所有元素（数组、对象数组、对象），执行 callback 方法，最终还是返回 elements
    // 注意1：callback.call(elements[i], i, elements[i]) 函数执行的环境和参数
    // 注意2：=== false) return elements 一旦有函数返回 false，即跳出循环，类似 break
    // 注意3：无论哪种情况，最终返回的还是 elements
    $.each = function (elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            for (i = 0; i < elements.length; i++) {
                if (callback.call(elements[i], i, elements[i]) === false) return elements;
            }
        } else {
            for (key in elements) {
                if (callback.call(elements[key], key, elements[key]) === false) return elements;
            }
        }
        return elements;
    };


    //注入所有对象类型到class2type对象
    $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
        class2type[`[object ${name}]`] = name.toLowerCase();
    });

    // console.log(class2type);
    /*
        最后展开如下
        class2type = {
            "[object Boolean]": "boolean",
            "[object Number]": "number"
            ...
        }

    */
    $.fn = {
        constructor: zepto.Z,
        length: 0
    };

    zepto.Z.prototype = Z.prototype = $.fn;

    return $;
})();

window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);