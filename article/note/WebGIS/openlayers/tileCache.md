# openlayers中瓦片缓存机制的实现——离线地图
## 背景
在项目开发中，碰到一个需求：离线地图的使用。在无网络环境下，普通的网络请求加载瓦片必然是行不通的，因此需要将瓦片离线缓存到设备中，然后再从设备中加载。
项目使用的是`Tauri`框架开发的`exe桌面应用`，因此可以直接将瓦片缓存到**本地文件系统**中。
如果是传统的web应用，也可以使用`IndexedDB`来存储瓦片。
两者的实现思路是完全一致的，只是存储的方式不同。

## 实现
最基础的一个思路就是：
1. 在正常网络环境下，每次`请求瓦片`时，将瓦片缓存到本地文件系统中，并记录瓦片的位置索引信息`（x,y,x）`。
2. 然后在每次瓦片渲染的时候，直接**从本地文件系统中加载瓦片**即可。

在瓦片的加载实现中，增加`tileLoadFunction`的方法实现、以及对瓦片资源监听tileloadend事件，在事件中进行缓存。请看下面的代码：

```javascript
const tileSource = new OlSource.XYZ({
    url: '/tiles/{z}/{x}/{y}.png',
    crossOrigin: 'anonymous',
    tileLoadFunction: async (imageTile, src) => {
        const { tileCoord } = imageTile
        const url = await getTile(tileCoord) // 根据瓦片的位置索引信息，从本地文件系统中加载瓦片
        imageTile.getImage().src = url || src // 这里的url指的是本地文件系统中的路径，src指的是网络请求的路径
    }
})

tileSource.on("tileloadend", (e) => {
    const { tileCoord, image_ } = e.tile
    const [z, x, y] = tileCoord
    const imgKey = `${z}_${x}_${y}`
    saveTile(image_, { tileCoord }) // 将瓦片缓存到本地文件系统中
    /* 这里的image_指的是瓦片的图片对象，tileCoord指的是瓦片的位置索引信息 */
})
```

## 总结反思
在这个项目中，还碰到一个需求任务：用户可以**手动选择缓存某个地区的瓦片**，以便于**在网络环境良好**的情况下，我**主动选择下载xx市区的地图**，等网络环境不好的时候，用户就可以自然的从本地读取之前下载好的瓦片，然后继续浏览地图了。
针对这种情况下的功能需求，实现思路是：
我们需要提前准备好各个地区的瓦片数据（比如杭州、上海），存放在服务器上，然后在用户选择缓存某个地区的瓦片的时候，我们需要**将该地区的瓦片数据下载到本地**，然后再从本地加载瓦片。

思考：如果没有提前把瓦片数据下载好放到服务器上，那么也许就需要通过<u>一定的算法，计算出某个地区的瓦片数据的位置索引信息</u>，然后在网络环境下载瓦片数据，然后再缓存到本地文件系统中。

## 💡附：leaflet版本
对于各家的地图引擎，基本都会有关于瓦片自定义缓存加载的方式，这里就以`leaflet`为例，实现一个简单的瓦片缓存加载方式。
当你使用其他地图引擎时，请更多的参考API文档~
```javascript
const map = L.map('map_container', {
    center: L.latLng(30.3, 120.2),
    zoom: 10
});

// 自定义瓦片
const layer = L.tileLayer('/tiles/{z}/{x}/{y}.png', { minZoom: 0, maxZoom: 10, async: true, crossOrigin: true });

layer.createTile = function (coords, done) {
    const tile = L.DomUtil.create('img', 'leaflet-tile');
    const { x, y, z } = coords;
    const img_key = `${z}_${x}_${y}`;
    localforage.getItem(img_key)
        .then(value => {
            if (value) {
                console.log("返回本地缓存瓦片：" + `${z}_${x}_${y}`)
                tile.src = value;
            } else {
                // 回退到网络请求
                tile.src = this.getTileUrl(coords);
            }
        })
        .catch(() => {
            tile.src = this.getTileUrl(coords);
        });
    tile.onload = () => done(null, tile);
    tile.onerror = () => done(new Error('Failed to load tile'), tile);
    return tile;
};

layer.addTo(map);
layer.on("tileload", async (e) => {
    // console.log(e)
    const { coords, tile } = e
    const { x, y, z } = coords
    const img_key = `${z}_${x}_${y}`
    const has = await getTile(img_key)
    if (!has) {
        console.log("存储本地瓦片：" + tile.src)
        const img = new Image();
        // 设置crossOrigin属性以允许跨域资源共享(CORS)，如果图片来自同一域名，则不需要此设置
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = async (e) => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const base64String = canvas.toDataURL("image/png");
            await saveTile(img_key, base64String)
        }
        img.src = tile.src
    }
})
```