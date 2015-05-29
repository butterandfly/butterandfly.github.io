---
layout: article
title: Async（nodejs）实战
---

```
原文：http://www.sebastianseilund.com/nodejs-async-in-practice
```


在开始使用node.js和async的时候我找不到好的资源讲解怎么使用async包。而这就是我写这文章的原因。

### 什么是异步解决？一种反模式
Async和其他类似的node.js流程控制模块寻找一种简化以下代码的方法：

```
//DON'T DO THIS AT HOME!
app.get('/user/:userId', function(req, res, next) {
    var locals = {};
    var userId = req.params.userId;
    var callbackCounter = 0;
    var gotError = false;
    db.get('users', userId, function(err, user) {
        if (gotError) {
            return;
        }
        if (err) {
            gotError = true;
            return next(err);
        }
        locals.user = {
            name: user.name,
            email: user.email,
            bio: user.bio
        };
        callbackCounter++;
        if (callbackCounter == 2) {
            res.render('user-profile', locals);
        }
    });
    db.query('posts', {userId: userId}, function(err, posts) {
        if (gotError) {
            return;
        }
        if (err) {
            gotError = true;
            return next(err);
        }
        locals.posts = posts;
        callbackCounter++;
        if (callbackCounter == 2) {
            res.render('user-profile', locals);
        }
    });
});
```

因为这两个数据库的调用是异步的，我们不知道那一个会先完成。所以必须用callbackCounter来跟踪多少个任务完成了。如果有错误发生我们要在每个任务中用特殊的方式来处理。这就使得我们的代码出现重复。

然后如果想添加多一个异步任务呢？我们需要改变`if (callbackCounter == 2)`为`if (callbackCounter == 3)`，这就使维护的时候变得非常繁琐。

这就是async出现的原因——为了使这种代码变得更加简单和清晰。这文章里我会告诉你怎么在实战中使用async。

### 重点：callbacks和errors

在我刚开始使用async的时候，我没很好理解callbacks的使用方式。

通常async的方法需要一些任务作为参数。这些任务可以是function的数组，或一些迭代的集合。每个任务都会得到一个callback方法，我们先称这为task callback。这些callback必须在任务完成的时候调用，例如在数据库的异步调用完成后调用。

除了这些任务，async的方法还需要另一个callback方法作为参数，我们称之为final callback。这个final callback会在所有的任务都结束后调用。

例子：

```

async.parallel([
    function(callback) { //This is the first task, and callback is its callback task
        db.save('xxx', 'a', function(err) {
            //Now we have saved to the DB, so let's tell async that this task is done
            callback();
        });
    },
    function(callback) { //This is the second task, and callback is its callback task
        db.save('xxx', 'b', callback); //Since we don't do anything interesting in db.save()'s callback, we might as well just pass in the task callback
    }
], function(err) { //This is the final callback
    console.log('Both a and b are saved now');
});
```

如果一个任务过程中遇到error，你应调用task callback并将error对象作为第一个参数。

当带error参数的task callback被调用是，final callback会得到该error对象并立即调用，且不会开始尚未开始的任务。

例子：

```
async.parallel([
    function(callback) {
        db.save('xxx', 'a', function(err) {
            if (err) {
                callback(err);
                return; //It's important to return so that the task callback isn't called twice
            }
            callback();
        });
    },
    function(callback) {
        db.save('xxx', 'b', callback); //If we just pass in the task callback, it will automatically be called with an eror, if the db.save() call fails
    }
], function(err) {
    if (err) {
        throw err; //Or pass it on to an outer callback, log it or whatever suits your needs
    }
    console.log('Both a and b are saved now');
});
```

那4行的错误处理看起来有点繁琐。我通常写成一行：

```
if (err) return callback(err);
```

### 这文章会用到那些模块
下面的例子中我会用到以下的node模块：

* `async`（废话）。在你的代码中应该通过`var async = require('async');` 引入。
* Express.js会用作http服务器
* `db`是一个数据库模块。它包含`db.get(bucket, key, callback)`和`db.query(bucket, properties, callback)`等方法来支持所有正常的NoSQL数据库。
* Underscore.js，别名`_`。

现在我们开始这些有趣的内容吧！

### 我需要运行多个独立的任务，当全部都完成后需要做某些事情。
你应该使用[async.parallel](https://github.com/caolan/async#parallel)。

这例子会读取论坛用户的详细信息和他发表的文章列表。

通过input得到用户ID，我们就能很容易地单独地获得用户信息和文章列表。

```
app.get('/user/:userId', function(req, res, next) {
    var locals = {};
    var userId = req.params.userId;
    async.parallel([
        //Load user
        function(callback) {
            db.get('users', userId, function(err, user) {
                if (err) return callback(err);
                locals.user = {
                    name: user.name,
                    email: user.email,
                    bio: user.bio
                };
                callback();
            });
        },
        //Load posts
        function(callback) {
            db.query('posts', {userId: userId}, function(err, posts) {
                if (err) return callback(err);
                locals.posts = posts;
                callback();
            });
        }
    ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
        if (err) return next(err); //If an error occured, we let express/connect handle it by calling the "next" function
        //Here locals will be populated with 'user' and 'posts'
        res.render('user-profile', locals);
    });
});
```

如果你有更多的任务需要运行，只需要添加到任务数组中。

### 我需要运行一些有依赖关系的任务，任务都结束后执行其他事情
那你需要用[async.series](https://github.com/caolan/async#series)。

我们再次用回刚才论坛用户的例子。

这一次我们得到用户的名字，而数据模型则和刚才的一样。这意味着我们需要找到用户id，才能得到该用户的文章。

```
    app.get('/user/:name', function(req, res, next) {
        var locals = {};
        var name = req.params.name;
        var userId; //Define userId out here, so both tasks can access the variable
        async.series([
            //Load user to get userId first
            function(callback) {
                db.query('users', {name: name}, function(err, users) {
                    if (err) return callback(err);
                    //Check that a user was found
                    if (users.length == 0) {
                        return callback(new Error('No user with name '+name+' found.');
                    }
                    var user = users[0];
                    userId = user.id; //Set the userId here, so the next task can access it
                    locals.user = {
                        name: user.name,
                        email: user.email,
                        bio: user.bio
                    };
                    callback();
                });
            },
            //Load posts (won't be called before task 1's "task callback" has been called)
            function(callback) {
                db.query('posts', {userId: userId}, function(err, posts) {
                    if (err) return callback(err);
                    locals.posts = posts;
                    callback();
                });
            }
        ], function(err) { //This function gets called after the two tasks have called their "task callbacks"
            if (err) return next(err);
            //Here locals will be populated with 'user' and 'posts'
            res.render('user-profile', locals);
        });
    });
```

在这例子你似乎没得到多少便宜，是因为你只有两个任务要执行。上面这例子是下面这段无async版本的简化：

```
    app.get('/user/:name', function(req, res, next) {
        var name = req.params.name;
        db.query('users', {name: name}, function(err, users) {
            if (err) return next(err);
            if (users.length == 0) {
              return callback(new Error('No user with name '+name+' found.');
            }
            var user = users[0];
            db.query('posts', {userId: user.id}, function(err, posts) {
                if (err) return next(err);
                locals.posts = posts;
                res.render('user-profile', {
                    user: {
                        name: user.name,
                        email: user.email,
                        bio: user.bio
                    },
                    posts: posts
                });
            });
        });
    });
```

但如果你需要运行3或更多任务呢？你需要像煮意大利面那样结束这些回调（烂）。

在我看来，在只有两层的时候两种方案都可以使用。如果更多的话，则一定要用async.series。

### 我需要遍历一个集合，对每一个元素执行一个异步任务；所有任务完成后执行某些东西。

你需要使用[async.forEach](https://github.com/caolan/async#forEach)。

下面例子是一个网站，支持在一个请求里删除多个消息。你从url中的逗号分割的字符串中得到所有消息的ID。当所有删除都完成后你要向用户返回一个response。

```
    app.delete('/messages/:messageIds', function(req, res, next) {
        var messageIds = req.params.messageIds.split(',');
        async.forEach(messageIds, function(messageId, callback) { //The second argument (callback) is the "task callback" for a specific messageId
            db.delete('messages', messageId, callback); //When the db has deleted the item it will call the "task callback". This way async knows which items in the collection have finished
        }, function(err) {
            if (err) return next(err);
            //Tell the user about the great success
            res.json({
                success: true,
                message: messageIds.length+' message(s) was deleted.'
            });
        });
    });
```

提示：如果你想遍历一个对象，这里有个更简单的方法。你只需要使用`Object.keys(o)` （或 `_.keys(o)`，如果你用Underscore.js），然后遍历keys：

```
    var trafficLightActions = {
        red: 'Stop',
        yellow: 'Wait',
        green: 'Go'
    }
    async.forEach(Object.keys(trafficLightActions), function(color, callback) { //The second argument (callback) is the "task callback" for a specific messageId
        var action = trafficLightActions[color];
        //Play around with the color and action
    }, function(err) {
        //When done
    });
```

### 我需要遍历一个集合，对每个元素执行异步任务，但同一时间里只允许执行x个，然后全部完成后执行其他东西

但如果你的数据库同时只允许有限的连接，而你的用户在一个请求里要删除上千个消息？这里你需要async.forEach的姐妹方法[async.forEachLimit](https://github.com/caolan/async#forEachLimit)。

async.forEachLimit需要3个参数：集合，并发数，遍历方法。并发数是一个整数，表示同时能执行最多多少个任务。假设我们的数据库同时只支持5个连接，然后我们可以简单地把代码改成：

```
    app.delete('/messages/:messageIds', function(req, res, next) {
        var messageIds = req.params.messageIds.split(',');
        async.forEachLimit(messageIds, 5, function(messageId, callback) {
            db.delete('messages', messageId, callback);
        }, function(err) {
            if (err) return next(err);
            res.json({
                success: true,
                message: messageIds.length+' message(s) was deleted.'
            });
        });
    });
```

如果你要处理很大的集合，使用forEachLimit是节流的一个很好的办法。

### 我需要遍历一个集合，对每个元素执行异步任务，但同一时间里只执行一个，全部完成后执行其他东西

async.forEach姐妹们中还有一个[async.forEachSeries](https://github.com/caolan/async#forEachSeries)，她其实就是并发数为1的async.forEachLimit。

在任务需要线性地执行时你会用到这方法。我暂时想不到用到这方法的实际情景，除了为i/o资源节流。

### 我需要执行一个任意集合的异步任务

你需要用[async.queue](https://github.com/caolan/async#queue)。

对比其他方法，async.queue的语法有点不一样。它需要两个参数：任务方法和并发数。

其中任务方法需要两个参数。第一个是任务执行时需要的东西，他可以是任何十五。第二个参数是一个task callback，需要在任务完成或出错时调用。

参数并发数的作用就如async.forEachLimit里，限制任务同时执行的数量。

async.queue返回一个对象，通过方法`queue.push(task)`你可以对queue添加任务。你可以在[Github page](https://github.com/caolan/async#queue)上查看该对象的其他属性。其中最有用的一个属性是`drain`。如果把一个方法赋值给该属性，则每次queue最后一个任务处理后都会调用该方法。通过该属性你可以在queue的工作全部完成后执行东西。这相当于async.queue的final callback。

一个使用queue的很好的例子是当你的输入源是一个流，而这很难用async.forEach来完成。下面这例子能复制所有[AWS S3](http://aws.amazon.com/s3/)上的对象。因为AWS最多只让你每次列出1000个对象，你不能一次性地得到所有对象名字。你必须每次列1000个，然后用这1000个的最后一个作为标志来发送下一个请求（就像分页一样）。当然你可以选择先把所有对象名都存到一个数组里，但这样你就必须等所有对象名都读取成功后才开始复制——而这是浪费时间。

更聪明的方法是使用async.queue，每当得到列表后就向queue添加。一个queue任务可以是任何东西。在这例子里一个S3对象名是一个任务。

现在让我们看一下代码。在这例子里我会使用[Apps Attic](http://appsattic.com/)'s [awssum](https://github.com/appsattic/node-awssum)模块的API（awssum这名字真是awesome...）。

```
    //Prepare S3 access and bucket names
    var awssum = require('awssum');
    var s3 = new awssum.load('amazon/s3').S3({
        accessKeyId: '...',
        secretAccessKey: '..',
    });
    var sourceBucket = 'old-bucket';
    var destinationBucket = 'new-bucket';
    var listObjectsDone = false;

    //Set up our queue
    var queue = async.queue(function(objectName, callback) {
        //This is the queue's task function
        //It copies objectName from source- to destination bucket
        var options = {
            BucketName: destinationBucket,
            ObjectName: objectName,
            SourceBucket: sourceBucket,
            SourceObject: objectName
        };
        s3.CopyObject(options, function(err) {
            if (err) throw err;
            callback(); //Tell async that this queue item has been processed
        });
    }, 20); //Only allow 20 copy requests at a time
    //When the queue is emptied we want to check if we're done
    queue.drain = function() {
        checkDone();
    };

    //Define the function that lists objects from the source bucket
    function listObjects(marker) {
        var options = {
            BucketName: sourceBucket,
            Marker: marker,
            MaxKeys: 1000
        };
        s3.ListObjects(options, function(err, data) {
            if (err) throw err;
            var result = data.Body.ListBucketResult;
            var contents = _.isArray(result.Contents) ? result.Contents : [result.Contents]; //AWS sends an array if multiple, and a single object if there was only one result
            _.each(contents, function(item) {
                var objectName = item.Key;
                marker = objectName; //Save the marker
                queue.push(objectName); //Push the object to our queue
            });
            if (result.IsTruncated == 'true') {
                //The result is truncated, i.e. we have to list once more from the new marker
                listObjects(marker);
            } else {
                listObjectsDone = true; //Tell our routine that we don't need to wait for more objects from S3 
                checkDone();
            }
        });
    }

    //This function gets called when a) list didn't return a truncated result (because we were at the end), and b) when the last task of the queue is finished
    function checkDone() {
        if (queue.length() == 0 && listObjectsDone) {
            console.log('Tada! All objects have been copied :)');
        }
    }

    //Start the routine by calling listObjects with null as the marker
    listObjects(null);
```

注意queue可能会出现drained状态，所以queue.drain()也可能会多次调用。例如当复制操作快于列表操作时。这就是为什么我们使用了`listObjectsDone`变量。即使queue变为空，也需要查看`listObjectsDone`来确定任务真的完结。

另外要注意，每个任务的task callback不支持error参数。例如：

```
    var counter = 0;
    var queue = async.queue(function(shouldFail, callback) {
        counter++;
        console.log(counter);
        if (shouldFail) {
            callback(new Error('An error just for fun.')); //Nobody will handle this error
        } else {
            callback();
        }
    }, 1);
    queue.push(false);
    queue.push(true);
    queue.push(false);

```

我期待的是输出1和2，然后是错误。但实际这里的输出是1，2，3。

哪天我有空了会看看是否能协助向async添加这么一个支持。

### 组合：我需要执行一些并联任务、串联任务和遍历一个集合并对每个元素执行异步任务。

你会用到[async.parallel](https://github.com/caolan/async#parallel)，[async.series](https://github.com/caolan/async#series)，和[async.forEach](https://github.com/caolan/async#forEach)的组合。

该例子我们需要读取一个论坛用户（通过名字）的文章和图片。数据结构跟前文一样，在并联地读取文章和图片前我们需要先通过名字得到用户ID。而且我们需要检测是否每张图片都存在。

```
    app.get('/user/:name', function(req, res, next) {
        var locals = {};
        var name = req.params.name;
        var userId;
        async.series([
            //Load user to get userId first
            function(callback) {
                db.query('users', {name: name}, function(err, users) {
                    if (err) return callback(err);
                    //Check that a user was found
                    if (users.length == 0) {
                        return callback(new Error('No user with name '+name+' found.');
                    }
                    var user = users[0];
                    userId = user.id; //Set the userId here, so the next tasks can access it
                    locals.user = {
                        name: user.name,
                        email: user.email,
                        bio: user.bio
                    };
                    callback();
                });
            },
            //Load posts and photos in parallel (won't be called before task 1's "task callback" has been called)
            function(callback) {
                async.parallel([
                    //Load posts
                    function(callback) {
                        db.query('posts', {userId: userId}, function(err, posts) {
                            if (err) return callback(err);
                            locals.posts = posts;
                            callback();
                        });
                    },
                    //Load photos
                    function(callback) {
                        db.query('photos', {userId: userId}, function(err, photos) {
                            if (err) return callback(err);
                            locals.photos = [];
                            //Iterate over each photo
                            async.forEach(photos, function(photo, callback) {
                                fs.exists(photo.path, function(exists) {
                                    //Only add the photo to locals.photos if it exists on disk
                                    if (exists) {
                                        locals.photos.push(photo);
                                    }
                                    callback();
                                });
                            }, callback);
                        });
                    }
                ], callback); //Remember to put in the second series task's "task callback" as the "final callback" for the async.parallel operation
            }
        ], function(err) { //This function gets called after the two series tasks have called their "task callbacks"
            if (err) return next(err);
            //Here locals will be populated with 'user', 'posts' and 'photos
            res.render('user-profile', locals);
        });
    });
```

你可以随心所欲地把async.parallel和async.series内嵌、组合在一起。一个不错的技巧是，将内嵌太深代码分割到不同的函数中。上面的代码可以写成这样：

```
    app.get('/user/:name', function(req, res, next) {
        var locals = {};
        var name = req.params.name;
        var userId;
        async.series([
            //Load user
            function(callback) {
                loadUserByName(name, function(err, user) {
                    if (err) return callback(err);
                    userId = user;
                    locals.user = user;
                });
            },
            function(callback) {
                async.parallel([
                    //Load posts
                    function(callback) {
                        loadPostsByUserId(userId, function(err, posts) {
                            if (err) return callback(err);
                            locals.posts = posts;
                            callback();
                        });
                    },
                    //Load photos
                    function(callback) {
                        loadPhotosByUserId(userId, function(err, photos) {
                            if (err) return callback(err);
                            locals.photos = photos;
                            callback();
                        });
                    }
                ], callback);
            }
        ], function(err) {
            if (err) return next(err);
            res.render('user-profile', locals);
        });
    });

    function loadUserByName(name, callback) {
        db.query('users', {name: name}, function(err, users) {
            if (err) return callback(err);
            //Check that a user was found
            if (users.length == 0) {
                return callback(new Error('No user with name '+name+' found.');
            }
            var user = users[0];
            locals.user = {
                name: user.name,
                email: user.email,
                bio: user.bio
            };
            callback(null, user);
        });
    }

    function loadPostsByUserId(userId, callback) {
        db.query('posts', {userId: userId}, function(err, posts) {
            if (err) return callback(err);
            callback(null, posts);
        });
    }

    function loadPhotosByUserId(userId, callback) {
        db.query('photos', {userId: userId}, function(err, photos) {
            if (err) return callback(err);
            var photos = [];
            async.forEach(photos, function(photo, callback) {
                fs.exists(photo.path, function(exists) {
                    if (exists) {
                        photos.push(photo);
                    }
                    callback();
                });
            }, function(err) {
                if (err) return callback(err);
                callback(null, photos);
            });
        });
    }
```

这样能是你的代码看起来更“扁平”。`app.get('/user/:name'...`部分的逻辑看起来也更可读，因为每个方法的名称都很好地描述了其功能。

这样你的同事也会更喜欢你。

以上就是我想阐述的全部。极其感谢[Caolan McMahon](http://caolanmcmahon.com/)制作了如此美妙的node.js模块。

如果你有什么留言或建议，我很乐意知道。

（完，原文：http://www.sebastianseilund.com/nodejs-async-in-practice）
