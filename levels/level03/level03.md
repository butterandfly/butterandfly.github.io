# LEVEL 3: 单向绑定

> 你会在这个level里学到：
>
> - 将元素的property的内容绑定到html上

## 故事
老板对你上次完成的功能非常满意。   
他继续两眼发光地说：“听我一个朋友讲，'Star Bar'应该作为一个元素的property，然后单向绑定到html上。我觉得好像挺有道理的，要不你实现一下？”   
Property？单向绑定？貌似又是一堆很麻烦的东西...

当然你很好地掩饰了你的恐惧，微笑着对老板说：“当然没问题，哦这杯血腥玛丽麻烦帮我续一下。”

## 需求

- 将`appName`属性绑定到header的span里

### Property
Polymer可以让我们声明一个自定义元素的property，然后该property就能得到自动类型转换、监听改变、数据绑定等诸多功能。单向绑定当然也是其中一个。  
声明property的方式非常简单，如例子里：

```javascript
properties: {
  appName: {
    type: String,
    value: 'Star Bar'
  }
}
```

> 更详细的声明property的说明可查看[官方文档](https://www.polymer-project.org/1.0/docs/devguide/properties)。

### 单向绑定
Polymer可以让你的自定义元素的property单向绑定到html上，每当property的值发生改变时，html上的内容都会发生对应改变。  
单向绑定使用两个中括号，像这样：

```html
<!-- 这里的title必须是一个property -->
<h1>[[title]]</h1>
```