import { mkdir, readdir, stat, writeFile } from 'node:fs/promises'
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

const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

const getFileCreatedAt = async (filePath: string) => {
    const fileStat = await stat(filePath)

    return fileStat.birthtimeMs > 0 ? fileStat.birthtime : fileStat.ctime
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
    const articles: ArticleRecord[] = await Promise.all(markdownFiles.map(async (filePath) => {
        const createdAt = await getFileCreatedAt(filePath)
        const relativePath = path.relative(path.resolve(process.cwd(), 'public'), filePath).replace(/\\/g, '/')

        return {
            path: `/${relativePath}`,
            createdAt: createdAt.toISOString(),
            date: formatDate(createdAt),
        }
    }))

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
