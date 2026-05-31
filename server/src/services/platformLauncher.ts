import { chromium, BrowserContext } from 'playwright'
import { ContentData, LaunchResult, platformConfigs } from '../playwright/config'
import {
  WeChatPlatform,
  ZhihuPlatform,
  XiaohongshuPlatform,
  PlatformAutomation,
} from '../playwright/platforms'
import { getBilibiliPlatform } from '../playwright/platforms/bilibili'
import fs from 'fs'

function createPlatformInstance(platformId: string, submissionType?: string): PlatformAutomation | null {
  if (platformId === 'bilibili' && submissionType) {
    return getBilibiliPlatform(submissionType)
  }

  const platformMap: Record<string, () => PlatformAutomation> = {
    wechat: () => new WeChatPlatform(),
    zhihu: () => new ZhihuPlatform(),
    xiaohongshu: () => new XiaohongshuPlatform(),
    bilibili: () => getBilibiliPlatform('article'),
  }

  const createFn = platformMap[platformId]
  return createFn ? createFn() : null
}

export interface PlatformAuthStatus {
  platform: string
  name: string
  isAuthenticated: boolean
  needsLogin: boolean
}

async function launchSinglePlatform(
  platformId: string,
  submissionType: string | undefined,
  content: ContentData,
  contentId: string
): Promise<LaunchResult> {
  const platform = createPlatformInstance(platformId, submissionType)
  const config = platformConfigs[platformId]

  if (!platform || !config) {
    return {
      success: false,
      platform: platformId,
      url: '',
      error: '平台未配置',
    }
  }

  try {
    const browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized'],
      channel: 'msedge',
    })

    let context: BrowserContext

    if (fs.existsSync(config.storageFile)) {
      context = await browser.newContext({
        storageState: config.storageFile,
      })
    } else {
      context = await browser.newContext()
    }

    const page = await context.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })

    // 获取编辑器 URL 并添加 contentId 参数
    let editorUrl = platform.editorUrl || config.submissionTypes[0]?.editorUrl || ''
    
    // 如果 URL 已有查询参数，添加 &qiniu_cid
    // 如果没有，添加 ?qiniu_cid
    const separator = editorUrl.includes('?') ? '&' : '?'
    const urlWithCid = `${editorUrl}${separator}qiniu_cid=${contentId}`
    
    console.log(`打开页面并传递 contentId: ${contentId}`)
    await page.goto(urlWithCid, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)

    await platform.fillContent(page, content)

    // 保存登录状态
    if (!fs.existsSync(config.storageFile)) {
      await context.storageState({ path: config.storageFile })
      console.log(`已保存 ${config.name} 登录状态到 ${config.storageFile}`)
    }

    const currentUrl = page.url()
    console.log(`${config.name} 编辑器已打开: ${currentUrl}`)

    return {
      success: true,
      platform: platformId,
      url: currentUrl,
    }

  } catch (error: any) {
    return {
      success: false,
      platform: platformId,
      url: '',
      error: error.message || '未知错误',
    }
  }
}

export async function launchPlatforms(
  content: ContentData,
  platformIds: string[],
  submissionTypes?: Record<string, string>,
  contentId?: string
): Promise<LaunchResult[]> {
  console.log(`同时启动 ${platformIds.length} 个平台...`)
  console.log(`Content ID: ${contentId}`)

  const promises = platformIds.map(platformId => {
    const submissionType = submissionTypes?.[platformId]
    return launchSinglePlatform(platformId, submissionType, content, contentId || '')
  })

  const results = await Promise.all(promises)

  const successCount = results.filter(r => r.success).length
  console.log(`成功启动 ${successCount}/${platformIds.length} 个平台`)

  return results
}

export async function getAuthStatus(): Promise<PlatformAuthStatus[]> {
  const results: PlatformAuthStatus[] = []

  try {
    const browser = await chromium.launch({ headless: false, channel: 'msedge' })

    for (const platformId of Object.keys(platformConfigs)) {
      const config = platformConfigs[platformId]
      const platform = createPlatformInstance(platformId)
      if (!platform) continue

      let isAuthenticated = false
      let needsLogin = true

      if (fs.existsSync(config.storageFile)) {
        try {
          const savedContext = await browser.newContext({
            storageState: config.storageFile,
          })
          const testPage = await savedContext.newPage()
          await testPage.goto(`https://www.${getDomain(platformId)}.com/`, { timeout: 10000 })
          await testPage.waitForTimeout(2000)
          isAuthenticated = await platform.getLoginStatus(savedContext)
          needsLogin = !isAuthenticated
          await testPage.close()
          await savedContext.close()
        } catch {
          needsLogin = true
        }
      } else {
        needsLogin = true
      }

      results.push({
        platform: platformId,
        name: config.name,
        isAuthenticated,
        needsLogin,
      })
    }

    await browser.close()
  } catch (error) {
    console.error('Failed to check auth status:', error)
  }

  return results
}

export async function authenticatePlatform(platformId: string): Promise<{ success: boolean; error?: string }> {
  const config = platformConfigs[platformId]

  if (!config) {
    return { success: false, error: '平台未配置' }
  }

  try {
    const browser = await chromium.launch({ headless: false, channel: 'msedge' })
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.setViewportSize({ width: 1400, height: 900 })

    await page.goto(config.submissionTypes[0]?.editorUrl || '', { waitUntil: 'networkidle' })

    console.log(`请在打开的浏览器窗口中登录 ${config.name}`)
    console.log('登录完成后，按回车键继续...')

    await new Promise<void>((resolve) => {
      process.stdin.once('data', () => resolve())
    })

    await context.storageState({ path: config.storageFile })
    await browser.close()

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

function getDomain(platformId: string): string {
  const domains: Record<string, string> = {
    wechat: 'weixin.qq.com',
    zhihu: 'zhihu.com',
    xiaohongshu: 'xiaohongshu.com',
    bilibili: 'bilibili.com',
  }
  return domains[platformId] || 'example.com'
}
