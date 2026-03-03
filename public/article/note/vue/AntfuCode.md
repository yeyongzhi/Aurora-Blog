# 跟着 Antfu 学Vue
在 Vue 生态中，Antfu（Anthony Fu）的代码以极简、高效、类型友好著称。你是否还在为 ref 与 reactive 的取舍而内耗？本文深入剖析 Antfu 的“代码百宝箱”，提炼出一套现代 Vue 开发规范：从“全员 Ref”的一致性哲学，到 shallowRef 的性能优化，再到 defineModel 的极简通信。带你走出“能用就行”的误区，掌握像 VueUse 一样优雅的编码艺术。

## 1.心智模型的大一统————“全员 Ref”
在开发的第一步，定义变量的时候，全部统一一把梭，使用`ref`定义所有变量
这有两个好处
1. 一致性：所有变量都使用`ref`定义，避免了在不同场景下使用`ref`和`reactive`的不一致问题
2. 认知优势：看到变量就知道需要通过`.value`来访问或修改变量的值；看到解构就知道需要通过`toRefs`来访问解构后的变量(来保持响应式)

## 2.精准的控制响应式：放过那些庞大的第三方实例————shallowRef
Vue的响应式非常强大，但是如果不节制的使用就会导致性能上面的一系列问题
例如，将Echarts实例、或者大量的JSON数据塞进`ref`中，就会导致vue去递归代理每一层属性
这时候就需要使用`shallowRef`来定义这些变量，这样就可以避免性能问题

shallowRef 只会 监听 `.value` 这个属性的变化，不会递归监听属性的变化，能够大幅提升性能
适用于：地图实例、图表实例、JSON数据等

## 3.Props 与 Model：让组件像原生函数一样自然
`defineModel` 是 `Vue 3.4+（从 v3.4.0-alpha.1 开始）`引入的一个 `编译宏（compile-time macro）`，用于简化组件的双向绑定（v-model）逻辑。它让你无需手动声明 `props` 和 `emit`，就能直接在子组件中读写父组件传入的 v-model 值。

```vue
<template>
  <input v-model="model" />
</template>

<script setup>
// 定义一个名为 model 的双向绑定值
const model = defineModel()
// 或带默认值
// const model = defineModel({ type: String, required: true })

// 多个model
// const title = defineModel('title')
// const count = defineModel('count')
</script>
```
上面的代码经过编译后，就会得到：
- 声明一个props `modelValue`
- 声明一个emit `update:modelValue`
- `model` 是一个 `ref`，读取时是 `props.modelValue`，赋值时触发 `emit('update:modelValue', newValue)`

## 4.组件式函数核心法则：灵活兼容MaybeRef
- 不优秀的封装：强迫用户必须传入`ref类型`的变量
- 优秀的封装，允许用户传入`ref类型`的变量，也允许用户传入`普通变量`，也允许`Getter函数`

> 这是 Antfu 风格中实现“通用 Hook”的关键技巧：**既能接收静态值，也能响应动态源**。

比如你在写一个 useLocalStorage Hook：
```javascript
function useLocalStorage(key: string, initialValue: MaybeRefOrGetter<any>) {
  const value = ref(toValue(initialValue))
  
  watchEffect(() => {
    const val = toValue(initialValue)
    if (val !== value.value) {
      value.value = val
    }
  })

  // ... 其他逻辑
}
```
这样用户就可以灵活使用：
```javascript
// 方式1：直接传值
useLocalStorage('theme', 'dark')

// 方式2：传 ref
const theme = ref('light')
useLocalStorage('theme', theme)

// 方式3：传 getter（如 props）
useLocalStorage('name', () => props.username)
```

## 5.组件的泛型与自动导入(Vue 3.3+)
假设你想写一个通用的 `List 组件`，能自动推导**列表项类型(ItemType)**：
```vue
<!-- List.vue -->
<script setup lang="ts" generic="T">
defineProps<{
  items: T[]
}>()

// 现在 `item` 的类型是 T！
</script>

<template>
  <div v-for="item in items" :key="item.id">
    {{ item }}
  </div>
</template>
```
父组件在使用的时候：
```Vue
<template>
  <List :items="users" />
</template>

<script setup lang="ts">
import List from './List.vue'

const users = ref([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
])
// TypeScript 自动推导 T = { id: number; name: string }
</script>
```
> 此时 `List 组件`内部的 `items` 类型就是 `{ id: number; name: string }[]`，无需手动指定！

你还可以对泛型加约束：
```vue
<script setup lang="ts" generic="T extends { id: number }">
defineProps<{
  items: T[]
}>()
</script>
```
这样调用时如果传入的对象没有 `id: number`，TS 会报错。