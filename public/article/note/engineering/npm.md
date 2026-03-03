# 前端工程化的基础——包依赖
它不仅是Node.js的包管理器，也是前端开发中用于管理项目依赖、运行脚本、发布包等任务的重要工具。

## 1.基础使用
首先，要确保我们的项目（系统）中已经存在node环境。在安装node环境的时候，`npm`一般会作为**附属物**一并下载安装。
我们可以使用`npm -v`来验证npm是否安装成功。

基础的npm常用功能主要包括：
- 创建项目
- 安装、更新、卸载、发布依赖（node_modules）
- 执行脚本
- ...

npm——常用命令
```javascript
npm update <package-name> // 更新指定包

npm info <package-name> // 查看指定包的详细信息

npm view <package-name> versions // 查看指定包的所有版本

npm config get registry // 查看当前npm的镜像源

npm config set registry https://registry.npmmirror.com // 切换npm镜像源
...

```

## 2.第三方npm
### cnpm
npm是来自npm.js官方镜像的安装依赖工具，因此网络可能会存在一些波动。cnpm是一个专门为国内用户开发的工具，作用等同于npm（完全一致），旨在**解决网络波动**等问题。
我们可以通过npm来安装cnpm（如下），然后就可以和npm一样使用cnpm（几乎全部命令都相同）
```
npm install -g cnpm
```

如果不想安装cnpm也可以通过配置npm的镜像源来加速下载，解决网络波动的问题：

```
npm config set registry https://registry.npmmirror.com
```

### pnpm（推荐）
pnpm是一种快速、高效且磁盘空间友好的包管理工具。它通过共享依赖来减少磁盘空间占用，并通过硬链接来加快安装速度。
采用了一种称为“**内容可寻址存储（CAS）**”的方式来存储依赖包，同时采用了**符号链接（软链接）**、**硬链接**。

通过npm来安装 pnpm：
```
npm install -g pnpm
```

同时，你也可以将pnpm的镜像地址切换到**淘宝源**：
```
pnpm config set registry https://registry.npmmirror.com
```

**接下去介绍CAS、符号连接与硬链接**

**1.内容可寻址存储（CAS）**
**省空间**：pnpm会维护一个全局的Store，所有下载过的依赖包都会以**唯一哈希值**的形式存储在此处。相同版本的依赖包，在这个Store中只存在一份，不同的项目共享这一份依赖。在这个Store中的依赖，被硬链接到了**项目的node_modules下的.pnpm**目录。

> 例如，一个包 lodash@1.0.0 会被存储为类似 lodash@1.0.0_abc123 的哈希目录。

**2.硬链接**
在项目中安装依赖的时候，pnpm不会将依赖包复制到项目中的node_modules中去，而是通过硬链接从全局Store中指向具体项目的`.pnpm`文件夹中。

**3.符号链接（软链接）**
在项目的`node_modules`下存放的真正依赖（package.json中的依赖项），其实就是一个软链接（目标是.pnpm文件夹）。

pnpm解决了传统npm的一些棘手问题：

1. 不再需要重复下载多个版本包，即便是在不同的项目中，也只需要一份存储在全局Store中的依赖包即可。有效的减少了网络请求、磁盘IO读取操作，提升了项目的加载速度。——省
2. pnpm也支持并行安装依赖，可以同时下载多个包，进一步提升了安装速度。——快
3. 能有效解决幽灵依赖的问题。——稳

> 幽灵依赖：当我们在安装依赖A的时候，如果依赖A同时也需要子依赖B，那么子依赖B也会被安装下来。即便我们的项目中（package.json）并没有进行显式声明。
那么就意味着，我们在项目中也能 `import from 'B'` 来使用。但是我们并没有指定我要安装依赖B。此时这种就被称为幽灵依赖。
出现这个问题的原因是因为，npm在安装依赖的时候，会把所有的依赖嵌套关系给舍弃，一股脑的展开在node_modules下。

### yarn


## 参考资料
[pnpm是怎么做到"又快又省又稳"](https://juejin.cn/post/7443866293755592742)
[聊一聊前端包管理中的幽灵依赖](https://zhuanlan.zhihu.com/p/685433254)


## 附：常用的镜像地址
```
官方源（npm registry）：https://registry.npmjs.org/
 
淘宝NPM镜像源：https://registry.npmmirror.com/
 
cnpm镜像源：http://r.cnpmjs.org/
 
阿里云NPM镜像源：https://npm.aliyun.com/
 
腾讯云NPM镜像源：https://mirrors.cloud.tencent.com/npm/
 
华为云NPM镜像源：https://mirrors.huaweicloud.com/repository/npm/
 
网易NPM镜像源：https://mirrors.163.com/npm/
 
中国科学技术大学开源镜像站：http://mirrors.ustc.edu.cn/npm/
 
清华大学开源镜像站：https://mirrors.tuna.tsinghua.edu.cn/npm/

```