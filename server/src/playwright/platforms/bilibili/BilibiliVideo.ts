import { Page } from 'playwright'
import { BasePlatform } from '../BasePlatform'
import { ContentData } from '../../config'

export class BilibiliVideoPlatform extends BasePlatform {
  platformId = 'bilibili'
  platformName = 'B站视频投稿'
  editorUrl = 'https://member.bilibili.com/v2#/upload/video'

  async getLoginStatus(): Promise<boolean> {
    return true
  }

  async navigateToEditor(page: Page): Promise<void> {
    console.log('正在跳转到B站视频投稿页面...')
    await page.goto(this.editorUrl, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')
    console.log('当前URL:', page.url())
    console.log('页面已打开，请在扩展中点击"七"按钮填入内容')
  }

  async fillContent(page: Page, content: ContentData): Promise<void> {
    console.log('等待用户通过扩展填入内容...')
  }
}
