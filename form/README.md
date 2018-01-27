#Zepto与form

## multiple
h5新增属性multiple，据我所知有以下作用

- \<input type="file"  multiple="multiple">  可选多个文件
- \<select multiple="multiple">\</select> 用户按住ctrl/commond 可选多个选项

> 必须要这样写 \<input  multiple="multiple" />，这样写是无效的 \<input multiple />


## 提交表单

### 用户提交
用户提交表单三种方式，只要表单里的，input获得焦点，回车即可提交

````
    <input id="rBtn" type="submit" value="真提交">
    <button type="submit">真提交</button>
    <!--为什么用图片没有点击注不断提交？-->
    <input type="image" src="./TestPic.png">
````

### JS提交
`formELement.submit()`可提交表单，但并不会触发submit事件，如果要触发submit事件需要用到formElement.dispatchEvent(submitEvent)，当然用户点击submit按钮也是会触发submit事件的。需要注意的是submit事件发生在form元素上，并不是form元素内的按钮

````
	//*********************JS提交表单伪代码
	//注册监听
	formElemnt.addEventListener('submit',function(e){
		//如果需要阻止提交表单
		e.preventDefault()
	})
	//触发submit事件
    event = document.createEvent('Event')
    event.initEvent('submit',true,true)
    formElemnt.dispatchEvent(event)
    //提交
    formElemnt.submit()
````


