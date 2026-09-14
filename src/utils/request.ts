export async function fetchJson<T = unknown>(url: string, signal?: AbortSignal): Promise<T> {
    const response = await fetch(url, { signal: signal ?? AbortSignal.timeout(15000) })
    if (!response.ok) throw new Error(`请求失败：${response.status}`)
    return response.json() as Promise<T>
}
export function safeUrl(value: string, base?: string): string | null {
    try {
        const location = (globalThis as { location?: { href: string } }).location
        const url = new URL(value, base || location?.href || 'https://aurora.invalid/')
        return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null
    } catch { return null }
}
