# LEVEL :

> 你会在这个level里学到：
>
> - 声明元素的property，并赋予其默认值

## 故事
早上酒吧老板微信你，让你晚上早点去酒吧。   
不用猜肯定又是app有需求了。   

“那句欢迎词有点问题，毕竟我们的客人不少是老外。我觉得应该将那段欢迎语改成英文的'Welcome to Star Bar!'。”  
这个倒简单。  
“哦对了，当然也是直接将其改为property，然后单向绑定咯。”  
嘻嘻，有了上次的经验后，这个也难不倒你。

## 需求

- 声明一个名为welcomeWords的property，String类型，初始值为'Welcome to Star Bar!'

### Property#2
我们可以在注册元素时修改`properties`的值来声明property，最简单的声明像这样：

```javascript
properties: {
  username: String
}
```

上面你声明了一个名为username的property，且这个property的类型为`String`（注意是String不是string，前者是一个class）。  
如果你希望对这个property设置更多功能，如获得一个默认值，则可以像这样：

```javascript
properties: {
  username: {
    // 类型为String
    type: String,
    // 有一个初始值为'Admin'
    value: 'Admin'
  }
}
```

声明一个property后能获得很多方便的功能，到现在为止我们使用过的包括：

- 设置默认值
- 单向绑定