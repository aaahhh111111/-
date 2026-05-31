import path from 'path'
import fs from 'fs'
import { MediaFile } from '../models/Content'

export interface SubmissionType {
  id: string
  name: string
  editorUrl: string
}

export interface PlatformConfig {
  id: string
  name: string
  submissionTypes: SubmissionType[]
  storageFile: string
}

export interface ContentData {
  title: string
  body: string
  tags: string[]
  images?: string[]
  media_type?: string
  media_files?: MediaFile[]
  thumbnail?: string
  submission_type?: string
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
    storageFile: path.join(STORAGE_DIR, 'wechat-state.json'),
    submissionTypes: [
      { id: 'article', name: '图文消息', editorUrl: 'https://mp.weixin.qq.com/cgi-bin/homepage?t=home/index' },
    ],
  },
  zhihu: {
    id: 'zhihu',
    name: '知乎',
    storageFile: path.join(STORAGE_DIR, 'zhihu-state.json'),
    submissionTypes: [
      { id: 'article', name: '文章', editorUrl: 'https://zhuanlan.zhihu.com/write' },
    ],
  },
  xiaohongshu: {
    id: 'xiaohongshu',
    name: '小红书',
    storageFile: path.join(STORAGE_DIR, 'xiaohongshu-state.json'),
    submissionTypes: [
      { id: 'note', name: '笔记', editorUrl: 'https://creator.xiaohongshu.com/publish/publish' },
    ],
  },
  bilibili: {
    id: 'bilibili',
    name: 'B站',
    storageFile: path.join(STORAGE_DIR, 'bilibili-state.json'),
    submissionTypes: [
      { id: 'article', name: '专栏', editorUrl: 'https://member.bilibili.com/read/editor/' },
      { id: 'video', name: '视频投稿', editorUrl: 'https://member.bilibili.com/v2#/upload/video' },
      { id: 'dynamic', name: '动态', editorUrl: 'https://www.bilibili.com/v/publish/dynamic' },
    ],
  },
}

export function getPlatformEditorUrl(platformId: string, submissionType?: string): string {
  const config = platformConfigs[platformId]
  if (!config) return ''

  if (submissionType) {
    const type = config.submissionTypes.find(t => t.id === submissionType)
    if (type) return type.editorUrl
  }

  return config.submissionTypes[0]?.editorUrl || ''
}
