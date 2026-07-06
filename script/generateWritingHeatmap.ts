import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'

interface ArticleRecord {
    path: string
    createdAt: string
    date: string
}

interface DailyRecord {
    date: string
    count: number
    articles: ArticleRecord[]
}

const ARTICLE_DIR = path.resolve(process.cwd(), 'public/article')
const OUTPUT_PATH = path.resolve(process.cwd(), 'public/article/writing-heatmap.json')

const createArticleDate = (createdAt: string) => createdAt.slice(0, 10)

/**
 * 通过 git log 获取文件的首次提交时间（跨部署一致），
 * 如果不在 git 仓库中则退回到文件系统的 birthtime。
 */
const getFileCreatedAt = (filePath: string): string => {
    try {
        const stdout = execFileSync(
            'git',
            ['log', '--diff-filter=A', '--follow', '--format=%aI', '--', filePath],
            { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
        )
        const lines = stdout.trim().split('\n').filter(Boolean)
        if (lines.length > 0) {
            // 最早的一次提交（倒数第一行）
            return lines[lines.length - 1]
        }
    } catch {
        // 不在 git 仓库或 git 命令失败，退回文件系统时间
    }

    // 回退：使用文件系统的 birthtime
    const fileStat = statSync(filePath)
    const createdAt = fileStat.birthtimeMs > 0 ? fileStat.birthtime : fileStat.ctime
    return createdAt.toISOString()
}

const walkMarkdownFiles = async (dir: string): Promise<string[]> => {
    const dirents = await readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map(async (dirent) => {
        const fullPath = path.join(dir, dirent.name)

        if (dirent.isDirectory()) {
            return walkMarkdownFiles(fullPath)
        }

        if (dirent.isFile() && dirent.name.endsWith('.md')) {
            return [fullPath]
        }

        return []
    }))

    return files.flat()
}

const generateWritingHeatmap = async () => {
    const markdownFiles = await walkMarkdownFiles(ARTICLE_DIR)
    const articles: ArticleRecord[] = markdownFiles.map((filePath) => {
        const createdAt = getFileCreatedAt(filePath)
        const relativePath = path.relative(path.resolve(process.cwd(), 'public'), filePath).replace(/\\/g, '/')

        return {
            path: `/${relativePath}`,
            createdAt,
            date: createArticleDate(createdAt),
        }
    })

    const dailyMap = articles.reduce<Record<string, DailyRecord>>((map, article) => {
        if (!map[article.date]) {
            map[article.date] = {
                date: article.date,
                count: 0,
                articles: [],
            }
        }

        map[article.date].count += 1
        map[article.date].articles.push(article)

        return map
    }, {})

    const daily = Object.values(dailyMap).sort((prev, next) => prev.date.localeCompare(next.date))
    const output = {
        generatedAt: new Date().toISOString(),
        source: '/article',
        articles: articles.sort((prev, next) => prev.createdAt.localeCompare(next.createdAt)),
        daily,
    }

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
    await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf-8')
}

generateWritingHeatmap()
