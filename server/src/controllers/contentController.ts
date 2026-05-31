import { Router, Response } from 'express'
import { ContentModel } from '../models/Content'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

// 平台适配规则
const platformRules: Record<string, { maxTitleLength: number; maxBodyLength: number }> = {
  wechat: { maxTitleLength: 64, maxBodyLength: 20000 },
  zhihu: { maxTitleLength: 100, maxBodyLength: 50000 },
  bilibili: { maxTitleLength: 40, maxBodyLength: 5000 },
  xiaohongshu: { maxTitleLength: 20, maxBodyLength: 1000 },
}

function transformForPlatform(platformId: string, title: string, body: string, tags: string[]): { adaptedTitle: string; adaptedBody: string; warnings: string[]; characterCount: number } {
  const rules = platformRules[platformId] || { maxTitleLength: 100, maxBodyLength: 10000 }
  const warnings: string[] = []
  
  let adaptedTitle = title
  if (title.length > rules.maxTitleLength) {
    adaptedTitle = title.substring(0, rules.maxTitleLength)
    warnings.push(`标题已截断至${rules.maxTitleLength}字`)
  }
  
  let adaptedBody = body
  if (body.length > rules.maxBodyLength) {
    adaptedBody = body.substring(0, rules.maxBodyLength)
    warnings.push(`正文已截断至${rules.maxBodyLength}字`)
  }
  
  return {
    adaptedTitle,
    adaptedBody,
    warnings,
    characterCount: adaptedBody.length,
  }
}

router.get('/', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const contents = ContentModel.findByUserId(authReq.userId)
    res.json(contents)
  } catch (error) {
    console.error('Get contents error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.get('/:id', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const content = ContentModel.findById(req.params.id)
    if (!content) {
      res.status(404).json({ error: '内容不存在' })
      return
    }

    if (content.user_id !== authReq.userId) {
      res.status(403).json({ error: '无权访问此内容' })
      return
    }

    res.json(content)
  } catch (error) {
    console.error('Get content error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.post('/', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const { title, body, tags, images, platforms } = req.body

    if (!title) {
      res.status(400).json({ error: '标题不能为空' })
      return
    }

    const content = ContentModel.create({
      user_id: authReq.userId,
      title,
      body,
      tags,
      images,
      platforms,
    })

    res.status(201).json(content)
  } catch (error) {
    console.error('Create content error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.put('/:id', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const existing = ContentModel.findById(req.params.id)
    if (!existing) {
      res.status(404).json({ error: '内容不存在' })
      return
    }

    if (existing.user_id !== authReq.userId) {
      res.status(403).json({ error: '无权修改此内容' })
      return
    }

    const { title, body, tags, images, platforms, platform_content } = req.body

    const updated = ContentModel.update(req.params.id, {
      title,
      body,
      tags,
      images,
      platforms,
      platform_content,
    })

    res.json(updated)
  } catch (error) {
    console.error('Update content error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.delete('/:id', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const existing = ContentModel.findById(req.params.id)
    if (!existing) {
      res.status(404).json({ error: '内容不存在' })
      return
    }

    if (existing.user_id !== authReq.userId) {
      res.status(403).json({ error: '无权删除此内容' })
      return
    }

    ContentModel.delete(req.params.id)
    res.status(204).send()
  } catch (error) {
    console.error('Delete content error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.post('/:id/preview', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const content = ContentModel.findById(req.params.id)
    if (!content) {
      res.status(404).json({ error: '内容不存在' })
      return
    }

    if (content.user_id !== authReq.userId) {
      res.status(403).json({ error: '无权访问此内容' })
      return
    }

    const { platforms } = req.body
    const platformContent: Record<string, any> = {}

    for (const platformId of platforms) {
      platformContent[platformId] = transformForPlatform(
        platformId,
        content.title,
        content.body,
        content.tags || []
      )
    }

    const updated = ContentModel.update(req.params.id, {
      platforms,
      platform_content: platformContent,
    })

    res.json(updated)
  } catch (error) {
    console.error('Preview error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.post('/:id/publish', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const content = ContentModel.findById(req.params.id)
    if (!content) {
      res.status(404).json({ error: '内容不存在' })
      return
    }

    if (content.user_id !== authReq.userId) {
      res.status(403).json({ error: '无权发布此内容' })
      return
    }

    const { platforms } = req.body
    const results = []

    for (const platformId of platforms) {
      const transformed = transformForPlatform(platformId, content.title, content.body, content.tags || [])
      results.push({
        platform: platformId,
        success: true,
        message: '已准备好发布内容，请前往平台手动发布',
        ...transformed,
      })
    }

    res.json({ results })
  } catch (error) {
    console.error('Publish error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
