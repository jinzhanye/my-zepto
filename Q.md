1. Zepto中的eq(0)和first()方法哪个性能更好

first好，first直接取this[0]，而eq取this.slice(0,1)，对数组进行了浅克隆

1. 怎么去实现查找元素的find方法？
parent.find(child)，如果child是原生dom节点/或者Zpeto对象，则过滤出属于parent下的child