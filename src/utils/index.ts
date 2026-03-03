export function openTab(url: string) {
    window.open(url)
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 根据路径获取markdown文件内容
export async function getMarkDownContent(markdown_path: string) {
    let data = null
    try {
        const response = await fetch(markdown_path);
        const contentType = response.headers.get('Content-Type')
        // let lastModified = response.headers.get('Last-Modified') || new Date().toLocaleDateString();
        // lastModified = new Date(lastModified).toLocaleDateString('zh-CN', {
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit'
        // });
        // console.log(lastModified)
        if (!contentType?.includes("text/markdown")) {
            return null;
        }
        data = await response.text()
    } catch (err) {
        console.error("md文件读取出错")
        return null;
    }
    if (data && data.length > 0) {
        // const result = formatMarkDown(data)
        return data
    } else {
        return ""
    }
}

/**
 * 根据文章路径获取文章信息
 * @param {string} markdown_path 
 * @returns 
 */
export async function getMarkDownInfo(markdown_path: string) {
    let lastModified = null
    try {
        const response = await fetch(markdown_path);
        lastModified = response.headers.get('Last-Modified') || null;
        if (!lastModified) {
            return null;
        }
    } catch (err) {
        return null;
    }
    return lastModified
}

/**
 * 根据文章内容获取字数
 * @param content 
 */
export function getArticleTextCount(content: Array<any>) {
    let total = 0
    content.forEach((item: any) => {
        if(item.type.startsWith("h")) {
            total += item.content.trim().replace(/#/g, "").length
        }
        if(item.type === 'text') {
            total += item.content.length
        }
        if(item.type === 'code' || item.type === 'quote') {
            total += item.content.join("").length
        }
        if(item.type === 'link') {
            total += item.content[1].length
        }
    })
    return total
}

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

/**
 * 学生初始化参数
 * @typedef {Object} StudentOptions
 * @property {string} name 学生姓名
 * @property {number} age 学生年龄
 */

/**
 * @description 创建学生对象
 * @class
 * @param {StudentOptions} options - 学生对象的初始化参数
 */
export function createStudent(options: any) {
    console.log(options)
}

createStudent({ name: '张三', age: 18 }) // 正确