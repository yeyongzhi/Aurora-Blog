# Vue3 面试题
## vue3 生命周期概览
[vue3生命周期官文](https://cn.vuejs.org/guide/essentials/lifecycle.html#lifecycle-diagram)
每个 Vue 组件实例在创建时都需要经历一系列的初始化步骤，比如设置好**数据侦听，编译模板，挂载实例到 DOM，以及在数据改变时更新 DOM**。
在此过程中，它也会运行被称为**生命周期钩子**的函数，让开发者有机会在特定阶段运行自己的代码。

> 请注意：这些钩子应当在组件初始化时被**同步注册**。请不要在异步调用栈中使用它们。

![组件实例生命周期](./images/vue3_1.png)

[组合式 API：生命周期钩子](https://cn.vuejs.org/api/composition-api-lifecycle)