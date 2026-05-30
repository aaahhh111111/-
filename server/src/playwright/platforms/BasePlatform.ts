import { Page, BrowserContext } from 'playwright'
import { ContentData } from '../config'

export interface PlatformAutomation {
  platformId: string
  platformName: string
  getLoginStatus(context: BrowserContext): Promise<boolean>
  navigateToEditor(page: Page): Promise<void>
  fillContent(page: Page, content: ContentData): Promise<void>
  getCurrentUrl(page: Page): string
}

export abstract class BasePlatform implements PlatformAutomation {
  abstract platformId: string
  abstract platformName: string
  abstract editorUrl: string

  abstract getLoginStatus(context: BrowserContext): Promise<boolean>
  abstract navigateToEditor(page: Page): Promise<void>
  abstract fillContent(page: Page, content: ContentData): Promise<void>

  getCurrentUrl(page: Page): string {
    return page.url()
  }

  protected stripHtml(html: string): string {
    return html
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/<br\s*\/?>/gi, '\n')
      .trim()
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
