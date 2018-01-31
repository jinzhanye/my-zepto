# getComputedStyle

> let style = window.getComputedStyle(element, [pseudoElt]);

第一个参数必须是Element对象(传递一个非节点元素，如 一个#text 节点， 将会抛出一个错误).在Zepto中将getComputedStyle重写，如果第一个参数不是Element对象不报错，而是返回null

## 与伪元素一起使用
getComputedStyle 可以从伪元素拉取样式信息 (比如, ::after, ::before, ::marker, ::line-marker).

````
<style>
    h3::after {
        content: "rocks!";
    }
</style>

<h3>generated content</h3> 

<script>
    let h3 = document.querySelector('h3'), 
    result = getComputedStyle(h3, '::after').content;
    alert(`the generated content is: ${result}`);
    console.log(`the generated content is: ${result}`); 
    // the generated content is: "rocks!"
</script>

````

## 兼容
DOM2规范，支持IE9+