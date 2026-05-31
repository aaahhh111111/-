import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// 确保上传目录存在
const uploadsDir = path.join(process.cwd(), 'uploads')
;['images', 'videos', 'audio'].forEach(dir => {
  const dirPath = path.join(uploadsDir, dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
})

function getMediaType(mimetype: string): 'image' | 'video' | 'audio' | null {
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.startsWith('video/')) return 'video'
  if (mimetype.startsWith('audio/')) return 'audio'
  return null
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mediaType = getMediaType(file.mimetype)
    let subDir = 'images'
    if (mediaType === 'video') subDir = 'videos'
    else if (mediaType === 'audio') subDir = 'audio'
    cb(null, path.join(uploadsDir, subDir))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB
  },
  fileFilter: (req, file, cb) => {
    const mediaType = getMediaType(file.mimetype)
    if (mediaType) {
      cb(null, true)
    } else {
      cb(new Error(`不支持的文件类型: ${file.mimetype}`))
    }
  }
})

// 上传单个文件
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '没有上传文件' })
      return
    }

    const mediaType = getMediaType(req.file.mimetype)
    const mediaFile = {
      id: uuidv4(),
      type: mediaType,
      filename: req.file.originalname,
      local_path: req.file.path,
      url: `/uploads/${mediaType}s/${req.file.filename}`,
      size: req.file.size,
      mime_type: req.file.mimetype
    }
    res.json(mediaFile)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

// 上传多个文件
router.post('/multiple', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) {
      res.status(400).json({ error: '没有上传文件' })
      return
    }

    const mediaFiles = files.map(f => {
      const mediaType = getMediaType(f.mimetype)
      return {
        id: uuidv4(),
        type: mediaType,
        filename: f.originalname,
        local_path: f.path,
        url: `/uploads/${mediaType}s/${f.filename}`,
        size: f.size,
        mime_type: f.mimetype
      }
    })
    res.json(mediaFiles)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
