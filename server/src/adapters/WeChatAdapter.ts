import { BaseAdapter } from './BaseAdapter'
import type { ContentInput, PlatformContent } from './types'

export class WeChatAdapter extends BaseAdapter {
  platformId = 'wechat'
  platformName = '微信公众号'
  maxTitleLength = 64
  maxBodyLength = 20000

  protected transformBody(body: string): string {
    let html = body
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>')

    if (!html.includes('<!--more-->') && html.length > 500) {
      html = html.replace(/(<br>){3,}/g, '<br><br>')
    }

    return html
  }

  protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void {
    adapted.adaptedBody = `
      <div class="article-content">
        ${adapted.adaptedBody}
      </div>
      <div class="article-footer" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
        <p>本文由多平台内容发布工具发布</p>
      </div>
    `.trim()

    if (content.tags.length > 0) {
      adapted.warnings.push(`建议添加标签：${content.tags.slice(0, 3).join(', ')}`)
    }
  }
}
