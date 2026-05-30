import { Page, BrowserContext } from 'playwright'
import { BasePlatform } from './BasePlatform'
import { ContentData, platformConfigs } from '../config'

export class BilibiliPlatform extends BasePlatform {
  platformId = 'bilibili'
  platformName = 'B站'
  editorUrl = platformConfigs.bilibili.editorUrl

  async getLoginStatus(context: BrowserContext): Promise<boolean> {
    try {
      const page = await context.newPage()
      await page.goto('https://www.bilibili.com/', { waitUntil: 'domcontentloaded' })
      await this.delay(2000)

      const url = page.url()
      const isLoggedIn = !url.includes('login')
      await page.close()
      return isLoggedIn
    } catch {
      return false
    }
  }

  async navigateToEditor(page: Page): Promise<void> {
    console.log('正在跳转到B站专栏编辑器...')
    await page.goto(this.editorUrl, { waitUntil: 'networkidle', timeout: 30000 })
    await this.delay(3000)
    console.log('当前URL:', page.url())
  }

  async fillContent(page: Page, content: ContentData): Promise<void> {
    console.log('开始填写B站专栏内容...')

    const title = content.title.substring(0, 40)
    const titleSelectors = [
      'input[placeholder*="标题"]',
      'input[placeholder*="标题"]',
      '.article-title-input input',
      'input.article-title',
      'input[name="title"]',
      'input[type="text"]',
    ]

    for (const selector of titleSelectors) {
      const input = page.locator(selector).first()
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`找到标题输入框: ${selector}`)
        await input.fill(title)
        await this.delay(500)
        break
      }
    }

    const plainText = this.stripHtml(content.body).substring(0, 5000)
    console.log('正文长度:', plainText.length)

    const editorSelectors = [
      '#ueditor_0',
      '.ueditor',
      '[contenteditable="true"]',
      '.article-content-editor',
      '.editor-content',
      '.rich-text-editor',
    ]

    let editorFilled = false
    for (const selector of editorSelectors) {
      const editor = page.locator(selector).first()
      if (await editor.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`找到编辑器: ${selector}`)
        await editor.click()
        await this.delay(500)
        await page.keyboard.type(plainText, { delay: 10 })
        editorFilled = true
        break
      }
    }

    const frames = page.frames()
    console.log('页面frame数量:', frames.length)
    for (const frame of frames) {
      const frameUrl = frame.url()
      if (frameUrl.includes('bilibili') || frameUrl.includes('ueditor')) {
        console.log('找到Bilibili frame:', frameUrl)
        const frameEditor = frame.locator('[contenteditable="true"]').first()
        if (await frameEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
          await frameEditor.click()
          await this.delay(500)
          await page.keyboard.type(plainText, { delay: 10 })
          editorFilled = true
          break
        }
      }
    }

    if (!editorFilled) {
      console.log('未能自动填写正文，请在页面中手动输入')
    }

    await this.delay(1000)

    if (content.tags.length > 0) {
      const tagSelectors = [
        'input[placeholder*="标签"]',
        'input.tag-input',
        '.tag-input input',
        'input[name="tag"]',
      ]

      for (const selector of tagSelectors) {
        const tagInput = page.locator(selector).first()
        if (await tagInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`找到标签输入框: ${selector}`)
          for (const tag of content.tags.slice(0, 3)) {
            await tagInput.fill(tag)
            await this.delay(300)
            await tagInput.press('Enter')
            await this.delay(300)
          }
          break
        }
      }
    }

    console.log('B站内容填写完成')
  }
}
