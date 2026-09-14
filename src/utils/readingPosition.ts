const key = 'aurora-reading-positions-v1'
interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
function positions(storage: StorageLike): Record<string, number> {
    try { const value = JSON.parse(storage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {} } catch { return {} }
}
export function readPosition(storage: StorageLike, path: string): number {
    const value = positions(storage)[path]
    return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0
}
export function savePosition(storage: StorageLike, path: string, top: number): void {
    if (!path || !Number.isFinite(top) || top < 0) return
    try { const value = positions(storage); delete value[path]; value[path] = top; storage.setItem(key, JSON.stringify(Object.fromEntries(Object.entries(value).slice(-100)))) } catch {}
}
