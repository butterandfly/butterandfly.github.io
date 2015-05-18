---
layout: article
title: 使用httpie代替curl和wget
---

## 什么是httpie
github: https://github.com/jakubroztocil/httpie
httpie是一个命令行的http客户端。与经典的curl、wget一样，但提供更现代的特性。

## 特性
按照readme的说法，httpie吸引人的地方在于：
* 简洁的语法（原文是Expressive and intuitive syntax，有表达力的、符合人类直觉的语法）
* 输出内容经过格式化及上色（简单来说就是人类友好）
* 内置的JSON支持
* 支持HTTPS、代理和验证
* 任意的请求数据（request data）
* 可定制的头（headers）
* 持续的session
* Wget向的下载方式
* 支持python2.6、2.7和3.x
* 支持多平台（windows、mac、linux等）
* 支持插件
* 文档友好
* 测试覆盖

## 安装
具体的安装我不再重复，可参考github上的readme。

## 使用
readme里面有非常完整的文档，在此我不一一细述；下面我详细介绍一下其优越的地方。

### 人类友好
readme的开头有一个对比图片，分别是使用curl和httpie的例子。从两个图片我们很容易地看出：
* http需要的参数非常简洁
* 输出结果不再是黑白电影

单纯get一个地址的内容：

```
$ http httpie.org
```

如果你想用put的METHOD，同时定制头部和提交JSON数据，也不会复杂：

```
$ http PUT example.org X-API-Token:123 name=John
```

### 内置json
如上一个例子，在没特殊说明的情况下，会提交json数据：

```
$ http PUT example.org name=John
```

如果你想提交form数据，则可以加上参数`-f`或’—form’；这样会使header中的Content-Type设置为application/x-www-form-urlencoded：

```
$ http -f POST example.org hello=World
```

### 使用验证（authentication）
向github提交一个comment

```
$ http -a USERNAME POST https://api.github.com/repos/jakubroztocil/httpie/issues/83/comments body='HTTPie is awesome!'
```

### 使用代理

```
$ http --proxy=http:http://user:pass@10.10.1.10:3128 example.org
```

### HTTPS

跳过验证：
```
$ http --verify=no https://example.org
```

### 定制输出内容
httpie可以指定输出内容：
* `-h`或`--headers`，只输出response的headers
* `-b`或`—body`，只输出response的body
* `-v`或`—verbose`，同时输出request和response的全部内容
* `-p`或`—print`，选择你想输出的特定内容

## 后续
以后使用的过程中我会继续完善这篇文章，有什么看法也希望大家积极提出，谢谢。
