# js Doc 规则语法
[jsdoc-中文网](https://jsdoc.bootcss.com/)

## 概念
`JSDoc`是一个用于 **JavaScript的API文档生成器**，类似于 Javadoc 或 phpDocumentor。
可以将文档注释直接添加到源代码中。JSDoc 工具将扫描您的源代码并为您生成一个 HTML 文档网站。

通过本篇文章可以快速了解到一些jsdoc的语法、规则，以便于我们在构建组件库或者写文档的时候更加得心应手~

## 常用语法
### 1.基础注释
平常我们写一个方法，该不会还有人这么写注释吧？
```javascript
// This is a description of the foo function.
function foo() {
}
```

用`//`来写注释的话可读性比较差，而且功能不够全面，有必要进行规范化。例如一个最基础的**函数注释**，在jsdoc中可以写成：
```javascript
/** This is a description of the foo function. */
function foo() {
}
```

当然我们还可以通过JSDoc标签来添加更多的信息。例如，某个函数是类的构造函数，则可以通过添加`@constructor`标记来表示：

```javascript
/**
 * Represents a book.
 * @constructor
 */
function Book(title, author) {
}
```

使用标签来添加更多的信息：

```javascript
/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author) {
}
```

OK下面我们详细讲解一下语法规则

### 2.函数方法(@param、@returns)
`@param`申明**参数名及其类型**
`@returns`申明**返回值及其类型**

```javascript
/**
 * 求两数之和
 * @param {number} a 其中一个数
 * @param {number} b 另一个数
 * @returns {number} 两个数之和
 */
function sum(a, b) {
  return a + b;
}
```

### 3.捕获抛出错误Error（@throws）
在上面的`sum()`函数中，当参数a或者b不为`number`类型的时候，会导致函数出错，因此我们需要捕获这类错误并抛出~
在JSDoc中采用`@throws {ErrorType} ...`来捕获错误，如下所示：

```javascript
/**
 * 求两数之和
 * @param {number} a 其中一个数
 * @param {number} b 另一个数
 * @returns {number} 两个数之和
 * @throws {TypeError} 如果 a 或 b 不是数字，则抛出错误
 */
function sum(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('参数 a 和 b 必须是数字');
    }
    return a + b;
}
```

> 不要问这里的TypeError是什么，这是js的内置错误类型之一，可直接使用~

### 4.描述信息(@description)
在上面的`sum()`函数中，**求两数之和**相当于是这个函数的描述信息，用来说明这个函数是干嘛的
描述信息（description）可以直接写在注释的开头，也就是第一行。
也可以，写成`@description 求两数之和`这样的格式，两者等效。但是我们一般都建议，写成@description的形式，规范性更强一些。

```javascript
/**
 * @description 求两数之和
 * @param {number} a 其中一个数
 * @param {number} b 另一个数
 * @returns {number} 两个数之和
 * @throws {TypeError} 如果 a 或 b 不是数字，则抛出错误
 */
export function sum(a: number, b: number) {
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new TypeError('参数 a 和 b 必须是数字');
    }
    return a + b;
}
```

### 5.定义复杂类型(@typedef)
当我们的函数方法需要**各种复杂的参数**（比如<u>配置项</u>等），就需要定义较为复杂的对象参数了。

```javascript
/**
 * 学生初始化参数
 * @typedef {Object} StudentOptions
 * @property {string} name 学生姓名
 * @property {number} age 学生年龄
 */

/**
 * @description 创建学生对象
 * @param {StudentOptions} options - 学生对象的初始化参数
 */
export function createStudent(options) {
    ...
}

createStudent({ name: '张三', age: 18 })
```

再举一个例子：

```javascript
/**
 * @typedef {Object} CloudServer
 * @property {string} id - 服务器ID
 * @property {string} name - 服务器名称
 * @property {string} region - 服务器所在地域
 * @property {string} status - 服务器状态
 */

/**
 * 获取云服务器列表
 * @returns {Array<CloudServer>} 云服务器列表
 */
function getCloudServers() {
  // 获取云服务器列表的实现
}
```

这个语法(`@typedef`)在我看来是**非常有用**的、**使用频率很高**的一个注释类型标签。
## 生成网站