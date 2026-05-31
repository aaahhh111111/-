import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import type { AuthResponse, Content, User, MediaFile } from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { username, email, password })
    return data
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password })
    return data
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/profile')
    return data
  },
}

export const contentApi = {
  getAll: async (): Promise<Content[]> => {
    const { data } = await api.get<Content[]>('/content')
    return data
  },

  getById: async (id: string): Promise<Content> => {
    const { data } = await api.get<Content>(`/content/${id}`)
    return data
  },

  create: async (content: Partial<Content>): Promise<Content> => {
    const { data } = await api.post<Content>('/content', content)
    return data
  },

  update: async (id: string, content: Partial<Content>): Promise<Content> => {
    const { data } = await api.put<Content>(`/content/${id}`, content)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/content/${id}`)
  },

  preview: async (id: string, platforms: string[]): Promise<Content> => {
    const { data } = await api.post<Content>(`/content/${id}/preview`, { platforms })
    return data
  },

  publish: async (id: string, platforms: string[]): Promise<{ results: Content[] }> => {
    const { data } = await api.post<{ results: Content[] }>(`/content/${id}/publish`, { platforms })
    return data
  },
}

export interface PlatformAuthStatus {
  platform: string
  name: string
  isAuthenticated: boolean
  needsLogin: boolean
}

export interface LaunchResult {
  success: boolean
  platform: string
  url: string
  error?: string
}

export const publishApi = {
  prepare: async (
    title: string,
    body: string,
    tags: string[],
    platforms: string[],
    options?: {
      media_type?: string
      media_files?: MediaFile[]
      thumbnail?: string
      submission_types?: Record<string, string>
    }
  ): Promise<{ success: boolean; contentId: string; platforms: any[]; message: string }> => {
    const { data } = await api.post<{ success: boolean; contentId: string; platforms: any[]; message: string }>('/publish/prepare', {
      title,
      body,
      tags,
      platforms,
      ...options,
    })
    return data
  },

  launch: async (
    title: string,
    body: string,
    tags: string[],
    platforms: string[],
    options?: {
      media_type?: string
      media_files?: MediaFile[]
      thumbnail?: string
      submission_types?: Record<string, string>
    }
  ): Promise<{ success: boolean; results: LaunchResult[]; message: string }> => {
    const { data } = await api.post<{ success: boolean; results: LaunchResult[]; message: string }>('/publish/launch', {
      title,
      body,
      tags,
      platforms,
      ...options,
    })
    return data
  },

  getAuthStatus: async (): Promise<{ platforms: PlatformAuthStatus[] }> => {
    const { data } = await api.get<{ platforms: PlatformAuthStatus[] }>('/publish/auth-status')
    return data
  },

  authenticate: async (platform: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const { data } = await api.post<{ success: boolean; message?: string; error?: string }>(`/publish/authenticate/${platform}`)
    return data
  },
}

export const uploadApi = {
  uploadFile: async (file: File): Promise<MediaFile> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<MediaFile>('/upload/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  uploadFiles: async (files: File[]): Promise<MediaFile[]> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    const { data } = await api.post<MediaFile[]>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },
}

export default api
