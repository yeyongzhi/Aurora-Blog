import { type NoteTreeItem } from './index.vue'

const baseNotePath = '' + '/article/life'

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

export function getMdPath(fullPath: string) {
    return `${baseNotePath}/${fullPath}.md`
}