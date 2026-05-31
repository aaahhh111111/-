import { Page, BrowserContext } from 'playwright'
import { BasePlatform } from './BasePlatform'
import { ContentData, getPlatformEditorUrl } from '../config'

export class ZhihuPlatform extends BasePlatform {
  platformId = 'zhihu'
  platformName = '知乎'
  editorUrl = getPlatformEditorUrl('zhihu')

  async getLoginStatus(context: BrowserContext): Promise<boolean> {
    try {
      const page = await context.newPage()
      await page.goto('https://www.zhihu.com/', { waitUntil: 'domcontentloaded' })
      await this.delay(2000)

      const url = page.url()
      const isLoggedIn = !url.includes('signin') && !url.includes('login')
      await page.close()
      return isLoggedIn
    } catch {
      return false
    }
  }

  async navigateToEditor(page: Page): Promise<void> {
    console.log('正在跳转到知乎写文章页面...')
    await page.goto(this.editorUrl, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')
    await this.delay(5000)
    console.log('当前URL:', page.url())
  }

  async fillContent(page: Page, content: ContentData): Promise<void> {
    console.log('开始填写知乎文章内容...')

    const titleSelectors = [
      'input[placeholder*="标题"]',
      '.TitleInput-input',
      'input.TitleInput-input',
      'input[name="title"]',
      'input[class*="Title"]',
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

    const editorSelectors = [
      '[contenteditable="true"]',
      '.DraftEditor-editor',
      '.RichText-editor',
      '.Editor-Content',
      '.zh-editor-content',
      '.ContentItem-richText',
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

    if (!editorFilled) {
      const allEditable = await page.locator('[contenteditable="true"]').all()
      console.log('页面中可编辑元素数量:', allEditable.length)
      if (allEditable.length > 0) {
        await allEditable[0].click()
        await this.delay(500)
        await page.keyboard.type(plainText, { delay: 10 })
      } else {
        console.log('未能自动填写正文，请在页面中手动输入')
      }
    }

    await this.delay(1000)

    if (content.tags.length > 0) {
      const topicSelectors = [
        'input[placeholder*="话题"]',
        '.TopicSelector-input',
        'input[class*="Topic"]',
        'input[aria-label*="话题"]',
      ]

      for (const selector of topicSelectors) {
        const topicInput = page.locator(selector).first()
        if (await topicInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`找到话题输入框: ${selector}`)
          for (const tag of content.tags.slice(0, 3)) {
            await topicInput.fill(tag)
            await this.delay(500)

            const suggestion = page.locator('.TopicSelector-item, .suggestion-item').first()
            if (await suggestion.isVisible({ timeout: 2000 }).catch(() => false)) {
              await suggestion.click()
            }
            await this.delay(300)
          }
          break
        }
      }
    }

    console.log('知乎内容填写完成')
  }
}
