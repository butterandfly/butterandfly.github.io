---
layout: article
title: 编写命令创建github博客文章
---

## 起因

使用github提供的github pages撰写博客是一个非常不错的选择。而按照jekyll的规定，在_post目录下创建文章必须执行一下操作：

* 文件名称要按照这样一种格式：`2015-05-20-the-title.md`
* 需要在该文件的开头写明如title、layout等信息

对于这一系列麻烦的操作，理所当然要让其自动完成，于是就写了以下这个bash文件。

## 代码

```
#! /bin/bash
# This script helps to create a post at my blog.

# title是使用命令时的第一个参数
title=$1;
# 日期使用date命令得到
date=`(date +%F)`;
# fullTitle是文件的名字
fullTitle="${date}-${title}.md";

#TODO: 判断是否已存在同名文件

header="---\nlayout: article\ntitle: \n---"
# 将header写进文件内（同时创建文件）
echo -e $header > $fullTitle;

# 成功退出
echo "${fullTitle} has been created.";
exit;
```

然后使用（当然你要更改执行权限并把代码放在$PATH下）：

```
$ create-post test-post
```
