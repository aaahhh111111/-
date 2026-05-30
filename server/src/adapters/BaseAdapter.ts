import type { ContentInput, PlatformContent, PublishResult, PlatformAdapter } from './types'

export abstract class BaseAdapter implements PlatformAdapter {
  abstract platformId: string
  abstract platformName: string
  abstract maxTitleLength: number
  abstract maxBodyLength: number

  protected abstract transformBody(body: string): string
  protected abstract addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void

  async transform(content: ContentInput): Promise<PlatformContent> {
    const warnings: string[] = []
    let adaptedTitle = content.title
    let adaptedBody = this.transformBody(content.body)

    if (adaptedTitle.length > this.maxTitleLength) {
      warnings.push(`标题超过${this.maxTitleLength}字符，已自动截断`)
      adaptedTitle = adaptedTitle.substring(0, this.maxTitleLength)
    }

    if (adaptedBody.length > this.maxBodyLength) {
      warnings.push(`正文超过${this.maxBodyLength}字符，建议精简`)
    }

    const platformContent: PlatformContent = {
      adaptedTitle,
      adaptedBody,
      warnings,
      characterCount: adaptedBody.length,
    }

    this.addPlatformFeatures(content, platformContent)

    return platformContent
  }

  async simulatePublish(content: ContentInput): Promise<PublishResult> {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    return {
      status: 'simulated',
      message: `已成功模拟发布到${this.platformName}`,
      publishedAt: new Date().toISOString(),
    }
  }
}
