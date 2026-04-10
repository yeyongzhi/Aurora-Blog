function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result: any = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) {
        throw new Error('无效的十六进制颜色值')
    }
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    }
}

function rgbToXyz(r: number, g: number, b: number): { x: number; y: number; z: number } {
    r /= 255
    g /= 255
    b /= 255

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92

    const x = r * 0.4124 + g * 0.3576 + b * 0.1805
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505

    return { x, y, z }
}

function xyzToOklab(x: number, y: number, z: number): { l: number; a: number; b: number } {
    let l = 0.4122214708 * x + 0.5363325057 * y + 0.0514459235 * z
    let m = 0.2119034982 * x + 0.6806995451 * y + 0.1073969566 * z
    let s = 0.0883024619 * x + 0.2811788446 * y + 0.6305186935 * z

    l = Math.cbrt(l)
    m = Math.cbrt(m)
    s = Math.cbrt(s)

    const oklabL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    const oklabA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    const oklabB = 0.0259040371 * l + 0.7827717662 * m - 0.8515728736 * s

    return { l: oklabL, a: oklabA, b: oklabB }
}

function oklabToOklch(l: number, a: number, b: number): { lightness: number; chroma: number; hue: number } {
    const chroma = Math.sqrt(a * a + b * b)
    const hue = (Math.atan2(b, a) * 180) / Math.PI
    return { lightness: l, chroma, hue }
}

export function hexToOklch(hex: string): string {
    const rgb = hexToRgb(hex)
    const xyz = rgbToXyz(rgb.r, rgb.g, rgb.b)
    const oklab = xyzToOklab(xyz.x, xyz.y, xyz.z)
    const oklch = oklabToOklch(oklab.l, oklab.a, oklab.b)

    const hue = oklch.hue < 0 ? oklch.hue + 360 : oklch.hue
    return `oklch(${oklch.lightness.toFixed(2)} ${oklch.chroma.toFixed(2)} ${hue.toFixed(2)})`
}
