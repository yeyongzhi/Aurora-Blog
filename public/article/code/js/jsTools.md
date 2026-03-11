# 工具类函数

## 等待指定毫秒（sleep）

```javascript
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

## 检查设备是否为移动端

```javascript
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}
```

## 复制文本

```javascript
/**
 * 将指定文本复制到系统剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} - 成功返回 true，失败返回 false
 */
const copyToClipboard = async (text) => {
  if (!text) return false;

  // 现代浏览器：使用 Clipboard API（需 HTTPS 或 localhost）
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }
  }
```
