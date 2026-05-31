import { contents } from '../database/json'
import { v4 as uuidv4 } from 'uuid'

export interface PlatformContent {
  adaptedTitle: string
  adaptedBody: string
  warnings: string[]
  characterCount: number
}

export type MediaType = 'text' | 'video' | 'image' | 'mixed'

export interface MediaFile {
  id: string
  type: 'video' | 'image' | 'audio'
  filename: string
  local_path: string
  url: string
  size: number
  duration?: number
  mime_type: string
}

export interface Content {
  id: string
  user_id: string
  title: string
  body: string
  tags: string[]
  images: string[]
  media_type: MediaType
  media_files: MediaFile[]
  thumbnail?: string
  platforms: string[]
  platform_content: Record<string, PlatformContent>
  created_at: string
  updated_at: string
}

export interface ContentCreateInput {
  user_id: string
  title: string
  body?: string
  tags?: string[]
  images?: string[]
  media_type?: MediaType
  media_files?: MediaFile[]
  thumbnail?: string
  platforms?: string[]
  platform_content?: Record<string, PlatformContent>
}

export const ContentModel = {
  create: (input: ContentCreateInput): Content => {
    const id = uuidv4()
    const now = new Date().toISOString()
    const content: Content = {
      id,
      user_id: input.user_id,
      title: input.title,
      body: input.body || '',
      tags: input.tags || [],
      images: input.images || [],
      media_type: input.media_type || 'text',
      media_files: input.media_files || [],
      thumbnail: input.thumbnail,
      platforms: input.platforms || [],
      platform_content: input.platform_content || {},
      created_at: now,
      updated_at: now,
    }
    contents.create(content)
    return content
  },

  findByUserId: (userId: string): Content[] => {
    return contents.findByUserId(userId)
  },

  findById: (id: string): Content | undefined => {
    return contents.findById(id)
  },

  update: (id: string, updates: Partial<ContentCreateInput>): Content | undefined => {
    const existing = contents.findById(id)
    if (!existing) return undefined

    const now = new Date().toISOString()
    const updated: Content = {
      ...existing,
      title: updates.title ?? existing.title,
      body: updates.body ?? existing.body,
      tags: updates.tags ?? existing.tags,
      images: updates.images ?? existing.images,
      media_type: updates.media_type ?? existing.media_type,
      media_files: updates.media_files ?? existing.media_files,
      thumbnail: updates.thumbnail ?? existing.thumbnail,
      platforms: updates.platforms ?? existing.platforms,
      platform_content: updates.platform_content ?? existing.platform_content,
      updated_at: now,
    }
    contents.update(id, updated)
    return updated
  },

  delete: (id: string): boolean => {
    return contents.delete(id)
  },
}
