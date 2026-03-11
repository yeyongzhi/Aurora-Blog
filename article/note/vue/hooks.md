# Vue hooks收集
## 事件绑定、派发总线
```javascript
import { reactive } from 'vue';

export function useEvent() {
    const eventBus = reactive<{
        total: number;
        listener: Record<string, Array<Function>>
    }>({
        total: 0,
        listener: {}
    });

    const on = (event: string, callback: Function) => {
        if(!eventBus.listener[event]) {
            eventBus.listener[event] = [];
        }
        eventBus.listener[event].push(callback)
        eventBus.total++;
    };

    const emit = (event: string, data: any) => {
        if(!eventBus.listener[event]) {
            return false;
        }
        eventBus.listener[event].forEach(callback => {
            callback(data);
        })
    };

    return { on, emit };
}
```