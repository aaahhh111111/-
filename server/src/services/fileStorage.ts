import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { MediaFile } from '../models/Content'

const UPLOADS_DIR = path.join(process.cwd(), 'uploads')

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3']

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export function ensureUploadDirs() {
  const dirs = ['videos', 'images', 'audio']
  for (const dir of dirs) {
    const dirPath = path.join(UPLOADS_DIR, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }
}

export function getMediaType(mimeType: string): 'video' | 'image' | 'audio' | null {
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video'
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image'
  if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio'
  return null
}

export function getSubDir(mimeType: string): string {
  const type = getMediaType(mimeType)
  if (type === 'video') return 'videos'
  if (type === 'image') return 'images'
  if (type === 'audio') return 'audio'
  return 'images'
}

export async function saveUploadedFile(file: Express.Multer.File): Promise<MediaFile> {
  const mediaType = getMediaType(file.mimetype)
  if (!mediaType) {
    throw new Error(`不支持的文件类型: ${file.mimetype}`)
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小超过限制 (最大 500MB)`)
  }

  const subDir = getSubDir(file.mimetype)
  const ext = path.extname(file.originalname)
  const id = uuidv4()
  const filename = `${id}${ext}`
  const destPath = path.join(UPLOADS_DIR, subDir, filename)

  // 移动文件到目标位置
  fs.copyFileSync(file.path, destPath)
  fs.unlinkSync(file.path) // 删除临时文件

  const mediaFile: MediaFile = {
    id,
    type: mediaType,
    filename: file.originalname,
    local_path: destPath,
    url: `/uploads/${subDir}/${filename}`,
    size: file.size,
    mime_type: file.mimetype,
  }

  return mediaFile
}

export async function deleteMediaFile(mediaFile: MediaFile): Promise<void> {
  if (fs.existsSync(mediaFile.local_path)) {
    fs.unlinkSync(mediaFile.local_path)
  }
}

export function getFilePath(url: string): string {
  return path.join(process.cwd(), url.replace(/^\//, ''))
}
