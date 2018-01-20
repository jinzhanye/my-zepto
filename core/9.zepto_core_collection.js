var Zepto = (function () {
    //TODO 函数开关声名全部所有要用到的变量

    var undefined,//后面下面判断undefined使用
        key, $,
        emptyArray = [],
        classList,
        concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
        document = window.document,
        tempParent = document.createElement('div'),//在zepto.matches方法中用到
        elementDisplay = {}, classCache = {}, zepto = {},
        camelize, uniq,
        cssNumber = {
            'column-count': 1,
            'columns': 1,
            'font-weight': 1,
            'line-height': 1,
            'opacity': 1,
            'z-index': 1,
            'zoom': 1
        },

        // 取出html代码中第一个html标签（或注释），如取出 <p>123</p><h1>345</h1> 中的 <p>
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,

        // 匹配 <img /> <p></p>  不匹配 <img src=""/> <p>123</p>
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
        capitalRE = /([A-Z])/g,
        // body html
        rootNodeRE = /^(?:body|html)$/i,

        // 匹配一个包括（字母、数组、下划线、-）的字符串
        // 这个正则其实是匹配 a-z、A-Z、0-9、下划线、连词符 组合起来的单词，这其实就是单个 id 和 class 的命名规则
        simpleSelectorRE = /^[\w-]*$/,

        table = document.createElement('table'),
        tableRow = document.createElement('tr'),

        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],

        // 属性转换为 camalCase 格式。
        // $.fn.prop 方法用到了
        propMap = {
            'tabindex': 'tabIndex',
            'readonly': 'readOnly',
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
        //TODO 什么决定toString输出的结果?
        toString = class2type.toString,
        // ECMAScript5将Array.isArray()正式引入JavaScript，目的就是准确地检测一个值是否为数组。IE9+、 Firefox 4+、Safari 5+、Opera 10.5+和Chrome都实现了这个方法。但是在IE8之前的版本是不支持的。
        isArray = Array.isArray ||
            function (object) {
                // debugger;
                return object instanceof Array
            };

    /**
     *
     * 判断数据类型
     *
     * @param obj
     * @returns {string}
     *
     * 关键点 Object.prototype.toString
     *
     *　Object.prototype.toString的行为：首先，取得对象的一个内部属性[[Class]]，然后依据这个属性，返回一个类似于"[object Array]"的字符串作为结果
     * (看过ECMA标准的应该都知道，[[]]用来表示语言内部用到的、外部不可直接访问的属性，称为“内部属性”)。
     * 利用这 个方法，再配合call，我们可以取得任何对象的内部属性[[Class]]，然后把类型检测转化为字符串比较，以达到我们的目的
     *
     * 依赖该函数的函数
     *
     *  isObject,isFunction,likeArray
     */
    function type(obj) {
        return obj == null ?
            String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    //TODO  elem.DOCUMENT_NODE 也等于 9 （直接判断是不是9兼容性是最好的）
    function isDocument(obj) {
        //document.nodeType === Node.DOCUMENT_NODE; // true
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }

    function isWindow(obj) {
        //TODO 为什么对象比较用==而不是===??
        return obj != null && obj == obj.window;
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isFunction(value) {
        //TODO typeof value === "function" 也可以？？
        return type(value) == "function";
    }

    /**
     *  判断一个对象是否为普通对象，即除widow以外的对象
     *
     * @param {obj} obj
     * @returns {boolean}
     */
    function isPlainObject(obj) {
        //TODO Object.getPrototypeOf 与 obj.__proto__均可取得对象原型，
        // obj.__proto__以前是非标准的，在ES6已经被纳入标准，MDN建议使用obj.__proto__，不建议使用Object.getPrototypeOf
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    /**
     *
     * in 的用法值得学习
     *
     * @param obj
     * @returns {boolean}
     */
    function likeArray(obj) {
        var length = !!obj && 'length' in obj && obj.length,

            type = $.type(obj);

        return 'function' != type && !isWindow(obj) && (
            'array' == type || length === 0 ||
            (typeof length == 'number' && length > 0 && (length - 1) in obj)
        )
    }

    uniq = function (array) {
        return filter.call(array, function (item, idx) {
            return array.indexOf(item) === idx;
        });
    };

    function compact(array) {
        //TODO 为什么非要call这样写，而不像下面array.filter那样写?
        return filter.call(array, function (item) {
            return item != null
        })

        // return array.filter(function (item) {
        //     return item != null;
        // });
    }

    /**
     *
     * 这个函数是用来返回一个正则表达式，这个正则表达式是用来匹配元素的 class 名的，匹配的是如 className1 className2 className3 这样的字符串。
     *
     * @param name
     * @returns {RegExp}
     */
    function classRE(name) {
        // '(^|\\s)' 匹配的是开头或者空白（包括空格、换行、tab缩进等），然后连接指定的 name ，再紧跟着空白或者结束。
        return name in classCache ?
            classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'));
    }

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

    //$.fn.children会用到这到方法
    // 浏览器也有原生支持元素 children 属性，也要到IE9以上才支持，见文档ParentNode.children
    // 如果检测到浏览器不支持，则降级用 $.map 方法，获取 element 的 childNodes 中 nodeType 为 ELEMENT_NODE 的节点。因为 children 返回的只是元素节点，但是 childNodes 返回的除元素节点外，还包含文本节点、属性等。
    function children(element) {
        return 'children' in element ?
            slice.call(element.children) :
            $.map(element.childNodes, function (node) {
                if (node.nodeType == 1) {
                    return node;
                }
            });
    }

    // 将字符串变成响应的对象或者值，例如源代码的注释：
    // "true"  => true
    // "false" => false
    // "null"  => null
    // "42"    => 42
    // "42.5"  => 42.5
    // "08"    => "08"
    // JSON    => parse if valid
    // String  => self
    /**
     *  deserialize 反序列化
     * @param value
     * @returns {boolean}
     */
    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                        +value + "" == value ? +value :
                            /^[\[\{]/.test(value) ? $.parseJSON(value) :
                                value )

                : value;
        } catch (e) {
            return value;
        }
    }

    function traverseNode(node, fun) {
        fun(node);
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun)
    }

    // 用于 css 的 camalCase 转换，例如 background-color 转换为 backgroundColor
    camelize = function (str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : ''
        })
    };

    /**
     *  将数组扁平化，例如将数组 [1,[2,3],[4,5],6,[7,[89]] 变成 [1,2,3,4,5,6,7,[8,9]]
     *  这个方法只能展开一层，多层嵌套也只能展开一层。
     * @param array
     * @returns {*}
     */
    //TODO $.fn.concat.apply([], array) —— 无论 array 是不是数组，都将返回一个数组，
    // 例如 $.fn.concat.call([], 'abc') 返回的是 ['abc']

    //concat用法： var new_array = old_array.concat(value1[, value2[, ...[, valueN]]])
    function flatten(array) {
        // concat.apply([], [1,2,3,[4,5]]) 相当于 [].concat(1,2,3,[4,5]) => [1,2,3,4,5]
        return array.length > 0 ? $.fn.concat.apply([], array) : array;
    }


    /**
     * 将驼峰式的写法转换成连字符 - 的写法。
     *
     * 例如 lineHeight 转换为 line-height
     *
     * @param str
     * @returns {string}
     */
    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
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

    // $.fn.html,$.fn.attr用到
    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg
    }

    function filtered(nodes, selector) {
        return selector == null ? $(nodes) : $(nodes).filter(selector);
    }

    /**
     *  删除或设置属性
     * @param node 原生节点
     * @param name 属性
     * @param value 属性值
     */
    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    /**
     *
     * 设置/获取 node的className属性
     *
     * @param node
     * @param value
     * @returns {*|string}
     */
    function className(node, value) {
        //不考虑svg，整个函数就做了一件事node.className = value
        //其他代码都是为了兼容svg写的
        var klass = node.className || '',
            svg = klass && klass.baseVal !== undefined;

        //如果节点没有设class属性，返回className为""空串
        if (value === undefined) return svg ? klass.baseVal : klass;
        svg ? (klass.baseVal = value) : (node.className = value);
    }

    //将dom原型修改为$.fn
    zepto.Z = function (dom, selector) {
        return new Z(dom, selector)
    };


    zepto.isZ = function (obj) {
        return obj instanceof zepto.Z;
    };

    /**
     *  检测element的selector是否与传入的selector匹配
     *
     *  与原生方法element.matches功能一样，这里只是做了更多兼容性处理
     *  注意原生方法传参*，返回结果一定是true,element.matches('*')
     *
     * @param {obj} element 原生dom
     * @param {string} selector
     *
     * 依赖此函数的函数
     *  $.fn.is
     *  $.fn.filter
     *
     * return 当使用浏览matches方法时返回true/false
     *        当浏览器不支持 matchesSelector，返回-1表示匹配，0表示不匹配
     */
    zepto.matches = function (element, selector) {
        if (!(selector && element && element.nodeType === 1)) return false;
        //如果当前浏览器按标准实现了element.matches方法，则用标准方法
        var matchesSelector = element.matches ||
            element.webkitMatchesSelector ||
            element.mozMatchesSelector ||
            element.oMatchesSelector ||
            element.matchesSelector
        if (matchesSelector) return matchesSelector.call(element, selector);


        // **********浏览器不支持 matchesSelector
        var match,
            parent = element.parentNode,
            temp = !parent;

        //这样情况，我从来没有遇到过，
        //因为即使是最外层的节点，正常情况，它的parentNode是DocumentBody,
        if (temp) (parent = tempParent).appendChild(element);

        //这里也是一个疑惑点，当匹配上了indexOf会返回0，为什么还要取反变成-1??
        match = ~zepto.qsa(parent, selector).indexOf(element);

        temp && tempParent.removeChild(element);

        return match;
    };

    // 获取一个元素的默认 display 样式值，可能的结果是：inline block inline-block table .... （none 转换为 block）
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

    /**
     *
     * @param {obj} dom 原生dom节点/节点数组
     * @param selector
     * @constructor
     */
    function Z(dom, selector) {
        // debugger;
        var i, len = dom ? dom.length : 0
        for (i = 0; i < len; i++) this[i] = dom[i]
        this.length = len
        this.selector = selector || ''
    }

    /**
     * 在容器内按选择器查找元素
     *
     * @param  element 容器
     * @param  selector 选择器
     * return {Array} 节点数组
     */
    zepto.qsa = function (element, selector) {
        var found,
            maybeID = selector[0] === '#',
            maybeClass = !maybeID && selector[0] == '.',

            nameOnly = maybeID || maybeClass ? selector.slice(1) : selector,

            isSimple = simpleSelectorRE.test(nameOnly);
        // 是否为单选择器，即 .single 的形式，不是 .first .secend 等形式
        return (element.getElementById && isSimple && maybeID) ?
            ((found = element.getElementById(nameOnly)) ?
                    [found] :
                    []
            ) :

            // Node.ELEMENT_NODE = 1; 一个 元素 节点，例如 <p> 和 <div>。
            // Node.DOCUMENT_NODE = 9;一个 Document 节点。
            // Node.DOCUMENT_FRAGMENT_NODE = 11;一个 DocumentFragment 节点
            // 排除不合法的element:如果不为以上合法类型则返回[]
            (element.nodeType !== 1 && element.nodeType !== 9 && element.nodeType !== 11) ?
                [] :
                // 将获取的单个节点或者元素集合，转换为数组
                slice.call(
                    isSimple && !maybeID ?
                        maybeClass ?
                            element.getElementsByClassName(nameOnly) :
                            element.getElementsByTagName(selector)
                        :
                        element.querySelectorAll(selector)
                );
    };

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
            //生成zpeto元素
            //如果是“<>”,基本的html代码时
            if (selector[0] == '<' && fragmentRE.test(selector)) {
                //调用片段生成dom
                // 第一，RegExp.$1取出来的就是第一个标签名称，即正则中 (\w+|!) 对应的内容
                dom = zepto.fragment(selector, RegExp.$1, context), selector = null;//@1
            } else if (context !== undefined) {
                //上下文中查找
                return $(context).find(selector);
            } else {
                //CSS selector
                dom = zepto.qsa(document, selector);
            }
        }
        else if (zepto.isZ(selector)) return selector;
        else {
            if (isArray(selector)) dom = compact(selector);

            //zepto.fragment 这一句会调用到下面isObject判断，if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))
            else if (isObject(selector)) {//原生DOM节点
                dom = [selector], selector = null
            }
        }

        return zepto.Z(dom, selector)
    };


    /**
     * fragment 的作用的是将html片断转换成dom数组形式。
     *
     * <p>hello</p> => dom
     *
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
        }

        if (isPlainObject(properties)) {
            nodes = $(dom);
            $.each(properties, function (key, value) {
                // methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],
                if (methodAttributes.indexOf(key) > -1)
                    nodes[key](value);//注意这里是调用nodes对象key属性方法

                else nodes.attr(key, value);// 否则，通过属性复制
            });
        }
        return dom;
    };

    $ = function (selector, context) {
        return zepto.init(selector, context);
    };


    $.contains = document.documentElement.contains ?//检测浏览器是否支持contains方法
        function (parent, node) {
            return parent !== node && parent.contains(node);
        } :
        function (parent, node) {
            //向上查找匹配父亲
            while (node && (node = node.parentNode))
                if (node === parent) return true;

            return false;
        };

    //传参形式
    // (targetObj, srcObj1, srcObj2, srcObj1...)
    // 或者
    // (true, targetObj, srcObj1, srcObj2, srcObj1...)
    // 有没有发现很有多态的味道，函数名相同，但不同的参数调用可以产生不同的效果
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

    // 遍历 elements 所有元素（数组、对象数组、对象），执行 callback 方法，最终还是返回 elements
    // 注意1：callback.call(elements[i], i, elements[i]) 函数执行的环境和参数
    // 注意2：=== false) return elements 一旦有函数返回 false，即跳出循环，类似 break
    // 注意3：无论哪种情况，最终返回的还是 elements
    $.each = function (elements, callback) {
        var i, key;
        if (likeArray(elements)) {
            //TODO 这里为什么用for遍历，而不用forEach遍历，因为elements有可以是类数组，类数组无forEach方法
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
        最后展开如下9个种对象类型
         class2type = {
            "[object Boolean]": "boolean",
            "[object Number]": "number",
            "[object String]": "string",
            "[object Function]": "function",
            "[object Array]": "array",
            "[object Date]": "date",
            "[object RegExp]": "regexp",
            "[object Object]": "object",
            "[object Error]": "error",
        }
    */

    /**
     *  与原生map函数功能一样，除了数组，还可以对对象、类数组，进行map
     *
     * @param elements
     * @param callback
     */
    $.map = function (elements, callback) {
        var value, values = [], i, key
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i)
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback(elements[key], key)
                if (value != null) values.push(value)
            }
        // flatten 函数上文定义的，作用：无论 values 是否是数组，都将返回一个正确的数组。
        // 例如，传入 'abc' ，返回 ['abc']
        return flatten(values)
    };

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

        /**
         * concat
         concat(nodes, [node2, ...])   ⇒ self
         添加元素到一个Zepto对象集合形成一个新数组。

         concat([item1,item2,.....])   ⇒ self
         如果参数是一个数组，那么这个数组中的元素将会合并到Zepto对象集合中。
         *
         * return {Array}
         */
        concat: function () {
            //1.6的concat直接就是 emptyArray.concat
            var i, value, args = []
            for (i = 0; i < arguments.length; i++) {
                value = arguments[i]
                args[i] = zepto.isZ(value) ? value.toArray() : value
            }
            return concat.apply(zepto.isZ(this) ? this.toArray() : this, args)
        },

        forEach: emptyArray.forEach,
        indexOf: emptyArray.indexOf,

        html: function (html) {
            return 0 in arguments ?
                this.each(function (idx) {
                    var originHtml = this.innerHTML;
                    $(this).empty().append(funcArg(this, html, idx, originHtml));
                }) :
                (0 in this ? this[0].innerHTML : null);
        },

        /**
         *  设置/获取text
         * @param text
         * @returns {*}
         */
        text: function (text) {
            return 0 in arguments ?
                this.each(function (idx) {
                    var newText = funcArg(this, text, idx, this.textContent);
                    //三元运算符?:的优先级比=优先级高
                    this.textContent = newText == null ? '' : '' + newText;
                }) :
                //没传参就返回当前zepto对象所有元素的文本
                (0 in this ? this.pluck('textContent').join("") : null)
            //1.6中只返回第一个元素的文本
            // (0 in this ? this[0].textContent : null)
        },

        /**
         * attr 读取或设置dom的属性。
         attr(name)   ⇒ string
         attr(name, value)   ⇒ self
         attr(name, function(index, oldValue){ ... })   ⇒ self
         attr({ name: value, name2: value2, ... })   ⇒ self

         如果没有给定value参数，则读取对象集合中第一个元素的属性值。
         当给定了value参数。则设置对象集合中所有元素的该属性的值。
         当value参数为null，那么这个属性将被移除(类似removeAttr)，多个属性可以通过对象键值对的方式进行设置。
         *
         * @param name
         * @param value
         */
        attr: function (name, value) {
            //// 情况1：name为string且无第二个参数，读取值（读取值只能读取第一个元素的值），为什么不直接像下面这样写?
            //(typeof name === 'string' && value===undefined)
            //答案：如果这样写，用户便不能将对应的属性设置成undefined
            var retVal, result;
            if (typeof name === 'string' && !(1 in arguments)) {
                if (!this.length || this[0].nodeType !== 1) {
                    retVal = undefined;
                } else {
                    if (!(result = this[0].getAttribute(name)) && name in this[0]) {
                        retVal = this[0][name];
                    } else {
                        retVal = result;
                    }
                }
            } else {
                return this.each(function (idx) {
                    if (this.nodeType !== 1) {
                        return;
                    }

                    // 传入的参数可能是一个对象集合
                    if (isObject(name)) {
                        for (key in name) {
                            // setAttribute(node,name,value)
                            setAttribute(this, key, name[key]);
                        }
                    } else {
                        // funcArg 即处理了 value 是函数和非函数的两种情况
                        setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)));

                        // value 不是函数
                        // setAttribute(this, name, value);

                        // value 是函数
                        // setAttribute(this, name, value.call(this, idx, this.getAttribute(name)));
                    }
                });
            }
            return retVal;
        },

        removeAttr: function (name) {
            return this.each(function () {
                this.nodeType === 1 && name.split(' ').forEach(function (attribute) {
                    setAttribute(this, attribute)
                }, this)
            });
        },

        remove: function () {
            return this.each(function () {
                if (this.parentNode != null)
                    this.parentNode.removeChild(this);
            });
        },


        // prop 也是给元素设置或获取属性，但是跟 attr 不同的是，
        // prop 设置的是元素对象本身固有的属性，attr 用来设置标签自定义的属性（也可以设置固有的属性）。
        prop: function (name, value) {
            name = propMap[name] || name;
            return (1 in arguments) ?
                this.each(function (idx) {
                    this[name] = funcArg(this, value, idx, this[name])
                }) :
                (this[0] && this[0][name]);
        },

        removeProp: function (name) {
            name = propMap[name] || name;
            return this.each(function () {
                delete this[name]
            });
        },

        /**
         * 设置/读取标签data属性值
         *
         * data
         * data(name)   ⇒ value
         * data(name, value)   ⇒ self
         * @param name
         * @param value
         */
        data: function (name, value) {
            // capitalRE = /([A-Z])/g,  //大写字母

            // $foo1.data('myAttr', '998');
            //replace(capitalRE, '-$1') 是在大写字母前面加上 - 连字符,例如 myAttr => data-my-attr
            var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase();

            var data = (1 in arguments) ?
                this.attr(attrName, value) :
                this.attr(attrName);

            //如果value为“true”, “false”, and “null” 被转换为相应的类型；
            // 数字值转换为实际的数字类型；
            // JSON值将会被解析，如果它是有效的JSON；
            return data !== null ? deserializeValue(data) : undefined;
        },

        /**
         *
         * 获取或设置匹配元素的值。当没有给定value参数，返回第一个元素的值。
         * 如果是<select multiple>标签，则返回一个数组。当给定value参数，那么将设置所有元素的值。
         *
         *  ratio,checkbox无法处理??
         *
         * @param value
         */
        val: function (value) {
            //有传参
            if (0 in arguments) {
                if (value == null) value = "";
                return this.each(function (idx) {
                    this.value = funcArg(this, value, idx, this.value)
                });
            } else {//没传参
                return this[0] && (this[0].multiple ?
                    //如果是<select><option></<option></select>或者多选框
                    //返回有selected属性的option标签的值
                    $(this[0]).find('option').filter(function () {
                        return this.selected;
                    }).pluck('value') :
                    //为是<select>则直接返回value
                    this[0].value);
            }
        },

        hide: function () {
            return this.css("display", "none");
        },

        show: function () {
            return this.each(function () {
                // 第一步，针对内联样式，将 none 改为空字符串，如 <p id="p2" style="display:none;">p2</p>
                this.style.display == "none" && (this.style.display = '');

                // 第二步，针对css样式，如果是 none 则修改为默认的显示样式
                // show 方法是为了显示对象，而对象隐藏的方式有两种：内联样式 或 css样式
                // this.style.display 只能获取内联样式的值（获取属性值）
                // getComputedStyle(this, '').getPropertyValue("display") 可以获取内联、css样式的值（获取 renderTree 的值）
                // 因此，这两步都要做判断，
                if (getComputedStyle(this, '').getPropertyValue("display") == "none") {
                    this.style.display = defaultDisplay(this.nodeName);
                }
            })
        },


        /**
         * 切换元素的显示和隐藏状态，如果元素隐藏，则显示元素，如果元素显示，则隐藏元素。
         * 可以用参数 setting 指定 toggle 的行为，如果指定为 true ，则显示，如果为 false （ setting 不一定为 Boolean），则隐藏。
         *
         *  toggle(true) => show()
         *  toggle(false) => hide()
         */
        toggle: function (setting) {
            return this.each(function () {
                var el = $(this);
                (setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide();

                //相当于如下语句
                // if(setting === undefined){
                //     setting = el.css("display") == "none";
                // }
                // setting ? el.show() : el.show();
            });
        },

        prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
        next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },

        /**
         *  返回指定元素在当前集合中的位置，功能与eq方法相相反
         *  如果没有给出 element ，则返回当元素红在兄弟集合中的位置
         * @param element
         * @returns {number|*}
         */
        index:function (element) {
            return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
        },

        hasClass: function (name) {
            if (!name) return false;
            //类数组可以使用数组的内置方法
            return emptyArray.some.call(this, function (el) {
                //注意， some 里面的 this 值并不是遍历的当前元素，而是传进去的 classRE(name) 正则，
                //回调函数中的 el 才是当前元素
                //className(el)获取el的className，而然用this.test对el的className进行正则匹配
                return this.test(className(el));
            }, classRE(name));
        },


        /**
         *
         * dom4 可以用classList.addClass实现同样的效果
         *
         * @param name
         * @returns {*}
         */
        addClass: function (name) {
            if (!name) return this;
            return this.each(function (idx) {
                // 说明当前元素不是 DOM node
                if (!'className' in this) return;
                // classList 是全局定义的空变量
                classList = [];

                var cls = className(this), newName = funcArg(this, name, idx, cls);

                // newName.split(/\s+/g) 是将 newName 字符串，用空白分割成数组。
                newName.split(/\s+/g).forEach(function (klass) {
                    if (!$(this).hasClass(klass)) classList.push(klass);
                }, this);

                classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "));
            });
        },

        removeClass: function (name) {
            return this.each(function (idx) {
                if (!'className' in this) return
                if (name === undefined) return className(this, '')
                //原class
                classList = className(this)
                //name 有可能是 "className1 className2 className3"同时移除多个的情况
                //所以要用空白分割开
                funcArg(this, name, idx, classList).split(/\s+/g).forEach(function (klass) {
                    classList = classList.replace(classRE(klass), " ")
                })
                //重新设值className
                className(this, classList.trim())
            })
        },

        /**
         *
         *
         */
        toggleClass: function (name, when) {
            if (!name) return this
            return this.each(function (idx) {
                var $this = $(this), names = funcArg(this, name, idx, className(this))
                names.split(/\s+/g).forEach(function (klass) {
                    (when === undefined ? !$this.hasClass(klass) : when) ?
                        $this.addClass(klass) : $this.removeClass(klass)
                })
            })
        },

        /**
         *
         * 调用方式
         *css(property)   ⇒ value  // 获取值
         *css([property1, property2, ...])   ⇒ object // 获取值
         *css(property, value)   ⇒ self // 设置值
         *css({ property: value, property2: value2, ... })   ⇒ self // 设置值
         *
         * @param property
         * @param value
         */
        css: function (property, value) {
            // 只有一个参数，获取第一个元素的样式
            if (arguments.length < 2) {
                var element = this[0];
                if (typeof property == 'string') {
                    if (!element) return;
                    // 为什么不直接获取计算后的样式值呢？因为用 style 获取的样式值是原始的字符串，
                    // 而 getComputedStyle 顾名思义获取到的是计算后的样式值，
                    // 如 style = "transform: translate(10px, 10px)" 用 style.transform 获取到的值为 translate(10px, 10px)，
                    // 而用 getComputedStyle 获取到的是 matrix(1, 0, 0, 1, 10, 10)
                    return element.style[camelize(property)] || getComputedStyle(element, '').getPropertyValue(property);
                } else if (isArray(property)) {
                    if (!element) return;
                    var props = {};
                    var computedStyle = getComputedStyle(element, '');
                    $.each(property, function (_, prop) {
                        //=运算符优先级比||高，加()提高||优先级
                        props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop));
                    });

                    return props;
                }
            }

            var css = '';
            if (type(property) == 'string') {
                if (!value && value !== 0) {
                    // 如果value参数是 '' null undefined 则移除这个css样式
                    // 注：此计算只适用于内联样式的删除，对 css 样式无效，因为它只通过 this.style.removeProperty 计算，而 this.style 获取不到css样式
                    this.each(function () {//删除要用high-line这种命名方式？
                        this.style.removeProperty(dasherize(property));
                    });
                } else {
                    // this.css('width', 100) 跟 this.css('width', '100px') 会得到一样的结果
                    // 但这个函数并不完美，如果this.css('width', '100')把第二参数写成不合法的字符串是没效果的
                    //还有即使传进的是不存在的属性这个函数也不会报错
                    css = dasherize(property) + ":" + maybeAddPx(property, value);
                }
            } else {
                //数组
                for (key in property) {
                    // 如果value参数是 '' null undefined 则移除这个css样式
                    if (!property[key] && property[key] !== 0)
                        this.each(function () {
                            this.style.removeProperty(dasherize(key));
                        });
                    else
                        css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';';
                }
            }

            return this.each(function () {
                //这里设置的是内联样式
                this.style.cssText += ';' + css;
            });
        },

        each: function (callback) {
            // zepto 的 each 方法比较巧妙，在方法内部，调用的其实是数组的 every 方法，
            // every 遇到 false 时就会中止遍历，zepto 也正是利用 every 这种特性，让 each 方法也具有了中止遍历的能力，
            // 当 callback 返回的值为布尔值 false 时，中止遍历，注意这里用了 !==，因为 callback 如果没有返回值时，得到的值会是 undefined ，这种情况是需要排除的。
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            //返回this为了链式调用
            return this;
        },


        clone: function () {
            return this.map(function () {
                return this.cloneNode(true)
            })
        },

        empty: function () {
            return this.each(function () {
                this.innerHTML = "";
            });
        },

        /**
         * 判断集合中是否有包含指定条件的子元素，将符合条件的元素返回。
         * has(selector)   ⇒ collection
         * has(node)   ⇒ collection
         * @param selector
         */
        has: function (selector) {
            return this.filter(function () {
                return isObject(selector) ?
                    $.contains(this, selector) :
                    $(this).find(selector).size() // 否则（selector是css选择字符串）则返回find后的size（如果 size === 0 即相当于返回 false）
            })
        },

        // 取出指定index的元素
        eq: function (idx) {
            // 可支持 -1、0、1、2 ……
            // -1表示倒数第一个元素
            //直接调用 this.slice(idx) ，即取出最后一个元素，否则取 idx 至 idx + 1 之间的元素，也就是每次只取一个元素。
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
        },

        /**
         *  提取zepto对象里每个元素的property属性，返回一个数组
         *
         * @param property
         */
        pluck: function (property) {
            return $.map(this, function (el) {
                return el[property]
            })
        },


        /**
         *  取集合中第一个元素
         * @returns {jQuery|HTMLElement}
         */
        first: function () {
            var el = this[0];
            //在确定el存在的情况下，如果el不是zepto对象，将el转成zepto对象再返回
            return el && !isObject(el) ? el : $(el);
        },

        /**
         *  取集合中最后一个元素
         * @returns {jQuery|HTMLElement}
         */
        last:function () {
            var el = this[this.length - 1];
            return el && !isObject(el) ? el : $(el);
        },

        /**
         *
         * 从元素本身开始，逐级向上级元素匹配，并返回最先匹配selector的元素。(find方法是向下查找，与此相反)
         * 如果给定context节点参数，向上查找到context为止。这个方法与 parents(selector)有点相像，但它只返回最先匹配的祖先元素。
         * 如果参数是一个Zepto对象集合或者一个元素，结果必须匹配给定的元素而不是选择器。
         *
         * closest(selector, [context])   ⇒ collection
         * closest(collection)   ⇒ collection
         * closest(element)   ⇒ collection
         *
         * @param selector
         * @param context
         */
        closest:function (selector, context) {
            var nodes = [],
                collection = typeof selector == 'object' && $(selector) // 如果 selector 是对象，则用 $ 封装后，赋值给 collection

            this.each(function (_, node) {
                // while循环的判断条件：
                // 第一，node有值（node一开始被赋值为对象的第一个元素）
                // 第二，collection有值（传入的selector是对象），node不存在于collection 或者 node与selector匹配
                // 循环继续（node试图赋值为node.parentNode）；否则，循环跳出（说明已经找到了符合条件的父节点）
                while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector))){
                    //当前 node 不为指定的上下文 context 并且不为 document 节点时，向上查找
                    node = node !== context && !isDocument(node) && node.parentNode
                }

                if(node && nodes.indexOf(node) < 0) nodes.push(node)
            });

            return $(nodes)
        },

        /**
         *  获取所有集合中所有元素的兄弟节点。
         * @param selector
         * @returns {Array.<*>}
         */
        siblings:function (selector) {
            return filtered(this.map(function (i,el) {
                //获取兄弟节点的思路也很简单，对当前集合遍历，找到当前元素的父元素el.parentNode，调用 children 方法，找出父元素的子元素，将子元素中与当前元素不相等的元素过滤出来即是其兄弟元素了。
                // 注：原生js没用直接获取sibling的方法，只有previousSibling,nextSibling
                return filter.call(children(el.parentNode),function (child) {
                    return child !== el
                })
                //最后调用 filtered 来过滤出匹配 selector 的兄弟元素。
            }),selector)
        },

        /**
         *  返回从节点开始向上一直遍历到document的所有父节点
         * @param selector
         */
        parents: function (selector) {
            var ancestors = [], nodes = this
            while (nodes.length > 0)
                nodes = $.map(nodes, function (node) {
                    if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
                        ancestors.push(node)
                        return node
                    }
                })
            return filtered(ancestors, selector)
        },

        /**
         *  返回一层父节点
         * @param selector
         */
        parent: function (selector) {
            // 首先调用的是 this.pluck('parentNode') ，获取所有元素的父元素，
            // 然后调用 uniq 对集合去重，最后调用 filtered ，返回匹配 selector 的元素集合。
            return filtered(uniq(this.pluck('parentNode')), selector);
        },


        children: function (selector) {
            return filtered(this.map(function () {
                return children(this);
            }), selector);
        },

        /**
         *
         * 将所有集合元素替换为指定的内容 newContent ， newContent 的类型跟 before 的参数类型一样。
         replaceWidth 首先调用 before 将 newContent 插入到对应元素的前面，再将元素删除，这样就达到了替换的上的。
         *
         * @param newContent
         * @returns {obj} zepto对象
         */
        replaceWith: function (newContent) {
            return this.before(newContent).remove();
        },


        /**
         *
         * 将structure包裹在当前zepto对象外面
         *
         * @param structure dom片段或dom对象或zepto对象
         */
        wrapAll: function (structure) {
            if (this[0]) {
                $(this[0]).before(structure = $(structure));
                var children;
                //查找出structure最内层节点
                while ((children = structure.children()).length) {
                    structure = children.first();
                }
                //将当前zepto对象插入到structure最内层节点
                $(structure).append(this);
            }
        },

        /**
         * 遍历zepto对象的节点，对每个节点进行wrapAll
         * @param structure
         * @returns {*}
         */
        wrap: function (structure) {
            var func = isFunction(structure);
            if (this[0] && !func) {
                var dom = $(structure).get(0),
                    clone = dom.parentNode || this.length > 1;
            }

            return this.each(function (index) {
                // func ? structure.call(this, index) 如果structure是函数就执行
                $(this).wrapAll(func ? structure.call(this, index) :
                    clone ? dom.cloneNode(true) : dom);
            });
        },

        /**
         *
         *  将当前zepto对象内每个原生DOM节点用structure包裹
         *  (功能与append相似)
         *
         * @param structure
         * @returns {*}
         */
        wrapInner: function (structure) {
            var func = isFunction(structure);
            return this.each(function (index) {
                var self = $(this),
                    contents = self.contents(),
                    dom = func ? structure.call(this, index) : structure;

                //contents.length检测this有没有孩子,
                //如果有，则用structure将每个孩子包裹
                //如果没有，则直接在当前DOM里插入structure
                contents.length ? contents.wrapAll(dom) : self.append(dom);
            })
        },

        unwrap: function () {
            this.parent().each(function () {
                $(this).replaceWith($(this).children());
            });

            return this;
        },

        /**
         * 如果map里遍历到的this是frame，返回frame的document对象
         * 如果map里遍历到的this是原生DOM对象，返回数组化后的DOM.childNodes
         *
         * @returns {*|zepto|HTMLElement}
         */
        contents: function () {
            return this.map(function () {
                //只有frame元素才有contentDocument属性，返回的是该frame的document对象
                return this.contentDocument || slice.call(this.childNodes);
            });
        },

        /**
         *
         * @param fn
         * @returns {zepto|HTMLElement}
         */
        map: function (fn) {
            // $.map = function (elements, callback){......}
            // $.map 返回的是一个数组，所以要包装
            return $(
                $.map(this, function (element, idx) {
                    return fn.call(element, idx, element);
                })
            );
        },

        slice: function(){
            return $(slice.apply(this, arguments))
        },

        /**
         *
         * 过滤当前对象集合，找出能匹配css选择器的元素，返回新集合。
         *
         * 与它功能相反的函数是$.fn.not
         *
         * @param {} selector
         * @returns {zepto|HTMLElement}
         */
        filter: function (selector) {
            if (isFunction(selector))
            //this代表当前zepto数组，遍历this,执行selector函数，找到返回为false的元素，然后再重复一次，两次not操作等价于找出符合条件的元素。
                return this.not(this.not(selector));

            return $(filter.call(this, function (element) {
                return zepto.matches(element, selector);
            }));
        },

        /**
         * is 检测当前集合的第一个元素是否与selector匹配
         *
         *  用法
         * function testIs() {
         *    var $foo1 = $('#foo1');
         *    console.log($foo1.is('#foo1'));//true
         * }
         *
         * @param selector
         * @returns {boolean}
         */
        is: function (selector) {
            return this.length > 0 && zepto.matches(this[0], selector);
        },

        /**
         * not
         * not(selector)   ⇒ collection
         * not(collection)   ⇒ collection
         * not(function(index){ ... })   ⇒ collection
         *
         * 过滤当前对象集合，找出不能匹配css选择器的元素，返回新集合。
         *
         * 如果另一个参数为Zepto对象集合，那么返回的新Zepto对象中的元素都不包含在该参数对象中。
         * 如果参数是一个函数。仅仅包含函数执行为false值得时候的元素，函数的 this 关键字指向当前循环元素。
         *
         * 与它功能相反的函数是$.fn.filter
         *
         */
        not: function (selector) {
            var nodes = [];//存储不符合条件的元素，最后返回

            //为什么还要selector.call !== undefined判断selector是否有call方法
            if (isFunction(selector) && selector.call !== undefined) {
                this.each(function (idx) {
                    // 将集合中不符合条件的元素查找出来放入nodes
                    if (!selector.call(this, idx)) nodes.push(this);
                });
            }

            else {
                var excludes =
                    typeof selector === 'string' ?
                        this.filter(selector) :
                        (likeArray(selector) && isFunction(selector.item)) ?
                            //如果是HTMLCollection，则转为一个纯数组
                            //如果只是一个普通的HTMLDom,则包装成zepto数组
                            //又或者传入的是zepto数组，经$()包装后返回的也是zepto数组，所以不需要特殊处理
                            slice.call(selector) : $(selector);

                this.forEach(function (element) {
                    //在原来的集合中，排除excludes集合
                    if (excludes.indexOf(element) < 0) nodes.push(element);
                });

            }

            return $(nodes);
        },
        /**
         *
         * find
         *find(selector)   ⇒ collection
         *find(collection)   ⇒ collection v1.0+
         *find(element)   ⇒ collection v1.0+
         *在当对象前集合内查找符合CSS选择器的每个元素的后代元素。
         *如果给定Zepto对象集合或者元素，过滤它们，只有当它们在当前Zepto集合对象中时，才回被返回。
         * @param {String} selector
         *
         * @returns {zepto|HTMLElement}
         */
        find: function (selector) {
            //TODO zepto所有if else语句都没有花括号，大多情况下用一个变量保存中间结果，如下result
            var result, $this = this;
            // 如果没有参数，就返回一个空的 zepto 对象
            if (!selector) return $();
            //selector为zepto数组或原生对象/原生数组
            else if (typeof selector === 'object')
                result = $(selector).filter(function () {
                    var node = this;

                    //$this是zepto数组，数组中的每个元素当要当成node的父亲进行遍历查找
                    //一般情况下$this只有一个元素
                    return emptyArray.some.call($this, function (parent) {
                        //用some方法的原因是，只要在parent找到node就停止循环
                        return $.contains(parent, node);
                    })
                });

            //selector为string
            else if (this.length === 1) {
                // 如果只有一个元素，则使用 qsa 取得节点数组，再$包装成zeprto节点数组
                result = $(zepto.qsa(this[0], selector));
            }

            // 如果有多个元素，则使用 map 遍历所有元素，使用 qsa 针对每个元素判断，符合条件即返回（map将返回包含符合条件的元素的新数组，并 $ 封装，支持链式操作！！）
            else result = this.map(function () {
                    //里面的this是当前遍历item
                    return $(zepto.qsa(this, selector));
                });
            return result;
        },

        /**
         * offsetParent()   ⇒ collection
         * 找到第一个定位过的祖先元素，意味着它的css中的position 属性值为“relative”, “absolute” or “fixed”
         * @returns {*|zepto|HTMLElement}
         */
        offsetParent: function () {
            // 通过 this.map 遍历当前对象所有元素，进行计算，然后拼接新的数组，并返回。保证链式操作
            return this.map(function () {
                // elem.offsetParent 可返回最近的改元素最近的已经定位的父元素
                var parent = this.offsetParent || document.body;
                //如果this.offsetParent存在，不会进入while循环，while循环是当this.offsetParent不存在时做兼容性处理的
                while (parent &&
                !rootNodeRE.test(parent.nodeName) &&
                $(parent).css('position') == 'static') {
                    // 如果获取的parent不是null、不是body或html、而且position==static
                    parent = parent.offsetParent;
                }

                return parent;
            });
        },

        /**
         *
         *
         * offset
         *offset()  ⇒ object
         *offset(coordinates)  ⇒ self v1.0+
         *offset(function(index, oldOffset){ ... })  ⇒ self v1.0+
         *
         * 获取或设置元素相对 document 的偏移量及元素的宽高。
         *
         * @param coordinates 坐标
         *
         * return{left,top,width,height}
         */
        offset: function (coordinates) {
            //设置offset
            if (coordinates) return this.each(function (index) {
                var $this = $(this),
                    coords = funcArg(this, coordinates, index, $this.offset()),
                    // 找到最近的 “relative”, “absolute” or “fixed” 的祖先元素，并获取它的 offset()
                    parentOffset = $this.offsetParent().offset(),
                    // left 和 top 需要去掉定位的祖先元素的 left、top 值，因为后面会用到relative相对定位
                    props = {
                        top: coords.top - parentOffset.top,
                        left: coords.left - parentOffset.left
                    };
                // static时，设置 top、left是无效的，要转成relative
                if ($this.css('position') == 'static') props['position'] = 'relative';
                //
                $this.css(props);
            });
            //获取offset
            if (!this.length) return null;
            //如果是框架里的元素则$.contains(document.documentElement,this[0])为false
            if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
                return {top: 0, left: 0};
            var obj = this[0].getBoundingClientRect();

            // window.pageXOffset是 window.scrollX 的别名。
            // window.pageYOffset是 window.scrollY 的别名。
            //IE低版本需要用 document.body.scrollLeft 和 document.body.scrollTop 兼容
            return {
                left: obj.left + window.pageXOffset,
                top: obj.top + window.pageYOffset,
                width: Math.round(obj.width),//Math.round返回四舍五入后的整数
                height: Math.round(obj.height)
            };
        },

        /**
         *
         * position 返回相对父元素的偏移量。
         *
         * offset 返回的是相对于Document的偏移量
         *
         *
         * @returns {{top: number, left: number}}
         */
        postion: function () {
            if (!this.length) return;

            var elem = this[0],
                offsetParent = elem.offsetParent(),
                offset = elem.offset(),
                //获取定位祖先元素的offset（ body、html直接设置 top:0;left:0 ）
                parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? {top: 0, left: 0} : offsetParent.offset();

            // 两个元素之间的距离应该不包含元素的外边距，因此将外边距减去。
            offset.top -= parseFloat($(elem).css('margin-top')) || 0;
            offset.left -= parseFloat($(elem).css('margin-left')) || 0;


            // position 返回的是距离第一个定位元素的 context box 的距离，
            // 因此父元素的 offset 的 left 和 top 值需要将 border 值加上（offset 算是的外边距距离文档的距离）???
            parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0;
            parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0;

            //偏移量的定义是什么？？？
            return {
                top: offset.top - parentOffset.top,
                left: offset.left - parentOffset.left
            }
        },

        /**
         * scrollTop v1.0+
         * scrollTop()  ⇒ number
         * scrollTop(value)  ⇒ self v1.1+
         * 获取或设置页面上的滚动元素或者整个窗口向下滚动的像素值。
         *
         * 注意，一般情况下像下面这种会出现滚动条的情况scrollTop才有值，否则scrollTop为0
         * <div style="font-size: 20px;height: 400px;width: 300px;overflow: auto" id="test">
         *     content....
         * </div>
         *
         * @param value
         */
        scrollTop: function (value) {
            // Element.scrollTop 属性可以获取或设置一个元素的内容垂直滚动的像素数。
            if (!this.length) return;
            var hasScrollTop = 'scrollTop' in this[0]
            // 如果存在 scrollTop 属性，则直接用 scrollTop 获取属性，否则用 pageYOffset 获取元素Y轴在屏幕外的距离，也即滚动高度了。+
            //pageYOffset是window属性，为什么这里认为这个属性可能存在document??
            if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset
            //如果有 scrollTop 属性，则直接设置这个属性的值，否则调用 scrollTo 方法，用 scrollX 获取到 x 轴的滚动距离，将 y 轴滚动到指定的距离 value。
            return this.each(hasScrollTop ?
                function () {
                    this.scrollTop = value
                } :
                function () {
                    this.scrollTo(this.scrollX, value)
                });
        },

        scrollLeft: function (value) {
            if (!this.length) return
            var hasScrollLeft = 'scrollLeft' in this[0]
            if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
            return this.each(hasScrollLeft ?
                function () {
                    this.scrollLeft = value
                } :
                function () {
                    this.scrollTo(value, this.scrollY)
                })   // window.scrollX 获取纵向滚动值
        },

    };


    // width
    // width()   ⇒ number
    // width(value)   ⇒ self
    // width(function(index, oldWidth){ ... })   ⇒ self
    // 获取对象集合中第一个元素的宽；或者设置对象集合中所有元素的宽。
    ['width', 'height'].forEach(function (dimension) {
        //这段将 width 和 height 的首字母变成大写，即 Width 和 Height 的形式。
        var dimensionProperty =
            dimension.replace(/./, function (m) {
                return m[0].toUpperCase()
            });

        //将方法绑定在zepto对象上
        $.fn[dimension] = function (value) {
            var offset, el = this[0];
            // 情况1，无参数，获取第一个元素的值
            // window对象与document对象的获取width/height的方式
            if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :// window.innerHeight
                isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :// document.documentElement.scrollHeight
                    (offset = this.offset()) && offset[dimension];// this.offset().width

            // 情况2，有参数，设置所有元素的值
            else return this.each(function (idx) {
                el = $(this);
                el.css(dimension, funcArg(this, value, idx, el[dimension]()));
            });
        };
    });

    // 上文定义 adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ]
    // 外部 after,before
    // 内部 append,prepend
    adjacencyOperators.forEach(function (operator, operatorIndex) {
        var inside = operatorIndex % 2;
        //outside 0 after before
        //inside 1 prepend append

        //定义四个函数
        $.fn[operator] = function () {
            //$.map可以将arguments类数组展平
            //arguments数组有可能是这样子的
            //[zeptoDom1,zeptoDom2,zeptoDom3....]而zeptoDom是个类数组，所以arguments数组约等于
            //[[0:xx,1:xxx],[0:xx,1:xxx],[0:xx,1:xxx],....] $.map不仅做了map操作还做了扁平化操作
            //所以最后得到[0:xx,1:xxx,2:xx,3:xx]
            var argType, nodes = $.map(arguments, function (arg) {
                    var arr = [];
                    argType = type(arg);
                    //如果传的是数组
                    if (argType === 'array') {
                        arg.forEach(function (el) {
                            // $.zepto与zepto是一样的，Zepto函数末尾有一句$.zepto=zepto
                            //原生node节点直接加入新数组
                            if (el.nodeType !== undefined) return arr.push(el)
                            //将zepto对象转换成数组
                            else if ($.zepto.isZ(el)) return arr = arr.concat(el.get());
                            //将string转换成dom再加入节点
                            arr = arr.concat(zepto.fragment(el))
                        });
                        return arr;
                    }

                    //如果传的是zeptoDom
                    return argType == "object" || arg == null ?
                        arg : zepto.fragment(arg)//如果传的是string即html片段，比如</p>,使用fragment将string转成dom节点
                }),
                parent, copyByClone = this.length > 1;

            if (nodes.length < 1) return this;

            return this.each(function (_, target) {//(idx,element)
                parent = inside ? target : target.parentNode;

                target = operatorIndex === 0 ? target.nextSibling :
                    operatorIndex === 1 ? target.firstChild :
                        operatorIndex == 2 ? target :
                            null;

                //如果调用了append则，最后待会于调用了
                //parent.insertBefore(node, null)

                // 如果调用了prepend则，最后待会于调用了
                // target为原parent.firstChild
                //parent.insertBefore(node, target)

                // 如果调用了after则，最后待会于调用了
                // parent为原parent.parentNode, target为原parent.nextSibling
                //parent.insertBefore(node, target)

                // 如果调用了before则，最后待会于调用了
                // parent为原parent.parentNode, target为原parent
                //parent.insertBefore(node, target)


                // switch (operatorIndex){
                //     case 0:
                //         //after
                //         target = target.nextSibling;
                //         break;
                //     case 1:
                //         //prepend
                //         target = target.firstChild;
                //         break;
                //     case 2:
                //         //before
                //         break;
                //     case 3:
                //         //append
                //         target = null;
                //         break;
                // }


                var parentInDocument = $.contains(document.documentElement, parent);

                nodes.forEach(function (node) {
                    //node.cloneNode是原生方法
                    // 注意:为了防止一个文档中出现两个ID重复的元素,使用cloneNode()方法克隆的节点在需要时应该指定另外一个与原ID值不同的ID
                    //克隆一个元素节点会拷贝它所有的属性以及属性值,当然也就包括了属性上绑定的事件(比如onclick="alert(1)"),但不会拷贝那些使用addEventListener()方法或者node.onclick = fn这种用JavaScript动态绑定的事件.
                    //详情见MDN文档https://developer.mozilla.org/zh-CN/docs/Web/API/Node/cloneNode
                    if (copyByClone) node = node.cloneNode(true);
                    //如果一个新节点要插入到多个节点当中，就要克隆多份，分别插入。
                    //因为如果只用同一个节点插入到不同地方，节点会发生移动。

                    //如果父节点不存在，则将 node 删除，不再进行后续操作。???
                    else if (!parent) return $(node).remove();

                    parent.insertBefore(node, target);
                    if (parentInDocument)
                    //遍历节点找出嵌套的script标签,比如这样情况
                    //$foo3Inner.append("<div>Script Divvvvvvv<script>console.log('Script Divvvvvvv')<\/script><\/div>");
                        traverseNode(node, function (el) {
                            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
                                (!el.type || el.type === 'text/javascript') &&
                                !el.src) {
                                //这里似乎跟parentInDocument有矛盾，既然parentInDocument已经判断了传进来的节点
                                //一定是当前页面的，为什么这里还要处理iframe的情况？？
                                var target = el.ownerDocument ? el.ownerDocument.defaultView : window;
                                //html中即使用innerHtml插入script脚本，script脚本也不会自动执行，要用eval方法执行
                                target['eval'].call(target, el.innerHTML);
                            }
                        });
                });
            });

            // after    => insertAfter
            // prepend  => prependTo
            // before   => insertBefore
            // append   => appendTo
            // 这几个方法都是将集合中的元素插入到目标元素 target 中，跟 after、before、append 和 prepend 刚好是相反的操作。

            //比如
            //var $foo = $('#foo');
            //$foo.appendTo('#bar') => $('#bar').append($foo);
            console.log('operator:', inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After'));
            $.fn[inside ? operator + 'To' : 'insert' + (operatorIndex ? 'Before' : 'After')] = function (html) {
                $(html)[operator](this);
                return this;
            }
        }
    });


    zepto.Z.prototype = Z.prototype = $.fn;
    zepto.uniq = uniq;
    $.zepto = zepto;
    // zepto.isZ = function(object) {
    //     return object instanceof zepto.Z
    // }
    // 这个方法是用来判读一个对象是否为 zepto 对象，这是通过判断这个对象是否为 zepto.Z 的实例来完成的，因此需要将 zepto.Z 和 Z 的 prototype 指向同一个对象
    return $;
})();

window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);


//主要新增样式操作
//hasClass
//addClass
//removeClass
//toggleClass