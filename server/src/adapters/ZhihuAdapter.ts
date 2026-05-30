import { BaseAdapter } from './BaseAdapter'
import type { ContentInput, PlatformContent } from './types'

export class ZhihuAdapter extends BaseAdapter {
  platformId = 'zhihu'
  platformName = '知乎'
  maxTitleLength = 100
  maxBodyLength = 50000

  private sensitiveWords = ['敏感词', '违规', '禁止']

  protected transformBody(body: string): string {
    let markdown = body

    markdown = markdown.replace(/<h1>(.*?)<\/h1>/gi, '# $1')
    markdown = markdown.replace(/<h2>(.*?)<\/h2>/gi, '## $1')
    markdown = markdown.replace(/<h3>(.*?)<\/h3>/gi, '### $1')
    markdown = markdown.replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    markdown = markdown.replace(/<em>(.*?)<\/em>/gi, '*$1*')
    markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
    markdown = markdown.replace(/<[^>]+>/g, '')

    const lines = markdown.split('\n').filter((line) => line.trim())
    markdown = lines.join('\n\n')

    return markdown
  }

  protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void {
    adapted.adaptedBody = adapted.adaptedBody.replace(
      /^(.*)$/m,
      `$1\n\n---\n\n> 来源：多平台内容发布工具`
    )

    for (const word of this.sensitiveWords) {
      if (adapted.adaptedBody.includes(word)) {
        adapted.warnings.push(`包含可能敏感的内容"${word}"，建议检查`)
      }
    }

    if (content.tags.length > 0) {
      const topics = content.tags.map((tag) => `#${tag}`).join(' ')
      adapted.adaptedBody += `\n\n${topics}`
    }
  }
}
