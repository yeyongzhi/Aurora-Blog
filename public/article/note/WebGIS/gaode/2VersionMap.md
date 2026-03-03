# 同一个应用中加载双版本高德地图
## 项目背景
最近在一个项目中需要增加一个模块A，但是项目中已有一个模块B，B中引用的是高德地图的`v1.4.15`版本，如果说我的模块A也引用`v1.4.15`版本，版本的功能无法全部满足需求，因此我们可以得到两种解决办法：

1. 升级模块B中的高德地图版本到`v2.0`，但是这需要我们同步修改模块B中所有的代码，并且需要重新测试。
2. 同时加载两个版本的高德地图，在模块A中使用`v2.0`版本的高德地图，在模块B中还是使用原来`v1.4.15`版本的高德地图。
当模块B中的**代码量、功能点较多**的时候，升级模块B中的高德地图版本到`v2.0`是不现实的，因此我们选择了第二种方案。

## 解决办法
### 使用Loader加载
高德地图加载API方式：
[使用 JS API Loader加载（推荐）](https://lbs.amap.com/api/javascript-api-v2/guide/abc/load#t1)

基于这种API加载方式，我们需要在<u>模块之间切换</u>的时候，执行：

```javascript
window.AMap = null
AMapLoader.reset()
```

然后我们去加载对应版本的JS资源，并将结果赋值到`window.AMap2`上。`AMap2`可以是一个任意变量名，主要是为了与`AMap`区分开。
```javascript
AMapLoader.load({
    key: 'xxx',
    version: '2.0',
}).then(res => {
    window.AMap2 = res // 重新赋值
    resolve(true)
})
```
将上面两段代码结合起来，我们可以实现一个简单的**双版本高德地图**的切换：
```javascript
loadMapSource () {
    window.AMap = null
    AMapLoader.reset()
    return new Promise((resolve, reject) => {
        if (window.AMap2) {
            resolve(true)
        } else {
            AMapLoader.load({
                key: 'xxx',
                version: '2.0',
            }).then(res => {
                window.AMap2 = res
                resolve(true)
            })
        }
    })
},
```

### 使用script标签加载
核心思路基本一致，当切换版本的时候，**销毁之前加载某个js版本的记录**，然后**重新加载对应版本的js资源**。

参考代码：
```html
<script>
  window._AMapSecurityConfig = { securityJsCode: '73c21e805abce9f1a798bd4453a52994' }
</script>
<script src="https://webapi.amap.com/loader.js"></script>

<script>
  async function resetAMapCtx() {
    window.AMap = undefined
    window.AMapLoader = undefined
    document.querySelector('script[src*="webapi.amap.com/loader.js"]')?.remove()
    document.querySelector('script[src*="webapi.amap.com/maps"]')?.remove()

    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://webapi.amap.com/loader.js'
      document.body.appendChild(script)
      script.onload = () => resolve()
      console.log('Loader reset')
    })
  }
</script>

<script type="module">
  await window.AMapLoader.load({
    key: 'd9b0b89f7eb3ec5cf1ca02e8752ea742',
    version: '2.0'
  })
  const map01 = new window.AMap.Map('view01')
  console.log('AMap version:', window.AMap.version, map01)
  await resetAMapCtx()

  await window.AMapLoader.load({
    key: '3e8779d1bc53e17015af3cc6fa6a6ef6',
    version: '1.4.15'
  })
  const map02 = new window.AMap.Map('view02')
  console.log('AMap version:', window.AMap.v, map02)
  await resetAMapCtx()
</script>

<div style="display: flex; width: 900px; height: 450px; margin: 5% auto; border: 1px solid #2b4b6b">
  <div id="view01" style="flex: 1; height: 100%"></div>
  <div id="view02" style="flex: 1; height: 100%"></div>
</div>
```
## 总结反思
高德地图的JS API在各个版本之间的差异不小，如果强行要升级肯定会带来很多的问题、工作量。因此在初次开发的时候，尽量选择**版本较新的资源**进行开发，也便于后期的**迭代、维护**。
在代码中，尽量将**和地图有关的代码单独抽离**出来，便于后续的维护。