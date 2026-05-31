import { db } from '../database/sqlite'
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
    const stmt = db.prepare(`
      INSERT INTO contents (id, user_id, title, body, tags, images, media_type, media_files, thumbnail, platforms, platform_content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      id,
      input.user_id,
      input.title,
      input.body || '',
      JSON.stringify(input.tags || []),
      JSON.stringify(input.images || []),
      input.media_type || 'text',
      JSON.stringify(input.media_files || []),
      input.thumbnail || null,
      JSON.stringify(input.platforms || []),
      JSON.stringify(input.platform_content || {}),
      now,
      now
    )
    return {
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
  },

  findByUserId: (userId: string): Content[] => {
    const stmt = db.prepare('SELECT * FROM contents WHERE user_id = ? ORDER BY updated_at DESC')
    const rows = stmt.all(userId) as any[]
    return rows.map(ContentModel.mapRowToContent)
  },

  findById: (id: string): Content | undefined => {
    const stmt = db.prepare('SELECT * FROM contents WHERE id = ?')
    const row = stmt.get(id) as any
    return row ? ContentModel.mapRowToContent(row) : undefined
  },

  update: (id: string, updates: Partial<ContentCreateInput>): Content | undefined => {
    const existing = ContentModel.findById(id)
    if (!existing) return undefined

    const now = new Date().toISOString()
    const stmt = db.prepare(`
      UPDATE contents SET
        title = ?,
        body = ?,
        tags = ?,
        images = ?,
        media_type = ?,
        media_files = ?,
        thumbnail = ?,
        platforms = ?,
        platform_content = ?,
        updated_at = ?
      WHERE id = ?
    `)
    stmt.run(
      updates.title ?? existing.title,
      updates.body ?? existing.body,
      JSON.stringify(updates.tags ?? existing.tags),
      JSON.stringify(updates.images ?? existing.images),
      updates.media_type ?? existing.media_type,
      JSON.stringify(updates.media_files ?? existing.media_files),
      updates.thumbnail ?? existing.thumbnail ?? null,
      JSON.stringify(updates.platforms ?? existing.platforms),
      JSON.stringify(updates.platform_content ?? existing.platform_content),
      now,
      id
    )
    return ContentModel.findById(id)
  },

  delete: (id: string): boolean => {
    const stmt = db.prepare('DELETE FROM contents WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  },

  mapRowToContent: (row: any): Content => ({
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    body: row.body,
    tags: JSON.parse(row.tags || '[]'),
    images: JSON.parse(row.images || '[]'),
    media_type: row.media_type || 'text',
    media_files: JSON.parse(row.media_files || '[]'),
    thumbnail: row.thumbnail || undefined,
    platforms: JSON.parse(row.platforms || '[]'),
    platform_content: JSON.parse(row.platform_content || '{}'),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }),
}
