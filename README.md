# Linquebot

最初基于[oicq](https://github.com/takayama-lily/oicq)实现的多平台群聊机器人  
目前已支持tg、qq、本地（test）

> Linquebot是一个看起来很聪明的人工智障（？
> 这个实例名字定为琳酱

----

大家好w，这里是Linca和Senioria的女儿琳酱！

## 怎么安装琳酱呢？

首先 把琳酱的仓库克隆到本地w

```
git clone https://github.com/Lhcfl/Linquebot.git
```

然后，确保你的系统上安装了node.js

安装琳酱依赖的小东西w

```
npm install
```

修改settings.yml
```
cp settings.example.yml settings.yml
vim settings.yml
```

直接运行app.js!

```
node app.js
```

## 本地测试和平台切换

```
node app.js test
```

使用tg：

```
node app.js telegram
```

更多帮助请参见wiki
