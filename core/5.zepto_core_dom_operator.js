var Zepto = (function () {
    //TODO 函数开关声名全部所有要用到的变量

    var undefined,//后面下面判断undefined使用
        key, $,
        emptyArray = [],
        concat = emptyArray.concat, filter = emptyArray.filter, slice = emptyArray.slice,
        document = window.document,
        tempParent = document.createElement('div'),//在zepto.matches方法中用到
        zepto = {},

        // 取出html代码中第一个html标签（或注释），如取出 <p>123</p><h1>345</h1> 中的 <p>
        fragmentRE = /^\s*<(\w+|!)[^>]*>/,

        // 匹配 <img /> <p></p>  不匹配 <img src=""/> <p>123</p>
        singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
        tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,

        // 匹配一个包括（字母、数组、下划线、-）的字符串
        // 这个正则其实是匹配 a-z、A-Z、0-9、下划线、连词符 组合起来的单词，这其实就是单个 id 和 class 的命名规则
        simpleSelectorRE = /^[\w-]*$/,

        table = document.createElement('table'),
        tableRow = document.createElement('tr'),

        methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

        adjacencyOperators = ['after', 'prepend', 'before', 'append'],

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

    // document.nodeType === 9
    //TODO  elem.DOCUMENT_NODE 也等于 9 （直接判断是不是9兼容性是最好的）
    function isDocument(obj) {
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


    function compact(array) {
        //TODO 为什么非要call这样写，而不像下面array.filter那样写?
        return filter.call(array, function (item) {
            return item != null
        })

        // return array.filter(function (item) {
        //     return item != null;
        // });
    }


    function traverseNode(node, fun) {
        fun(node)
        for (var i = 0, len = node.childNodes.length; i < len; i++)
            traverseNode(node.childNodes[i], fun)
    }

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

    /**
     *  删除或设置属性
     * @param node 原生节点
     * @param name 属性
     * @param value 属性值
     */
    function setAttribute(node, name, value) {
        value == null ? node.removeAttribute(name) : node.setAttribute(name, value);
    }

    //将dom原型修改为$.fn
    zepto.Z = function (dom, selector) {
        return new Z(dom, selector)
    };


    zepto.isZ = function (obj) {
        return obj instanceof zepto.Z;
    };

    /**
     *  与原生方法element.matches功能一样，这里只是做了更多兼容性处理
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
                //没传参就返回当前元素文本
                (0 in this ? this[0].textContent : null)
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

        remove: function () {
            return this.each(function () {
                if (this.parentNode != null)
                    this.parentNode.removeChild(this);
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
        }
    };

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
                                target['eval'].call(target, el.innerHTML);
                            }
                        });
                });
            });
        }
    });


    zepto.Z.prototype = Z.prototype = $.fn;
    $.zepto = zepto;
    // zepto.isZ = function(object) {
    //     return object instanceof zepto.Z
    // }
    // 这个方法是用来判读一个对象是否为 zepto 对象，这是通过判断这个对象是否为 zepto.Z 的实例来完成的，因此需要将 zepto.Z 和 Z 的 prototype 指向同一个对象
    return $;
})();

window.Zepto = Zepto;
window.$ === undefined && (window.$ = Zepto);


//新增功能
