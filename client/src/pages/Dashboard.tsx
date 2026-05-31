import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Trash2, Clock, LogOut, Loader2, Settings, Zap } from 'lucide-react'
import { NeoButton, NeoCard } from '@/components/ui/Neo'
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

  const platformColors: Record<string, { bg: string; text: string }> = {
    wechat: { bg: 'bg-green-400', text: 'text-green-800' },
    zhihu: { bg: 'bg-blue-400', text: 'text-blue-800' },
    bilibili: { bg: 'bg-pink-400', text: 'text-pink-800' },
    xiaohongshu: { bg: 'bg-red-400', text: 'text-red-800' },
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <header className="bg-[#FFD93D] border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black text-[#FFD93D] border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <Zap className="w-6 h-6" strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">多平台发布工具</h1>
              <p className="text-sm text-black/60 font-bold uppercase tracking-wider">内容管理</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              title="平台授权设置"
            >
              <Settings className="w-5 h-5" strokeWidth={3} />
            </button>
            <div className="text-right px-4 py-2 bg-white border-4 border-black">
              <p className="font-black">{user?.username}</p>
              <p className="text-sm text-black/50 font-bold">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 bg-[#FF6B6B] border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              title="退出登录"
            >
              <LogOut className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">我的内容</h2>
            <p className="text-black/60 mt-1 font-bold uppercase tracking-wider">管理你的创作并发布</p>
          </div>

          <NeoButton onClick={() => navigate('/editor')}>
            <Plus className="w-5 h-5" strokeWidth={3} />
            新建
          </NeoButton>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
          </div>
        ) : contents.length === 0 ? (
          <NeoCard bgColor="white">
            <div className="p-12 text-center">
              <FileText className="w-20 h-20 text-black/20 mx-auto mb-4" strokeWidth={2} />
              <h3 className="text-2xl font-black uppercase mb-2">暂无内容</h3>
              <p className="text-black/50 mb-6 font-bold uppercase tracking-wider">开始创建你的第一篇内容吧</p>
              <NeoButton onClick={() => navigate('/editor')}>
                <Plus className="w-5 h-5" strokeWidth={3} />
                创建内容
              </NeoButton>
            </div>
          </NeoCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <div
                key={content.id}
                onClick={() => navigate(`/editor/${content.id}`)}
                className="cursor-pointer"
              >
                <NeoCard bgColor="white">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-black line-clamp-2 flex-1 pr-4 uppercase">
                        {content.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(content.id)
                        }}
                        className="p-2 bg-[#FF6B6B] border-2 border-black hover:bg-white transition-all"
                        disabled={deletingId === content.id}
                      >
                        {deletingId === content.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={3} />
                        ) : (
                          <Trash2 className="w-4 h-4" strokeWidth={3} />
                        )}
                      </button>
                    </div>

                    <p className="text-black/60 text-sm line-clamp-3 mb-4 font-medium">
                      {content.body.replace(/<[^>]+>/g, '').substring(0, 100)}...
                    </p>

                    {content.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {content.platforms.map((platform) => {
                          const colors = platformColors[platform] || { bg: 'bg-gray-400', text: 'text-gray-800' }
                          return (
                            <span
                              key={platform}
                              className={`px-3 py-1 text-xs font-bold uppercase border-2 border-black ${colors.bg}`}
                            >
                              {platform}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-black/40 text-sm font-bold uppercase tracking-wider">
                      <Clock className="w-4 h-4" strokeWidth={3} />
                      {formatDate(content.updatedAt)}
                    </div>
                  </div>
                </NeoCard>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
