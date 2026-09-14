import type { NoteTreeItem } from '../types/Note'
export function isArticleTree(value: unknown): value is NoteTreeItem[] {
    const keys = new Set<string>()
    const valid = (nodes: unknown): nodes is NoteTreeItem[] => Array.isArray(nodes) && nodes.every(node => {
        if (!node || typeof node !== 'object' || typeof node.key !== 'string' || !node.key || (/[\\/?#]/.test(node.key) || node.key === '.' || node.key === '..') || typeof node.label !== 'string' || keys.has(node.key)) return false
        keys.add(node.key)
        return (node.published === undefined || typeof node.published === 'boolean') && (node.default === undefined || typeof node.default === 'boolean') && (node.children === undefined || valid(node.children))
    })
    return valid(value)
}

export function publishedTree(nodes: NoteTreeItem[]): NoteTreeItem[] {
    return nodes.filter(node => node.published !== false).map(node => ({ ...node, ...(node.children ? { children: publishedTree(node.children) } : {}) })).filter(node => !node.children || node.children.length)
}
