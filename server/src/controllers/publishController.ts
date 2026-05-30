import { Router, Response } from 'express'
import { launchPlatforms, getAuthStatus, authenticatePlatform } from '../services/platformLauncher'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/launch', async (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const { title, body, tags, platforms: platformIds } = req.body

    if (!title) {
      res.status(400).json({ error: '标题不能为空' })
      return
    }

    if (!platformIds || !Array.isArray(platformIds) || platformIds.length === 0) {
      res.status(400).json({ error: '请选择至少一个平台' })
      return
    }

    const content = { title, body: body || '', tags: tags || [] }

    console.log(`启动平台发布: ${platformIds.join(', ')}`)
    console.log(`内容标题: ${title}`)

    const results = await launchPlatforms(content, platformIds)

    res.json({
      success: true,
      results,
      message: `已启动 ${results.length} 个平台的编辑器`,
    })
  } catch (error: any) {
    console.error('Launch platforms error:', error)
    res.status(500).json({ error: error.message || '启动平台失败' })
  }
})

router.get('/auth-status', async (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const status = await getAuthStatus()

    res.json({ platforms: status })
  } catch (error: any) {
    console.error('Get auth status error:', error)
    res.status(500).json({ error: error.message || '获取状态失败' })
  }
})

router.post('/authenticate/:platform', async (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const { platform } = req.params

    const result = await authenticatePlatform(platform)

    if (result.success) {
      res.json({ success: true, message: `${platform} 授权成功` })
    } else {
      res.status(400).json({ success: false, error: result.error || '授权失败' })
    }
  } catch (error: any) {
    console.error('Authenticate error:', error)
    res.status(500).json({ error: error.message || '授权过程出错' })
  }
})

export default router
