export interface SearchArticle { path: string; title: string; summary: string; text: string; published: string; updated: string; dateSource: string }
export function searchArticles(articles: SearchArticle[], query: string): SearchArticle[] {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    if (!terms.length) return []
    return articles.map(article => {
        const title = article.title.toLocaleLowerCase(), text = article.text.toLocaleLowerCase()
        return { article, score: terms.every(term => title.includes(term) || text.includes(term)) ? terms.reduce((score, term) => score + (title.includes(term) ? 10 : 1), 0) : 0 }
    }).filter(item => item.score).sort((a, b) => b.score - a.score || a.article.path.localeCompare(b.article.path)).map(item => item.article)
}
