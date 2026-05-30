import path from 'path'
import fs from 'fs'

export interface PlatformConfig {
  id: string
  name: string
  editorUrl: string
  storageFile: string
}

export interface ContentData {
  title: string
  body: string
  tags: string[]
  images?: string[]
}

export interface LaunchResult {
  success: boolean
  platform: string
  url: string
  error?: string
}

export const STORAGE_DIR = path.join(process.cwd(), 'playwright-storage')

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

export const platformConfigs: Record<string, PlatformConfig> = {
  wechat: {
    id: 'wechat',
    name: '微信公众号',
    editorUrl: 'https://mp.weixin.qq.com/cgi-bin/homepage?t=home/index',
    storageFile: path.join(STORAGE_DIR, 'wechat-state.json'),
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    editorUrl: 'https://zhuanlan.zhihu.com/write',
    storageFile: path.join(STORAGE_DIR, 'zhihu-state.json'),
  },
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    editorUrl: 'https://creator.xiaohongshu.com/publish/publish',
    storageFile: path.join(STORAGE_DIR, 'xiaohongshu-state.json'),
  },
  bilibili: {
    id: 'bilibili',
    name: 'B站',
    editorUrl: 'https://member.bilibili.com/read/editor/',
    storageFile: path.join(STORAGE_DIR, 'bilibili-state.json'),
  },
}
