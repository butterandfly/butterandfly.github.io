# LEVEL 1: 使用自定义组件

> 你会在这个level里学到：
>
> - 怎么使用自定义组件（custom element）

## 故事
每天晚上10点都去的那家“Star Bar”酒吧的老板得知你是一个程序员后，想你帮他做一个酒吧的app。  
念在在这酒吧泡过不少女孩的份上，你决定勉为其难地帮一下。  
但跟其他甲方一样，他也有些“特殊”的要求：你要用polymer，并结合当下流行的“Custom Element”技术，来实现这个app。而且他已经创建了最基本的`<star-bar>`，你需要在这个元素基础上去扩展。

虽然你暗骂了几声娘，但最后还还是乖乖地拿走了他的代码，并打开了你的小米笔记本。在开始修改这个`<star-bar>`之前，你需要先看看这元素究竟长什么样子。

## 需求

- 在代码最下方使用`<star-bar>`元素

### 如何使用自定义组件
自定义组件（元素）的使用跟浏览器自带元素的使用是一样的。假如我们这里有一个`<my-element>`，你可以把它随意地放置：

```html
<div>
  <p>Hello!</p>
</div>
<div>
  <my-element></my-element>
</div>
```

需要注意，所有的自定义组件元素都必须要闭合，而不能像这样：

```html
<!-- 错误使用 -->
<my-element />
```