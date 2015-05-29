---
layout: article
title: 理解进程替换（Process Substitution）
---

## 从read说起
在学习read命令的时候，我们总会遇到这么一总情形：

```
# 我们希望把hi通过pipe传进read里
$ echo “hi” | read
# 然后通过查看$REPLY来确定，却发现没有REPLY依然为空
$ echo $REPLY
```

每一本书都会告诉我们，通过pipe把值传进read中是不起作用的。原因在于，使用pipe时会创建一个subshell，所以read对变量$REPLY的赋值在subshell里。

那么，我怎么把另一个命令执行的结果传到read里呢？别忘了，read读取的是stdin；任何一个文件都可以成为stdin：

```
# 将hi写入文件
$ echo hi > test
# 通过重定向，使read读取文件的内容
$ read < test
# $REPLY将会是hi
$ echo $REPLY
```

所以，只要把一个命令的结果写进文件，如`ls > filename`，再通过上面方式就能把值赋给$REPLY，实现了一开始的管道功能。简单来说是这样：

* 将命令的执行结果写进文件
* 用read从文件里读取内容
* 删除这个作为中间存储器的文件

而进程替换，实际上是一个实现了该功能的语法糖。

## 什么是进程替换
可参考：http://tldp.org/LDP/abs/html/process-sub.html

```
<(命令)
>(命令)
```

里面的`<()`其实就是一个文件（不管里面的命令如何改变），其角色就是上文中的test文件（中间存储器）：

```
$ echo <(echo hi) # 显示为/dev/fd/63
$ ls -l <(echo hi) # 查看该文件信息
$ cat <(echo hi) # 显示hi，该文件的内容是括号内命令的输出
```

所以，回到我们的read命令，现在有了一个更简洁的方法：

```
$ read < <(echo hi)
```

这就是进程代替。
