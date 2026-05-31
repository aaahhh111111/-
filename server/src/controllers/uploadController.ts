import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { saveUploadedFile, getMediaType } from '../services/fileStorage'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mediaType = getMediaType(file.mimetype)
    let subDir = 'images'
    if (mediaType === 'video') subDir = 'videos'
    else if (mediaType === 'audio') subDir = 'audio'
    cb(null, path.join(process.cwd(), 'uploads', subDir))
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

    const mediaFile = await saveUploadedFile(req.file)
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

    const mediaFiles = await Promise.all(files.map(f => saveUploadedFile(f)))
    res.json(mediaFiles)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
})

export default router
