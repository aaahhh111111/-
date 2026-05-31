import { Router, Response } from 'express'
import { ContentModel } from '../models/Content'
import { platformConfigs } from '../playwright/config'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

// 获取带 contentId 的平台链接
function getPlatformUrl(platformId: string, contentId: string, submissionType?: string): string {
  const config = platformConfigs[platformId]
  if (!config) return ''
  
  let editorUrl = ''
  
  if (platformId === 'bilibili') {
    if (submissionType === 'video') {
      editorUrl = 'https://member.bilibili.com/v2#/upload/video'
    } else if (submissionType === 'dynamic') {
      editorUrl = 'https://www.bilibili.com/v/publish/dynamic'
    } else {
      editorUrl = 'https://member.bilibili.com/read/editor/#/'
    }
  } else if (platformId === 'wechat') {
    editorUrl = 'https://mp.weixin.qq.com/'
  } else if (platformId === 'zhihu') {
    editorUrl = 'https://zhuanlan.zhihu.com/write'
  } else if (platformId === 'xiaohongshu') {
    editorUrl = 'https://creator.xiaohongshu.com/creator/post'
  }
  
  const separator = editorUrl.includes('?') ? '&' : '?'
  return `${editorUrl}${separator}qiniu_cid=${contentId}`
}

// 获取平台名称
function getPlatformName(platformId: string): string {
  const names: Record<string, string> = {
    wechat: '微信公众号',
    zhihu: '知乎',
    bilibili: 'B站',
    xiaohongshu: '小红书',
  }
  return names[platformId] || platformId
}

// 获取平台图标
function getPlatformIcon(platformId: string): string {
  const icons: Record<string, string> = {
    wechat: '💚',
    zhihu: '💬',
    bilibili: '📺',
    xiaohongshu: '📕',
  }
  return icons[platformId] || '🌐'
}

// 发布内容 - 不弹出浏览器，只返回链接
router.post('/prepare', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const { title, body, tags, platforms: platformIds, media_type, media_files, thumbnail, submission_types } = req.body

    if (!title) {
      res.status(400).json({ error: '标题不能为空' })
      return
    }

    if (!platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
      res.status(400).json({ error: '请选择至少一个平台' })
      return
    }

    // 保存内容
    const content = ContentModel.create({
      user_id: authReq.userId,
      title,
      body,
      tags: tags || [],
      images: media_files || [],
      platforms: platformIds,
    })

    const contentId = content.id

    // 生成平台链接
    const platformLinks = platformIds.map(platformId => ({
      platform: platformId,
      name: getPlatformName(platformId),
      icon: getPlatformIcon(platformId),
      url: getPlatformUrl(platformId, contentId, submission_types?.[platformId]),
      submissionType: submission_types?.[platformId],
    }))

    console.log(`准备发布: ${platformIds.join(', ')}, Content ID: ${contentId}`)

    res.json({
      success: true,
      contentId,
      platforms: platformLinks,
      message: `已生成 ${platformLinks.length} 个平台的链接`,
    })
  } catch (error: any) {
    console.error('Prepare publish error:', error)
    res.status(500).json({ error: error.message || '准备发布失败' })
  }
})

export default router
