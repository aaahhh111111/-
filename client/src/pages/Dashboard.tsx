import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Trash2, Clock, LogOut, Loader2, Settings } from 'lucide-react'
import { GlassButton, GlassCard } from '@/components/ui'
import { contentApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { Content } from '@/types'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadContents()
  }, [])

  const loadContents = async () => {
    try {
      const data = await contentApi.getAll()
      setContents(data)
    } catch (error) {
      console.error('Failed to load contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这篇内容吗？')) return

    setDeletingId(id)
    try {
      await contentApi.delete(id)
      setContents((prev) => prev.filter((c) => c.id !== id))
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const platformNames: Record<string, string> = {
    wechat: '微信公众号',
    zhihu: '知乎',
    bilibili: 'B站',
    xiaohongshu: '小红书',
  }

  const platformColors: Record<string, string> = {
    wechat: 'bg-green-500/20 text-green-300 border-green-400/30',
    zhihu: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
    bilibili: 'bg-pink-500/20 text-pink-300 border-pink-400/30',
    xiaohongshu: 'bg-red-500/20 text-red-300 border-red-400/30',
  }

  return (
    <div className="min-h-screen gradient-bg">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">多平台发布工具</h1>
            <p className="text-white/50 text-sm">内容管理</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="平台授权设置"
            >
              <Settings className="w-5 h-5" />
            </button>
            <div className="text-right">
              <p className="text-white font-medium">{user?.username}</p>
              <p className="text-white/50 text-sm">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">我的内容</h2>
            <p className="text-white/60 mt-1">管理你的创作内容并发布到各平台</p>
          </div>

          <GlassButton onClick={() => navigate('/editor')}>
            <Plus className="w-5 h-5" />
            新建内容
          </GlassButton>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : contents.length === 0 ? (
          <GlassCard className="text-center py-20">
            <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white/80 mb-2">暂无内容</h3>
            <p className="text-white/50 mb-6">开始创建你的第一篇内容吧</p>
            <GlassButton onClick={() => navigate('/editor')}>
              <Plus className="w-5 h-5" />
              创建内容
            </GlassButton>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <GlassCard key={content.id} variant="hover" className="group cursor-pointer" onClick={() => navigate(`/editor/${content.id}`)}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-medium text-white line-clamp-2 flex-1 pr-4">
                      {content.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(content.id)
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"
                      disabled={deletingId === content.id}
                    >
                      {deletingId === content.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-white/50 text-sm line-clamp-3 mb-4">
                    {content.body.replace(/<[^>]+>/g, '').substring(0, 100)}...
                  </p>

                  {content.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {content.platforms.map((platform) => (
                        <span
                          key={platform}
                          className={`px-2 py-1 rounded-full text-xs border ${platformColors[platform] || 'bg-white/10'}`}
                        >
                          {platformNames[platform] || platform}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Clock className="w-3 h-3" />
                    {formatDate(content.updatedAt)}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
