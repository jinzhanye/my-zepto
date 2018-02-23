# 借鉴

##风格

- 如果用不上的形参，zepto用_表示
- 变量放在顶部
- 顶部声明undefined


### 链式调用
return this


## 类型判断
zepto内部构建这样一个对象，内有9种对象类型
 
 ````
     //注入所有对象类型到class2type对象
     $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
            class2type[`[object ${name}]`] = name.toLowerCase();
     });
        
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
   
   //特殊的 
   var toString = Object.prototype.toString
	"[object Undefined]"	"[object Null]"
 ````
 
### 类型转换

````
+号可以将字符串转成数字
var a = "-45"
+a === -45
````

## 其他
- noop，undefined空操作
- 多个if句话实现多态
- Zepto里if else语句基本上不用花括号

### 多重三元运算符

````
slice.call(
  isSimple && !maybeID && element.getElementsByClassName ?  // 如果为单选择器并且不为id选择器并且存在getElementsByClassName方法，进入下一个三元表达式判断
  maybeClass ? element.getElementsByClassName(nameOnly) :   // 如果为class选择器，则采用getElementsByClassName
  element.getElementsByTagName(selector) :  // 否则采用getElementsByTagName方法
  element.querySelectorAll(selector)   // 以上情况都不是，则用querySelectorAll
)
````

## 数组操作

### 去重

````

//ES6
````

### 扁平化

````
function flatten(array) {
    // concat.apply([], [1,2,3,[4,5]]) 相当于 [].concat(1,2,3,[4,5]) => [1,2,3,4,5]
    return array.length > 0 ? $.fn.concat.apply([], array) : array;
}

//ES6数组解构
````

## 字符操作

### 空白分割
用正则实现

````
"ssa    12 wed    1223".split(/\s+/g)
//结果 ["ssa", "12", "wed", "1223"]

//以下这种方式不能实现空白分割
"ssa    12 wed    1223".split(" ")
//结果 ["ssa", "", "", "", "12", "wed", "", "", "", "1223"]
````

## 对象
### 属性扩展

````
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

//ES6 
Object.assign()
````
