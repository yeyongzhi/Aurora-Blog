import { type NoteTreeItem } from '@/types/Note'

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
        const path = (import.meta.env.NODE_ENV === "production") ? "/Aurora-Blog" + markdown_path : markdown_path
        const response = await fetch(path);
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
        const path = (import.meta.env.NODE_ENV === "production") ? "/Aurora-Blog" + markdown_path : markdown_path
        const response = await fetch(path);
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


// 查找文章路径
const findPath = (tree: Array<NoteTreeItem>, targetId: string) => {
    // 定义递归函数
    const traverse: any = (node: any, path: Array<any>) => {
        // 将当前节点的 id 添加到路径中
        const newPath = path.concat(node.key);

        // 如果当前节点是目标节点，返回路径
        if (node.key === targetId) {
            return newPath;
        }

        // 如果当前节点有子节点，递归遍历子节点
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                const result = traverse(child, newPath);
                if (result) return result; // 如果找到目标节点，返回路径
            }
        }

        // 如果当前节点不是目标节点且没有子节点，返回 null
        return null;
    }
    // 遍历树的根节点
    for (const root of tree) {
        const result = traverse(root, []);
        if (result) return result; // 如果找到目标节点，返回路径
    }

    // 如果遍历完整棵树都没有找到目标节点，返回 null
    return null;
}

export const getFullPath = (data: Array<NoteTreeItem>, path: string) => {
    const fullPath = findPath(data, path)
    return fullPath.join("/")
}

export function getMdPath(basePath: string, fullPath: string) {
    return `${basePath}/${fullPath}.md`
}

export async function getFetchData(url: string) {
    const fullPath = import.meta.env.BASE_URL + url.replace(/^\/+/, '');
    const res = await fetch(fullPath).then(response => response.json())
    return res
}