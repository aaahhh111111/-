export interface PlatformContent {
  adaptedTitle: string
  adaptedBody: string
  warnings: string[]
  characterCount: number
}

export interface ContentInput {
  title: string
  body: string
  tags: string[]
}

export interface PublishResult {
  status: 'simulated' | 'success' | 'error'
  message: string
  publishedAt: string
}

export interface PlatformAdapter {
  platformId: string
  platformName: string
  transform(content: ContentInput): Promise<PlatformContent>
  simulatePublish(content: ContentInput): Promise<PublishResult>
}
