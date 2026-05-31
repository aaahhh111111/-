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
  Star,
  Zap,
} from 'lucide-react'
import { NeoButton, NeoCard, NeoInput } from '@/components/ui/Neo'
import RichEditor from '@/components/Editor/RichEditor'
import { contentApi, publishApi, uploadApi } from '@/services/api'
import type { Content, Platform, MediaFile, MediaType } from '@/types'

const platformIcons: Record<string, React.ReactNode> = {
  wechat: <MessageCircle className="w-6 h-6" strokeWidth={3} />,
  zhihu: <HelpCircle className="w-6 h-6" strokeWidth={3} />,
  bilibili: <Video className="w-6 h-6" strokeWidth={3} />,
  xiaohongshu: <BookOpen className="w-6 h-6" strokeWidth={3} />,
}

const platformColors: Record<string, { bg: string; border: string; text: string }> = {
  wechat: { bg: 'bg-green-400', border: 'border-green-600', text: 'text-green-800' },
  zhihu: { bg: 'bg-blue-400', border: 'border-blue-600', text: 'text-blue-800' },
  bilibili: { bg: 'bg-pink-400', border: 'border-pink-600', text: 'text-pink-800' },
  xiaohongshu: { bg: 'bg-red-400', border: 'border-red-600', text: 'text-red-800' },
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
      
      syncToExtension(savedContent)
    } catch (error) {
      console.error('Failed to save:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }
  
  const syncToExtension = async (contentData: any) => {
    try {
      const saveData = {
        id: contentData.id,
        title: contentData.title,
        body: contentData.body,
        tags: contentData.tags || [],
        media_files: contentData.media_files || [],
        timestamp: Date.now()
      }
      localStorage.setItem('qiniu_last_saved_content', JSON.stringify(saveData))
      localStorage.setItem('qiniu_pending_content_id', contentData.id)
      
      if (typeof window !== 'undefined' && (window as any).__qiniuSyncToExtension) {
        await (window as any).__qiniuSyncToExtension(saveData)
      }
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

      localStorage.setItem('qiniu_pending_content_id', data.contentId)
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
      <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
          <span className="font-bold uppercase tracking-wider">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-bold">
      {/* Header */}
      <header className="bg-[#FFD93D] border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              <ArrowLeft className="w-6 h-6" strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">
                {isEditing ? '编辑内容' : '新建内容'}
              </h1>
              <p className="text-sm text-black/60 uppercase tracking-wider">创作并发布到多个平台</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeoButton variant="white" size="sm" onClick={handlePreview} disabled={previewing}>
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              预览
            </NeoButton>

            <NeoButton variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              保存
            </NeoButton>

            <NeoButton onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              发布
            </NeoButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Editor */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Body Card */}
            <NeoCard bgColor="white">
              <div className="p-6 space-y-6">
                <NeoInput
                  label="标题"
                  placeholder="输入文章标题..."
                  value={content.title || ''}
                  onChange={(e) => setContent((prev) => ({ ...prev, title: e.target.value }))}
                />

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-black mb-2">
                    正文内容
                  </label>
                  <div className="border-4 border-black bg-white">
                    <RichEditor
                      content={content.body || ''}
                      onChange={(body) => setContent((prev) => ({ ...prev, body }))}
                    />
                  </div>
                </div>
              </div>
            </NeoCard>

            {/* Media Upload Card */}
            <NeoCard bgColor="yellow">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
                    <Zap className="w-5 h-5" strokeWidth={3} />
                    上传媒体
                  </label>
                  <span className="px-3 py-1 bg-black text-white text-xs font-bold uppercase">
                    {content.media_type}
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
                  className="w-full p-8 bg-white border-4 border-black border-dashed hover:bg-[#C4B5FD] hover:border-solid transition-all flex flex-col items-center gap-3"
                >
                  {uploading ? (
                    <Loader2 className="w-10 h-10 animate-spin" strokeWidth={3} />
                  ) : (
                    <Upload className="w-10 h-10" strokeWidth={3} />
                  )}
                  <span className="font-bold uppercase tracking-wide">
                    {uploading ? '上传中...' : '点击或拖拽上传'}
                  </span>
                  <span className="text-xs text-black/50">支持视频、图片、音频文件</span>
                </button>

                {/* Uploaded Files */}
                {content.media_files && content.media_files.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-sm font-bold uppercase tracking-wider text-black">已上传文件</span>
                    {content.media_files.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-4 bg-white border-4 border-black ${
                          content.thumbnail === file.id ? 'shadow-[4px_4px_0px_0px_#FF6B6B]' : ''
                        }`}
                      >
                        {file.type === 'video' ? (
                          <Film className="w-6 h-6 text-pink-600" strokeWidth={3} />
                        ) : file.type === 'image' ? (
                          <Image className="w-6 h-6 text-green-600" strokeWidth={3} />
                        ) : (
                          <Video className="w-6 h-6 text-blue-600" strokeWidth={3} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{file.filename}</p>
                          <p className="text-sm text-black/50">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {file.type === 'image' && (
                          <button
                            onClick={() => handleThumbnailSelect(file.id)}
                            className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black ${
                              content.thumbnail === file.id
                                ? 'bg-[#FF6B6B] text-white'
                                : 'bg-white hover:bg-[#FFD93D]'
                            }`}
                          >
                            封面
                          </button>
                        )}
                        <button
                          onClick={() => removeMediaFile(file.id)}
                          className="p-2 bg-[#FF6B6B] border-2 border-black hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </NeoCard>

            {/* Tags Card */}
            <NeoCard bgColor="muted">
              <div className="p-6">
                <label className="block text-sm font-bold uppercase tracking-wider text-black mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" strokeWidth={3} />
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {content.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-2 bg-white border-4 border-black font-bold uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0px_0px_#000]"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-black/50 hover:text-black"
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
                    placeholder="输入标签后按回车"
                    className="flex-1 h-12 px-4 bg-white border-4 border-black text-black font-bold placeholder:text-black/40 focus:bg-[#FFD93D] focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none"
                  />
                  <NeoButton variant="primary" size="sm" onClick={addTag}>
                    添加
                  </NeoButton>
                </div>
              </div>
            </NeoCard>
          </div>

          {/* Right Column - Platform Selection */}
          <div className="space-y-8">
            <NeoCard bgColor="black">
              <div className="p-6">
                <label className="block text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FFD93D]" strokeWidth={3} />
                  选择发布平台
                </label>
                <div className="space-y-3">
                  {platforms.map((platform) => {
                    const isSelected = content.platforms?.includes(platform.id)
                    const hasMultipleTypes = (platform as any).submissionTypes?.length > 1
                    const colors = platformColors[platform.id] || { bg: 'bg-gray-400', border: 'border-gray-600', text: 'text-gray-800' }

                    return (
                      <div key={platform.id} className="space-y-2">
                        <button
                          onClick={() => togglePlatform(platform.id)}
                          className={`
                            w-full p-4 border-4 border-black flex items-center gap-3 font-bold uppercase transition-all
                            ${isSelected 
                              ? `${colors.bg} shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none` 
                              : 'bg-white hover:bg-gray-100'
                            }
                          `}
                        >
                          <span className={isSelected ? '' : colors.text}>
                            {platformIcons[platform.id]}
                          </span>
                          <span className={isSelected ? 'text-black' : ''}>
                            {platform.name}
                          </span>
                          {isSelected && (
                            <CheckCircle className="w-6 h-6 text-black ml-auto" strokeWidth={3} />
                          )}
                        </button>

                        {/* Submission Types */}
                        {isSelected && hasMultipleTypes && (
                          <div className="flex flex-wrap gap-2 pl-2">
                            {(platform as any).submissionTypes.map((type: string) => (
                              <button
                                key={type}
                                onClick={() => handleSubmissionTypeChange(platform.id, type)}
                                className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black transition-all ${
                                  submissionTypes[platform.id] === type || (!submissionTypes[platform.id] && type === 'article')
                                    ? 'bg-[#FF6B6B] text-white'
                                    : 'bg-white hover:bg-[#C4B5FD]'
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
            </NeoCard>

            {/* Platform Preview */}
            {content.platformContent && Object.keys(content.platformContent).length > 0 && (
              <NeoCard bgColor="white">
                <div className="p-6">
                  <h3 className="font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5" strokeWidth={3} />
                    平台预览
                  </h3>
                  <div className="space-y-4">
                    {content.platforms?.map((platformId) => {
                      const pc = content.platformContent?.[platformId]
                      if (!pc) return null
                      const platform = platforms.find((p) => p.id === platformId)
                      const colors = platformColors[platformId] || { bg: 'bg-gray-400', border: 'border-gray-600', text: 'text-gray-800' }

                      return (
                        <div
                          key={platformId}
                          className={`p-4 border-4 border-black ${colors.bg}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span>{platformIcons[platformId]}</span>
                            <span className="font-bold uppercase">{platform?.name}</span>
                          </div>
                          <h4 className="font-bold mb-2">{pc.adaptedTitle}</h4>
                          <p className="text-sm text-black/70 line-clamp-3 mb-2">{pc.adaptedBody}</p>
                          <div className="flex items-center gap-4 text-xs font-bold">
                            <span>{pc.characterCount} 字</span>
                            {pc.warnings.length > 0 && (
                              <span className="flex items-center gap-1 text-red-700">
                                <AlertCircle className="w-4 h-4" strokeWidth={3} />
                                {pc.warnings[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </NeoCard>
            )}

            {/* Publish Results */}
            {showResults && publishResults.length > 0 && (
              <NeoCard bgColor="yellow">
                <div className="p-6 space-y-4">
                  <h3 className="font-black uppercase tracking-wider flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" strokeWidth={3} />
                    发布链接
                  </h3>
                  <div className="space-y-3">
                    {publishResults.map((result: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-white border-4 border-black"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{result.icon}</span>
                          <div className="flex-1">
                            <span className="font-bold">{result.name}</span>
                          </div>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#FF6B6B] border-4 border-black font-bold uppercase text-sm shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
                          >
                            前往
                            <ExternalLink className="w-4 h-4" strokeWidth={3} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-black/60 font-bold uppercase">
                    在平台上点击「七」按钮一键填入
                  </p>
                </div>
              </NeoCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
