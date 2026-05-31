export interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

export interface Platform {
  id: string
  name: string
  icon: string
  color: string
  rules: PlatformRules
}

export interface PlatformRules {
  maxTitleLength: number
  maxBodyLength: number
  allowedTags: string[]
  specialFeatures: string[]
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
  title: string
  body: string
  tags: string[]
  images: string[]
  media_type: MediaType
  media_files: MediaFile[]
  thumbnail?: string
  platforms: string[]
  platformContent: Record<string, PlatformContent>
  createdAt: string
  updatedAt: string
}

export interface ContentCreateInput {
  title: string
  body?: string
  tags?: string[]
  images?: string[]
  media_type?: MediaType
  media_files?: MediaFile[]
  thumbnail?: string
  platforms?: string[]
}

export interface PlatformContent {
  adaptedTitle: string
  adaptedBody: string
  warnings: string[]
  characterCount: number
}

export interface PublishResult {
  platform: string
  status: 'simulated' | 'success' | 'error'
  message: string
  publishedAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}
