# 浏览器本地存储
本文主要介绍localStorge以及sessionStorge两个本地存储的解决方案

## localStorge
localStorge是浏览器存储中最常见的一种方法，它是存在于全局对象window上：`window.localStorge`
它的特点是：
1. **持久化存储**（除非用户手动清除、或者删除浏览器的缓存记录等等），会一直存在于设备当中。
2. 以**键值对**的方式进行存储，键值均只允许**字符串格式**，整数键将自动转换为字符串。

[MDN：localStorge](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)

API有以下几种：

```javascript
// 添加数据
localStorage.setItem("myCat", "Tom");

// 读取数据
let cat = localStorage.getItem("myCat");

// 删除某个特定数据项
localStorage.removeItem("myCat");

// 移除所有数据项
localStorage.clear();

// 根据索引获取键名
localStorage.key(0);

// 返回localStorge的长度（存储的参数个数）
localStorage.length()

// 返回localStorge实例对象，包含了全部属性
localStorage.valueOf()

```

其中，`setItem`方法用于设置特定的键值对，除此之外，还可以采用直接申明的方式（效果是一样的）：
`getItem`方法同理

```javascript
localStorage.colorSetting = "#a4509b";
localStorage["colorSetting"] = "#a4509b";
localStorage.setItem("colorSetting", "#a4509b");
```

## sessionStorge

sessionStorge的用法和local基本完全一致，它们的区别在于存储的有效期。

- localStorege：永久有效（除非手动清除）
- sessionStorege：仅在会话期间有效（当前浏览器标签页关闭，会话就消失）

## 存储容量比较
`localStorege`和`sessionStorege`两者的容量均在**5MB**左右，具体可能因为浏览器的机制不同而表现不同。
不过这相比于，cookie来说已经是足够大了，一般情况下我们存储数据都能满足要求。

## 同步
`localStorege`和`sessionStorege`两者都是同步的，<u>操作会立即执行并阻塞现有的进程</u>。

## 区别
local和session适合存储一些比较小、短时间内经常会变动的数据，indexedDB适合存储一些比较大、长时间内需要存储的数据。

## browser-localstorge 🔥🔥🔥
这是一款浏览器本地存储化工具包，支持`localStorege`、`sessionStorege`和`indexedDB`三种方式。为本人自主开发。
可前往[npm](https://www.npmjs.com/package/browser-localstorge)查看。