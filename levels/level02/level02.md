# LEVEL 2: 修改自定义组件的HTML

> 你会在这个level里学到：
>
> - 理解自定义组件的构成
> - 怎么修改自定义组件里的html

## 故事
看了半小时Polymer的官方指引后，你已经开始理解polymer这个东西了，于是便问老板现在需要写些什么功能。  
“'星酒吧'这名字我觉得有点low，应该直接使用我们的英文名'Star Bar'”，老板一本正经地回答你。  
麻痹'Star Bar'这名字明显就是抄星巴克好吗你竟然还敢放在最显眼的地方写代码没问题写low的代码也没问题但抄袭这种事情怎么能忍！   
老板貌似看出了点什么，递给你一杯黑啤，“请的”。

看着上面繁茂的气泡，你决定再次向这个物质的世界妥协。

## 需求

- 将`star-bar`里面header里的span的文字改为“Star Bar”

### dom-module
Polymer使用"dom-module"元素来定义自定义组件。从代码里你不难发现，一个自定义组件包含这3部分：

- css，在`template`里的style中编写
- html模板，在`template`里编写
- js，在script里编写

### 修改自定义组件的html模板
"template"元素里定义了一个自定义元素的模板，也是该元素创建后的内在结构。你可以尝试修改"template"的内容然后预览，看看页面会有什么变化。