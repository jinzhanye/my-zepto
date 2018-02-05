## transition
````
div :hover{1s 1s width ease}
/*忽略延时的写法*/
div :hover{1s width ease}

/*完整写法写法+默认值*/
div :hover{
	transition-delay: 0s
	transition-duration: 0s
	transition-property: all
	transition-timing-function: ease
}
````

### transition优劣
transition的优点在于简单易用，但是它有几个很大的局限。

（1）transition需要事件触发，所以没法在网页加载时自动发生。

（2）transition是一次性的，不能重复发生，除非一再触发。

（3）transition只能定义开始状态和结束状态，不能定义中间状态，也就是说只有两个状态。

CSS Animation就是为了解决这些问题而提出的。

## animation属性

````
div:hover {
  animation: 1s 1s rainbow linear infinite forwards normal running;
}

/*全称+默认值*/

div:hover {
  animation-duration: 0s;
  animation-delay: 0s;
  animation-name: none;
  animation-timing-function: ease;
  animation-iteration-count: 1;
  animation-fill-mode:none;/*forwards 动画结束后停留在最后一帧*/
  animation-direction: normal;
  animation-play-state: running;
}
````

### timing-function
animation-timing-function与transition-timing-function不但可以设置变化速度类型，当使用cubic-bezier函数还可以设置轨迹超出极限位置。比如一些越界后再倒退的效果。

### animation-fill-mode:forwards 与 animation-play-state:paused
animation-fill-mode:forwards动画播放一次结束后停留在最后一帧,animation-play-state:paused停留在动画结束一瞬间的帧，即暂停了动画。

还要注意animation-play-state:paused必须放到其他属性后面
````
div{
    height: 50px;
    background-color: #00b4fd;
    overflow: hidden;
    /*生效*/
    animation:addHeight 1s linear infinite;
    animation-play-state: paused;
    /*生效
    animation:addHeight 1s linear infinite paused;*/
    
    /*不生效
    animation-play-state: paused;
    animation:addHeight 1s linear infinite;*/
}

div:hover{
    animation-play-state: running;
}

@keyframes addHeight {
    to {height: 200px}
}
````

### keyframes写法
````
@keyframes rainbow {
  0% { background: #c00 }
  50% { background: orange }
  100% { background: yellowgreen }
}

/*0%可以用from代表，100%可以用to代表，因此上面的代码等同于下面的形式。*/

@keyframes rainbow {
  from { background: #c00 }
  50% { background: orange }
  to { background: yellowgreen }
}

````
如果省略某个状态，浏览器会自动推算中间状态，所以下面都是合法的写法。

````
@keyframes rainbow {
    from { background: #c00; }
    50% { background: orange; }
}

@keyframes rainbow {
    50% { background: #c00; }
    to { background: orange; }
}

/*以上情况都相当于*/
@keyframes rainbow {
    0% {  background: #c00;  }
    100% {  background: orange;  }
}

@keyframes rainbow {
  to { background: yellowgreen }
}
/*从原来的颜色变成yellowgreen*/

@keyframes rainbow {
  from { background: yellowgreen }
}
/*从yellowgreen变成原来的颜色*/
````
还可以把多个状态写在一行。

````
@keyframes pound {
  from，to { transform: none; }
  50% { transform: scale(1.2); }
}
````

### animation-direction
animation-direction指定了动画播放的方向，最常用的值是normal和reverse。浏览器对其他值的支持情况不佳，应该慎用。
![](https://ws4.sinaimg.cn/large/006tKfTcgy1fo1xca3xisj30jg05ejrc.jpg)

## 注意
transition与animation需要明确知道，开始状态和结束状态的具体数值，才能计算出中间状态。比如，height从0px变化到100px，transition可以算出中间状态。但是，transition没法算出0px到auto的中间状态，也就是说，如果开始或结束的设置是height: auto，那么就不会产生动画效果。类似的情况还有，display: none到block，background: url(foo.jpg)到url(bar.jpg)等等。

## transform
用来做动画的只有transition与animation，transform只是一个像width、height一样的普通属性，不要混淆。
还有就是translate是transform的属性，用来设置坐标的，也不要搞混了。

zepto用这个正则检验是否属性于transform的属性

````
supportedTransforms = /^((translate|rotate|scale)(X|Y|Z|3d)?|matrix(3d)?|perspective|skew(X|Y)?)$/i,
````

> CSS transform 属性允许你修改CSS视觉格式模型的坐标空间。使用它，元素可以被转换（translate）、旋转（rotate）、缩放（scale）、倾斜（skew）。

像这样不依赖transition与animation使用transform是完全可以的 
````
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>transform</title>
    <style>
        img:hover{
            transform: scale(1.5);
        }
    </style>
</head>
<body>
<img src="TestPic.jpeg" alt="">
</body>
</html>
````

Zepto动画回调兼容

````
if(duration > 0){
    //注意现在this是zepto对象，bind是zepto事件的bind，不是原生js的bind
    //上文定义兼容性好的情况下endEvent为transitionend，
    //以Chrome为例，如果是旧版本则endEvent为webkitTransitionEnd
    this.bind(endEvent,wrappedCallback)
    setTimeout(function () {
        if (fired) return
        wrappedCallback.call(that)
    },(duration+delay) * 1000 + 25)
    //setTimeout 的回调执行比动画时间长 25ms ，目的是让事件响应在 setTimeout 之前，
    // 如果浏览器支持过渡或动画事件， fired 会在回调执行时设置成 true， setTimeout 的回调函数不会再重复执行。
}

if(duration <= 0 ) setTimeout(function () {
    that.each(function () {wrappedCallback.call(this)})
},0)
````

Zepto检测动画兼容性

````
if(element.style.transform === undefined)
    //检测私有实现，记录前缀
       element.style[prefix+'TransitionProperty']


if(element.style.transitionProperty === undefined &&
element.style.webkitTransitionProperty === undefined)
 //不支持动画
````