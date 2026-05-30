import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { GlassButton, GlassCard, GlassInput } from '@/components/ui'
import RichEditor from '@/components/Editor/RichEditor'
import { contentApi, publishApi, LaunchResult } from '@/services/api'
import type { Content, Platform } from '@/types'

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

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  const [content, setContent] = useState<Partial<Content>>({
    title: '',
    body: '',
    tags: [],
    platforms: [],
    platformContent: {},
  })
  const [tagInput, setTagInput] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [publishResults, setPublishResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)

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
      if (isEditing && id) {
        await contentApi.update(id, content)
      } else {
        const created = await contentApi.create(content)
        navigate(`/editor/${created.id}`, { replace: true })
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
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
    if (!isEditing || !id) {
      alert('请先保存内容')
      return
    }

    if (content.platforms?.length === 0) {
      alert('请选择至少一个平台')
      return
    }

    setPublishing(true)
    setShowResults(false)
    try {
      const data = await publishApi.launch(
        content.title || '',
        content.body || '',
        content.tags || [],
        content.platforms!
      )

      const launchResults: any[] = data.results.map((result: LaunchResult) => ({
        platform: result.platform,
        status: result.success ? 'redirect' : 'error',
        message: result.success ? '已在浏览器中打开编辑器' : (result.error || '启动失败'),
        url: result.url,
      }))

      setPublishResults(launchResults)
      setShowResults(true)

      if (data.success && data.results.some((r: LaunchResult) => r.success)) {
        alert('已打开各平台编辑器，请在浏览器中确认发布')
      }
    } catch (error) {
      console.error('Failed to publish:', error)
      alert('启动失败，请确保后端服务正在运行')
    } finally {
      setPublishing(false)
    }
  }

  const togglePlatform = (platformId: string) => {
    setContent((prev) => ({
      ...prev,
      platforms: prev.platforms?.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...(prev.platforms || []), platformId],
    }))
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
              模拟发布
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
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      className={`
                        w-full p-4 rounded-xl border transition-all flex items-center gap-3
                        ${
                          content.platforms?.includes(platform.id)
                            ? platformColors[platform.id]
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }
                      `}
                    >
                      <span className={platformTextColors[platform.id] || 'text-white'}>
                        {platformIcons[platform.id]}
                      </span>
                      <span className="text-white font-medium">{platform.name}</span>
                      {content.platforms?.includes(platform.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                      )}
                    </button>
                  ))}
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
                  <h3 className="text-white font-medium mb-4">发布结果</h3>
                  <div className="space-y-3">
                    {publishResults.map((result: any, index: number) => {
                      const platform = platforms.find((p) => p.id === result.platform)
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border ${
                            result.status === 'redirect'
                              ? 'border-green-400/50 bg-green-500/10'
                              : result.status === 'simulated'
                              ? 'border-green-400/50 bg-green-500/10'
                              : 'border-red-400/50 bg-red-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={platformTextColors[result.platform] || 'text-white'}>
                              {platformIcons[result.platform]}
                            </span>
                            <span className="text-white font-medium">{platform?.name}</span>
                            {result.status === 'redirect' || result.status === 'simulated' ? (
                              <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-400 ml-auto" />
                            )}
                          </div>
                          <p className="text-white/70 text-sm mt-2">{result.message}</p>
                          {result.url && result.url !== 'about:blank' && (
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-400 text-sm mt-2 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              打开编辑器
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
