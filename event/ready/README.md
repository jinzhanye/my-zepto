# 浏览器加载机制


### readystatechange

- loading / 加载 
    document 仍在加载。
- interactive / 互动
    文档已经完成加载，文档已被解析，但是诸如图像，样式表和框架之类的子资源仍在加载。
- complete / 完成
    T文档和所有子资源已完成加载。状态表示 load 事件即将被触发。
    
当这个属性的值变化时，document 对象上的readystatechange 事件将被触发。

https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState

    //HTML加载完且JS执行完之后都会触发DOMContentLoaded
    //不会等待CSS文件、图片、iframe加载完成。
    //所有资源加载完成触发load事件
    
````

document.addEventListener('readystatechange', () => console.log(document.readyState));


switch (document.readyState) {
  case "loading":
    // The document is still loading.
    break;
  case "interactive":
    // The document has finished loading.
    // We can now access the DOM elements.
    var span = document.createElement("span");
    span.textContent = "A <span> element.";
    document.body.appendChild(span);
    break;
  case "complete":
    // The page is fully loaded.
    let CSS_rule = document.styleSheets[0].cssRules[0].cssText;
    console.log(`The first CSS rule is: ${CSS_rule }`);
    break;
}

// 模拟 DOMContentLoaded/ jquery ready
document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    initApplication();
  }
}
// 模拟 load/onload 事件
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    initApplication();
  }
}
````

