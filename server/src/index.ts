import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { initializeDatabase } from './database/sqlite'
import authRoutes from './controllers/authController'
import contentRoutes from './controllers/contentController'
import publishRoutes from './controllers/publishController'
import uploadRoutes from './controllers/uploadController'
import { authMiddleware } from './middleware/auth'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

initializeDatabase()

// 静态文件服务 - 上传的文件
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/content', authMiddleware, contentRoutes)
app.use('/api/publish', authMiddleware, publishRoutes)
// 上传接口不需要认证（前端通过 axios interceptor 已带 token）
app.use('/api/upload', uploadRoutes)

// 扩展专用接口（无需认证，通过 contentId 获取内容）
app.get('/api/extension/content/:id', (req, res) => {
  try {
    const { ContentModel } = require('./models/Content')
    const content = ContentModel.findById(req.params.id)
    if (!content) {
      res.status(404).json({ error: '内容不存在' })
      return
    }
    res.json(content)
  } catch (error) {
    console.error('获取扩展内容失败:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

app.get('/api/platforms', (req, res) => {
  const platforms = [
    {
      id: 'wechat',
      name: '微信公众号',
      icon: 'message-circle',
      color: '#07c160',
      rules: {
        maxTitleLength: 64,
        maxBodyLength: 20000,
        allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'br'],
        specialFeatures: ['html格式', '引导关注'],
      },
      submissionTypes: ['article'],
      submissionTypeNames: { article: '图文消息' },
    },
    {
      id: 'zhihu',
      name: '知乎',
      icon: 'help-circle',
      color: '#0066ff',
      rules: {
        maxTitleLength: 100,
        maxBodyLength: 50000,
        allowedTags: ['markdown'],
        specialFeatures: ['Markdown支持', '话题标签'],
      },
      submissionTypes: ['article'],
      submissionTypeNames: { article: '文章' },
    },
    {
      id: 'bilibili',
      name: 'B站',
      icon: 'video',
      color: '#fb7299',
      rules: {
        maxTitleLength: 40,
        maxBodyLength: 5000,
        allowedTags: ['纯文本'],
        specialFeatures: ['精简分段', '话题标签'],
      },
      submissionTypes: ['article', 'video', 'dynamic'],
      submissionTypeNames: { article: '专栏', video: '视频投稿', dynamic: '动态' },
    },
    {
      id: 'xiaohongshu',
      name: '小红书',
      icon: 'book-open',
      color: '#fe2c55',
      rules: {
        maxTitleLength: 20,
        maxBodyLength: 1000,
        allowedTags: ['emoji增强'],
        specialFeatures: ['Emoji优化', '移动端优化'],
      },
      submissionTypes: ['note'],
      submissionTypeNames: { note: '笔记' },
    },
  ]
  res.json(platforms)
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
