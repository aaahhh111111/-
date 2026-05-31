import { Page, BrowserContext } from 'playwright'
import { BasePlatform } from './BasePlatform'
import { ContentData, getPlatformEditorUrl } from '../config'

export class WeChatPlatform extends BasePlatform {
  platformId = 'wechat'
  platformName = '微信公众号'
  editorUrl = getPlatformEditorUrl('wechat')

  async getLoginStatus(context: BrowserContext): Promise<boolean> {
    try {
      const page = await context.newPage()
      await page.goto('https://mp.weixin.qq.com/', { waitUntil: 'domcontentloaded' })
      await this.delay(2000)

      const url = page.url()
      const isLoggedIn = !url.includes('login') && url.includes('mp.weixin.qq.com')
      await page.close()
      return isLoggedIn
    } catch {
      return false
    }
  }

  async navigateToEditor(page: Page): Promise<void> {
    console.log('正在跳转到微信公众号...')
    await page.goto(this.editorUrl, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')
    await this.delay(5000)

    console.log('当前URL:', page.url())

    const writeBtnSelectors = [
      'text=写新文章',
      'a:has-text("写新文章")',
      'a[href*="appmsg"]',
      'text=新的创作',
    ]

    for (const selector of writeBtnSelectors) {
      const btn = page.locator(selector).first()
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`点击: ${selector}`)
        await btn.click()
        await this.delay(3000)
        break
      }
    }

    console.log('跳转后URL:', page.url())
  }

  async fillContent(page: Page, content: ContentData): Promise<void> {
    console.log('开始填写微信公众号内容...')

    const titleSelectors = [
      '#title',
      'input[name="title"]',
      '.wxw-textInput',
      'input[placeholder*="标题"]',
      '.article-title input',
    ]

    for (const selector of titleSelectors) {
      const input = page.locator(selector).first()
      if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`找到标题输入框: ${selector}`)
        await input.fill(content.title)
        await this.delay(500)
        break
      }
    }

    const plainText = this.stripHtml(content.body)
    console.log('正文长度:', plainText.length)

    let editorFilled = false
    const editorSelectors = [
      '#ueditor_0',
      '[contenteditable="true"]',
      '.rich_media_content',
      '.edit_area',
      '.ueditor',
    ]

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
    for (const frame of frames) {
      if (frame.url().includes('ueditor') || frame.url().includes('wx')) {
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

    if (content.tags.length > 0) {
      const tagSelectors = [
        '#tags',
        'input[name="tags"]',
        '.tag_input',
        'input[placeholder*="标签"]',
      ]

      for (const selector of tagSelectors) {
        const tagInput = page.locator(selector).first()
        if (await tagInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`找到标签输入框: ${selector}`)
          for (const tag of content.tags.slice(0, 3)) {
            await tagInput.fill(tag)
            await tagInput.press('Enter')
            await this.delay(300)
          }
          break
        }
      }
    }

    console.log('微信公众号内容填写完成')
  }
}
