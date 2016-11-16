# LEVEL :

> 你会在这个level里学到：
>
> - 导入自定义组件
> - 使用自定义组件`<emoji-rain>`

## 故事
周末早上的天气总是特别好，而你竟然8点多就清醒过来了。   
你开始思考最近在写的`<star-bar>`。进展貌似不错，polymer也用得算是顺手。不过暂时还比较单调，要不要趁周末弄点炫酷的东西上去？
例如来点你最喜欢的emoji？

经过一番搜索后，你找到了一个名为["emoji-rain"](https://beta.webcomponents.org/element/notwaldorf/emoji-rain)的元素，demo看上去非常不错。
哦，竟然还是Monica写的。

## 需求

- 导入（import）“emoji-rain”组件，该组件的html文件在"/bower_components/emoji-rain/emoji-rain.html"
- 使用在`#rain-container`里使用emoji-rain元素
- 开启emoji-rain的`active`（将active属性[property]设置为true，可以直接在html设置）

### 导入组件
使用自定义组件之前，必须先导入自定义组件的定义文件（polymer的话通常是一个html）。  
如果你有较多的编程经验，你应猜得出，下面这句代码执行了“导入某个模块”逻辑：

```html
<link href="/bower_components/polymer/polymer.html" rel="import">
```

这其实是一个["HTML Imports"](https://www.w3.org/TR/html-imports/)：

- 使用link元素
- `rel`设置为"import"
- `href`设置你要导入的组件的路径

所以每当你要使用其他自定义组件、模块的时候，你都需要先导入组件。

> "HTML Imports"暂时只被Chrome实现，但在其他浏览器上可以使用polyfill（如webcomponents.js）来实现兼容，大家可以放心地在产品上使用。

### 使用自定义组件#2
之前我们已经学过要怎么使用自定义组件（`<star-bar>`），而这一次我们要使用的是`<emoji-rain>`：

```html
<emoji-rain drops="50" active></emoji-rain>
```