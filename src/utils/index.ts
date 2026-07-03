import { type NoteTreeItem } from '@/types/Note'

export function openTab(url: string) {
    window.open(url)
}

export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 根据路径获取markdown文件内容和元信息（合并为一次请求，避免重复 fetch 同一文件）
export async function getMarkDownData(markdown_path: string): Promise<{
    content: string | null
    lastModified: string | null
}> {
    try {
        const fullPath = import.meta.env.BASE_URL + markdown_path.replace(/^\/+/, '');
        const response = await fetch(fullPath);

        const contentType = response.headers.get('Content-Type');
        // 非 markdown 文件返回空
        if (!contentType?.includes("text/markdown")) {
            return { content: null, lastModified: null };
        }

        const content = await response.text();
        const lastModified = response.headers.get('Last-Modified') || null;

        return {
            content: content && content.length > 0 ? content : '',
            lastModified,
        };
    } catch (err) {
        console.error("md文件读取出错", err);
        return { content: null, lastModified: null };
    }
}

// 根据路径获取markdown文件内容（保留旧接口，内部调用合并后的函数）
export async function getMarkDownContent(markdown_path: string) {
    const { content } = await getMarkDownData(markdown_path);
    return content;
}

/**
 * 根据文章路径获取文章信息（保留旧接口，内部调用合并后的函数）
 */
export async function getMarkDownInfo(markdown_path: string) {
    const { lastModified } = await getMarkDownData(markdown_path);
    return lastModified;
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


export const findTreeNode = (tree: Array<NoteTreeItem>, targetId: string): NoteTreeItem | null => {
    for (const item of tree) {
        if (item.key === targetId) {
            return item
        }

        if (item.children && item.children.length > 0) {
            const result = findTreeNode(item.children, targetId)

            if (result) {
                return result
            }
        }
    }

    return null
}

export const findTreePath = (tree: Array<NoteTreeItem>, targetId: string): string[] | null => {
    const traverse = (node: NoteTreeItem, path: string[]): string[] | null => {
        const currentPath = [...path, node.key]

        if (node.key === targetId) {
            return currentPath
        }

        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                const result = traverse(child, currentPath)

                if (result) {
                    return result
                }
            }
        }

        return null
    }

    for (const item of tree) {
        const result = traverse(item, [])

        if (result) {
            return result
        }
    }

    return null
}

export const getFullPath = (data: Array<NoteTreeItem>, path: string) => {
    const fullPath = findTreePath(data, path)
    return fullPath?.join("/") || ""
}

export function getMdPath(basePath: string, fullPath: string) {
    return `${basePath}/${fullPath}.md`
}

export async function getFetchData(url: string) {
    const fullPath = import.meta.env.BASE_URL + url.replace(/^\/+/, '');
    const res = await fetch(fullPath).then(response => response.json())
    return res
}
