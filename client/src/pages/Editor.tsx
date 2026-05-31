import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Eye,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageCircle,
  HelpCircle,
  Video,
  BookOpen,
  ExternalLink,
  Upload,
  X,
  Image,
  Film,
} from 'lucide-react'
import { GlassButton, GlassCard, GlassInput } from '@/components/ui'
import RichEditor from '@/components/Editor/RichEditor'
import { contentApi, publishApi, uploadApi, LaunchResult } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Content, Platform, MediaFile, MediaType } from '@/types'

const platformIcons: Record<string, React.ReactNode> = {
  wechat: <MessageCircle className="w-5 h-5" />,
  zhihu: <HelpCircle className="w-5 h-5" />,
  bilibili: <Video className="w-5 h-5" />,
  xiaohongshu: <BookOpen className="w-5 h-5" />,
}

const platformColors: Record<string, string> = {
  wechat: 'border-green-400/50 bg-green-500/10',
  zhihu: 'border-blue-400/50 bg-blue-500/10',
  bilibili: 'border-pink-400/50 bg-pink-500/10',
  xiaohongshu: 'border-red-400/50 bg-red-500/10',
}

const platformTextColors: Record<string, string> = {
  wechat: 'text-green-400',
  zhihu: 'text-blue-400',
  bilibili: 'text-pink-400',
  xiaohongshu: 'text-red-400',
}

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [content, setContent] = useState<Partial<Content>>({
    title: '',
    body: '',
    tags: [],
    platforms: [],
    platformContent: {},
    media_type: 'text',
    media_files: [],
    thumbnail: undefined,
  })
  const [tagInput, setTagInput] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [publishResults, setPublishResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [submissionTypes, setSubmissionTypes] = useState<Record<string, string>>({})

  useEffect(() => {
    loadPlatforms()
    if (isEditing && id) {
      loadContent(id)
    }
  }, [id])

  const loadPlatforms = async () => {
    try {
      const { default: api } = await import('@/services/api')
      const response = await api.get('/platforms')
      setPlatforms(response.data)
    } catch (error) {
      console.error('Failed to load platforms:', error)
    }
  }

  const loadContent = async (contentId: string) => {
    try {
      const data = await contentApi.getById(contentId)
      setContent(data)
    } catch (error) {
      console.error('Failed to load content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content.title?.trim()) {
      alert('请输入标题')
      return
    }

    setSaving(true)
    try {
      let savedContent
      if (isEditing && id) {
        await contentApi.update(id, content)
        savedContent = { ...content, id, timestamp: Date.now() }
      } else {
        savedContent = await contentApi.create(content)
        savedContent.timestamp = Date.now()
        navigate(`/editor/${savedContent.id}`, { replace: true })
      }
      
      // 同步内容到扩展
      syncToExtension(savedContent)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }
  
  // 同步内容到浏览器扩展
  const syncToExtension = async (contentData: any) => {
    try {
      // 保存到 localStorage（供第三方页面读取）
      const saveData = {
        id: contentData.id,
        title: contentData.title,
        body: contentData.body,
        tags: contentData.tags || [],
        timestamp: Date.now()
      }
      localStorage.setItem('qiniu_last_saved_content', JSON.stringify(saveData))
      localStorage.setItem('qiniu_pending_content_id', contentData.id)
      
      // 通过全局函数触发主站脚本同步
      if (typeof window !== 'undefined' && (window as any).__qiniuSyncToExtension) {
        await (window as any).__qiniuSyncToExtension(saveData)
      }
      
      console.log('内容已同步到扩展')
    } catch (e) {
      console.warn('同步到扩展失败:', e)
    }
  }

  const handlePreview = async () => {
    if (!isEditing || !id) {
      alert('请先保存内容')
      return
    }

    if (content.platforms?.length === 0) {
      alert('请选择至少一个平台')
      return
    }

    setPreviewing(true)
    try {
      const data = await contentApi.preview(id, content.platforms!)
      setContent((prev) => ({
        ...prev,
        platformContent: data.platformContent,
        platforms: data.platforms,
      }))
    } catch (error) {
      console.error('Failed to preview:', error)
      alert('预览失败')
    } finally {
      setPreviewing(false)
    }
  }

  const handlePublish = async () => {
    if (!content.title?.trim()) {
      alert('请先填写标题')
      return
    }

    if (content.platforms?.length === 0) {
      alert('请选择至少一个平台')
      return
    }

    setPublishing(true)
    setShowResults(false)
    try {
      const data = await publishApi.prepare(
        content.title || '',
        content.body || '',
        content.tags || [],
        content.platforms!,
        {
          media_type: content.media_type,
          media_files: content.media_files,
          thumbnail: content.thumbnail,
          submission_types: submissionTypes,
        }
      )

      const launchResults: any[] = data.platforms.map((platform: any) => ({
        platform: platform.platform,
        name: platform.name,
        icon: platform.icon,
        status: 'link',
        url: platform.url,
        message: '点击链接前往发布',
      }))

      setPublishResults(launchResults)
      setShowResults(true)

      // 保存到 localStorage（供 hash 路由页面读取）
      localStorage.setItem('qiniu_pending_content_id', data.contentId)
      
      // 发布时再次同步内容到扩展（确保最新）
      syncToExtension({ ...content, id: data.contentId, timestamp: Date.now() })

      alert('已生成发布链接，请点击链接前往各平台')
    } catch (error: any) {
      console.error('Failed to prepare publish:', error)
      const errorMessage = error.response?.data?.error || error.message || '未知错误'
      alert(`准备发布失败: ${errorMessage}`)
    } finally {
      setPublishing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const fileArray = Array.from(files)
      const uploadedFiles = await uploadApi.uploadFiles(fileArray)

      setContent((prev) => {
        const newMediaFiles = [...(prev.media_files || []), ...uploadedFiles]
        const mediaType = determineMediaType(newMediaFiles)
        return {
          ...prev,
          media_files: newMediaFiles,
          media_type: mediaType,
        }
      })
    } catch (error) {
      console.error('Failed to upload files:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const determineMediaType = (files: MediaFile[]): MediaType => {
    if (files.some(f => f.type === 'video')) return 'video'
    if (files.some(f => f.type === 'image')) return 'image'
    if (files.some(f => f.type === 'audio')) return 'audio'
    return 'text'
  }

  const removeMediaFile = (fileId: string) => {
    setContent((prev) => {
      const newMediaFiles = prev.media_files?.filter(f => f.id !== fileId) || []
      const mediaType = newMediaFiles.length === 0 ? 'text' : determineMediaType(newMediaFiles)
      return {
        ...prev,
        media_files: newMediaFiles,
        media_type: mediaType,
      }
    })
  }

  const handleThumbnailSelect = (fileId: string) => {
    setContent((prev) => ({
      ...prev,
      thumbnail: prev.thumbnail === fileId ? undefined : fileId,
    }))
  }

  const togglePlatform = (platformId: string) => {
    setContent((prev) => ({
      ...prev,
      platforms: prev.platforms?.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...(prev.platforms || []), platformId],
    }))
  }

  const handleSubmissionTypeChange = (platformId: string, type: string) => {
    setSubmissionTypes((prev) => ({
      ...prev,
      [platformId]: type,
    }))
  }

  const getSelectedPlatformSubmissionTypes = (platformId: string): string[] => {
    const platform = platforms.find(p => p.id === platformId)
    return (platform as any)?.submissionTypes || ['article']
  }

  const getSubmissionTypeName = (platformId: string, type: string): string => {
    const platform = platforms.find(p => p.id === platformId)
    return (platform as any)?.submissionTypeNames?.[type] || type
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    if (content.tags?.includes(tagInput.trim())) return

    setContent((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setContent((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag),
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {isEditing ? '编辑内容' : '新建内容'}
              </h1>
              <p className="text-white/50 text-sm">创作并发布到多个平台</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <GlassButton variant="secondary" onClick={handlePreview} disabled={previewing}>
              {previewing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              预览适配
            </GlassButton>

            <GlassButton variant="secondary" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              保存
            </GlassButton>

            <GlassButton onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              一键发布
            </GlassButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <div className="p-6 space-y-4">
                <GlassInput
                  label="标题"
                  placeholder="输入文章标题..."
                  value={content.title || ''}
                  onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
                />

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">正文内容</label>
                  <RichEditor
                    content={content.body || ''}
                    onChange={(body) => setContent((prev) => ({ ...prev, body }))}
                  />
                </div>
              </div>
            </GlassCard>

            {/* 媒体上传区域 */}
            <GlassCard>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-white/80">上传媒体</label>
                  <span className="text-xs text-white/50">
                    当前类型: <span className="text-pink-400 capitalize">{content.media_type}</span>
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="video/*,image/*,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full p-6 border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors flex flex-col items-center gap-2 text-white/60 hover:text-white/80"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                  <span>{uploading ? '上传中...' : '点击或拖拽文件到此处上传'}</span>
                  <span className="text-xs text-white/40">支持视频、图片、音频文件</span>
                </button>

                {/* 已上传文件列表 */}
                {content.media_files && content.media_files.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80">已上传文件</label>
                    {content.media_files.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          content.thumbnail === file.id
                            ? 'border-pink-400 bg-pink-500/10'
                            : 'border-white/20 bg-white/5'
                        }`}
                      >
                        {file.type === 'video' ? (
                          <Film className="w-5 h-5 text-pink-400" />
                        ) : file.type === 'image' ? (
                          <Image className="w-5 h-5 text-green-400" />
                        ) : (
                          <Video className="w-5 h-5 text-blue-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm truncate">{file.filename}</p>
                          <p className="text-white/50 text-xs">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {file.type === 'image' && (
                          <button
                            onClick={() => handleThumbnailSelect(file.id)}
                            className={`px-2 py-1 text-xs rounded ${
                              content.thumbnail === file.id
                                ? 'bg-pink-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            封面
                          </button>
                        )}
                        <button
                          onClick={() => removeMediaFile(file.id)}
                          className="p-1 text-white/50 hover:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <div className="p-6">
                <label className="block text-sm font-medium text-white/80 mb-3">标签</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {content.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-white/50 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="添加标签后按回车"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 outline-none focus:border-white/40"
                  />
                  <GlassButton variant="secondary" size="sm" onClick={addTag}>
                    添加
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard>
              <div className="p-6">
                <label className="block text-sm font-medium text-white/80 mb-3">选择发布平台</label>
                <div className="space-y-3">
                  {platforms.map((platform) => {
                    const isSelected = content.platforms?.includes(platform.id)
                    const hasMultipleTypes = (platform as any).submissionTypes?.length > 1

                    return (
                      <div key={platform.id} className="space-y-2">
                        <button
                          onClick={() => togglePlatform(platform.id)}
                          className={`
                            w-full p-4 rounded-xl border transition-all flex items-center gap-3
                            ${isSelected
                              ? platformColors[platform.id]
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }
                          `}
                        >
                          <span className={platformTextColors[platform.id] || 'text-white'}>
                            {platformIcons[platform.id]}
                          </span>
                          <span className="text-white font-medium">{platform.name}</span>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                          )}
                        </button>

                        {/* 发布类型选择 */}
                        {isSelected && hasMultipleTypes && (
                          <div className="flex flex-wrap gap-2 pl-4">
                            {(platform as any).submissionTypes.map((type: string) => (
                              <button
                                key={type}
                                onClick={() => handleSubmissionTypeChange(platform.id, type)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                  submissionTypes[platform.id] === type || (!submissionTypes[platform.id] && type === 'article')
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                }`}
                              >
                                {(platform as any).submissionTypeNames?.[type] || type}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </GlassCard>

            {content.platformContent && Object.keys(content.platformContent).length > 0 && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-white font-medium mb-4">平台适配预览</h3>
                  <div className="space-y-4">
                    {content.platforms?.map((platformId) => {
                      const pc = content.platformContent?.[platformId]
                      if (!pc) return null
                      const platform = platforms.find((p) => p.id === platformId)

                      return (
                        <div
                          key={platformId}
                          className={`p-4 rounded-xl border ${platformColors[platformId] || 'border-white/20'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={platformTextColors[platformId] || 'text-white'}>
                              {platformIcons[platformId]}
                            </span>
                            <span className="text-white font-medium">{platform?.name}</span>
                            {submissionTypes[platformId] && (
                              <span className="text-xs text-white/50 ml-1">
                                ({(platform as any)?.submissionTypeNames?.[submissionTypes[platformId]]})
                              </span>
                            )}
                          </div>
                          <h4 className="text-white/90 font-medium mb-2">{pc.adaptedTitle}</h4>
                          <p className="text-white/60 text-sm line-clamp-3 mb-2">{pc.adaptedBody}</p>
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <span>{pc.characterCount} 字</span>
                            {pc.warnings.length > 0 && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <AlertCircle className="w-3 h-3" />
                                {pc.warnings[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </GlassCard>
            )}

            {showResults && publishResults.length > 0 && (
              <GlassCard>
                <div className="p-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-blue-400" />
                    发布链接 - 点击前往各平台
                  </h3>
                  <div className="space-y-3">
                    {publishResults.map((result: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{result.icon}</span>
                          <div className="flex-1">
                            <span className="text-white font-medium">{result.name}</span>
                            {result.submissionType && (
                              <span className="text-white/50 text-sm ml-2">({result.submissionType})</span>
                            )}
                          </div>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                          >
                            前往发布
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                        <p className="text-white/50 text-xs mt-2">点击后在平台上点击「七」按钮一键填入内容</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/60 text-sm mt-4 text-center">
                    请在每个平台编辑器中点击浏览器工具栏的「七牛」扩展图标
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
