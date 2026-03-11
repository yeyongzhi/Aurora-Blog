const LINK_REGEXP = /(\[.*?\])\((.*?)\)/
// const IMG_REGEXP = /!\[(.*?)\]\((.*?)\)/
const IMG_REGEXP = /!\[(.*?)\]\((.*?)\)(?:\(([^,]+),\s*([^)]+)\))?/;
const UNORDERLIST_REGEXP = /^- (.*)$/
const ORDERLIST_REGEXP = /^\d+\.\s(.*)$/

const noHandleTypeList = [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "emptyLine",
    "divider",
    "link",
    "img"
]

/**
 * 格式化markdown的内容
 * @param {string} str markdown内容
 */
export function formatMarkDown(str: string) {
    const text = str.split(/\r?\n/)
    // 第一步：最基础的识别
    const content: Array<any> = text.map(t => {
        return identifyLine(t)
    })
    console.log(content)
    let result: any = []
    let i = 0;
    const fn = () => {
        const c = content[i]
        if (noHandleTypeList.includes(c.type)) {
            // 处理单行的内容
            result.push(c)
            i++
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'text') {
            result.push({
                type: c.type,
                content: handleLineText(c.content)
            })
            i++
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'unorderList') {
            result.push({
                type: c.type,
                content: handleLineText(c.content)
            })
            i++
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'orderList') {
            result.push({
                type: c.type,
                content: [
                    c.content[0],
                    handleLineText(c.content[1])
                ]
            })
            i++
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'code') {
            const range: any = getContinuousRangeIndex2(content, i)
            result.push({
                type: c.type,
                content: content.slice(range[0], range[1] + 1).map(item => item.content)
            })
            i = range[1] + 2
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'todo') {
            const regex = /^- \[([xX ])\]\s*(.*)$/;
            const range: any = getContinuousRangeIndex(content, i)
            result.push({
                type: c.type,
                content: content.slice(range[0], range[1] + 1).map(item => {
                    let re: any = regex.exec(item.content)
                    return {
                        finished: re[1] === "x",
                        label: re[2]
                    }
                })
            })
            i = range[1] + 1
            if (i < content.length) {
                fn()
            }
        } else if (c.type === 'quote') {
            const range: any = getQuoteRangeIndex(content, i)
            result.push({
                type: c.type,
                content: content.slice(range[0], range[1] + 1).map((item, index) => {
                    if (index === 0) {
                        return handleLineText(item.content.trim().replace(/>/g, ""))
                    }
                    return handleLineText(item.content)
                })
            })
            i = range[1] + 1
            if (i < content.length) {
                fn()
            }
        }
    }
    fn()
    return result
}

export function identifyLine(text: string) {
    let type = "text"
    let content: any = text
    // 标题一
    if (text.startsWith("#")) {
        const times = text.split("").filter(t => t === '#').length
        type = `h${times}`
    }
    if (UNORDERLIST_REGEXP.test(text)) {
        type = 'unorderList' // 无序列表
        const result = UNORDERLIST_REGEXP.exec(text)
        content = result ? result[1] : ""
    }
    if (ORDERLIST_REGEXP.test(text)) {
        type = 'orderList' // 有序列表
        const result = ORDERLIST_REGEXP.exec(text)
        content = [text.substring(0, text.indexOf(".")), result ? result[1] : ""]
    }
    if (text.startsWith("> ")) {
        type = 'quote' // 引用
    }
    if (/```/g.test(text)) {
        type = 'code' // 代码块
    }
    if (text === '---' || text === '***') {
        type = 'divider' // 
    }
    if (text.match(LINK_REGEXP)) {
        type = 'link' // 链接
        const match: any = text.match(LINK_REGEXP);
        if (match && match.index !== undefined) {
            const otherTextBefore = text.substring(0, match.index); // 匹配之前的其他文本
            const otherTextAfter = text.substring(match.index + match[0].length); // 匹配之后的其他文本
            const linkText = match[1].replace("[", "").replace("]", ""); // 链接文本
            const linkUrl = match[2]; // 链接地址
            content = [
                otherTextBefore,
                linkText,
                linkUrl,
                otherTextAfter
            ]
        }
    }
    if (IMG_REGEXP.test(text)) {
        type = 'img' // 图片
        content = IMG_REGEXP.exec(text)
    }
    if (text.startsWith("- [x] ") || text.startsWith("- [] ")) {
        type = 'todo'
    }
    if (text.length === 0) {
        type = 'emptyLine' // 空行
    }
    return {
        type,
        content
    }
}

// function handleLineText(content: string) {
//     const boldRegex = /(\*\*|__)(.*?)(\*\*|__)/g;
//     const italicRegex = /(\*|_)(.*?)(\*|_)/g;
//     const strikethroughRegex = /~~(.*?)~~/g;
//     const inlineCodeRegex = /`(.*?)`/g;

//     let htmlText = content
//         .replace(boldRegex, "<strong>$2</strong>")
//         .replace(italicRegex, "<em>$2</em>")
//         .replace(strikethroughRegex, "<del>$1</del>")
//         .replace(inlineCodeRegex, "<code class='mx-2 rounded bg-muted px-2 py-1 text-base font-bold'>$1</code>");

//     return htmlText
// }

function handleLineText(content: string) {
    // 1. 首先转义 HTML 特殊字符，防止被浏览器解析为标签或被过滤
    const escapeHtml = (text: string) => {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    // 注意：这里我们假设 content 是纯文本，需要先转义
    // 如果你的 content 已经包含了一些合法的 HTML 标签需要保留，这个方案需要调整（只转义 Markdown 部分）
    // 但对于纯文本记录思考的场景，全量转义是最安全的。
    
    let safeContent = escapeHtml(content);

    // 2. 然后应用 Markdown 正则
    // 此时 < 和 > 已经变成了 &lt; 和 &gt;，正则匹配完全不受影响，且生成的 HTML 是安全的
    const boldRegex = /(\*\*|__)([\s\S]*?)\1/g;
    const italicRegex = /([*_])([\s\S]*?)\1/g;
    const strikethroughRegex = /~~([\s\S]*?)~~/g;
    const inlineCodeRegex = /`([\s\S]*?)`/g;

    let htmlText = safeContent
        .replace(boldRegex, "<strong>$2</strong>")
        .replace(italicRegex, "<em>$2</em>")
        .replace(strikethroughRegex, "<del>$1</del>")
        .replace(inlineCodeRegex, "<code class='mx-2 rounded bg-muted px-2 py-1 text-base font-bold'>$1</code>");

    return htmlText;
}

export function getContinuousRangeIndex(content: Array<any>, start: number) {
    const type = content[start].type
    let end = start
    while (end <= content.length - 1 && content[end].type === type) {
        end++
    }
    return [start, end - 1]
}

export function getContinuousRangeIndex2(content: Array<any>, start: number): number[] {
    const type = content[start].type
    let end = start
    while (end === start || (end < content.length - 1 && content[end].type !== type)) {
        end++
    }
    return [start + 1, end - 1]
}

export function getQuoteRangeIndex(content: Array<any>, start: number) {
    let end = start
    while (end < content.length && content[end].type !== 'emptyLine') {
        end++
    }
    return [start, end - 1]
}