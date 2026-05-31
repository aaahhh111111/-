import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  MessageCircle,
  HelpCircle,
  Video,
  BookOpen,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { NeoButton, NeoCard } from '@/components/ui/Neo'
import { publishApi, PlatformAuthStatus } from '@/services/api'

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

export default function Settings() {
  const navigate = useNavigate()
  const [authStatus, setAuthStatus] = useState<PlatformAuthStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [authenticating, setAuthenticating] = useState<string | null>(null)

  useEffect(() => {
    loadAuthStatus()
  }, [])

  const loadAuthStatus = async () => {
    setLoading(true)
    try {
      const response = await publishApi.getAuthStatus()
      setAuthStatus(response.platforms)
    } catch (error) {
      console.error('Failed to load auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAuthenticate = async (platformId: string) => {
    setAuthenticating(platformId)
    try {
      await publishApi.authenticate(platformId)
      await loadAuthStatus()
    } catch (error) {
      console.error('Authentication failed:', error)
      alert('授权失败，请重试')
    } finally {
      setAuthenticating(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      {/* Header */}
      <header className="bg-[#FFD93D] border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">平台授权设置</h1>
            <p className="text-sm text-black/60 font-bold uppercase tracking-wider">管理各平台登录状态</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Instructions */}
        <NeoCard bgColor="muted" className="mb-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5" strokeWidth={3} />
              <h2 className="font-black uppercase">授权说明</h2>
            </div>
            <p className="font-medium">
              点击"去授权"按钮，系统将打开各平台的登录页面。请使用你的账号登录并授权，系统会自动保存登录状态。
              首次授权后，后续使用无需重复登录。
            </p>
          </div>
        </NeoCard>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-black animate-spin" strokeWidth={3} />
          </div>
        ) : (
          <div className="space-y-4">
            {authStatus.map((platform) => {
              const colors = platformColors[platform.platform] || { bg: 'bg-gray-400', border: 'border-gray-600', text: 'text-gray-800' }
              return (
                <NeoCard key={platform.platform} bgColor="white">
                  <div className="p-6 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 border-4 border-black ${colors.bg}`}>
                        <span className={colors.text}>{platformIcons[platform.platform]}</span>
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-lg">{platform.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {platform.isAuthenticated ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-600" strokeWidth={3} />
                              <span className="font-bold text-green-600 uppercase text-sm">已授权</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-600" strokeWidth={3} />
                              <span className="font-bold text-red-600 uppercase text-sm">未授权</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={getPlatformUrl(platform.platform)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-white border-4 border-black hover:bg-[#C4B5FD] transition-all"
                        title="打开平台主页"
                      >
                        <ExternalLink className="w-5 h-5" strokeWidth={3} />
                      </a>

                      <NeoButton
                        onClick={() => handleAuthenticate(platform.platform)}
                        disabled={authenticating === platform.platform}
                        variant={platform.isAuthenticated ? 'secondary' : 'primary'}
                      >
                        {authenticating === platform.platform ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            处理中...
                          </>
                        ) : platform.isAuthenticated ? (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            重新授权
                          </>
                        ) : (
                          '去授权'
                        )}
                      </NeoButton>
                    </div>
                  </div>
                </NeoCard>
              )
            })}
          </div>
        )}

        {/* Notice */}
        <NeoCard bgColor="yellow" className="mt-8">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5" strokeWidth={3} />
              <h3 className="font-black uppercase">注意事项</h3>
            </div>
            <ul className="text-sm font-medium space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-lg">→</span>
                授权过程中请勿关闭浏览器窗口
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">→</span>
                登录后系统会自动保存登录状态到本地
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">→</span>
                如需解除授权，请删除浏览器缓存或点击"重新授权"
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">→</span>
                部分平台可能需要扫码或短信验证
              </li>
            </ul>
          </div>
        </NeoCard>
      </main>
    </div>
  )
}

function getPlatformUrl(platformId: string): string {
  const urls: Record<string, string> = {
    wechat: 'https://mp.weixin.qq.com/',
    zhihu: 'https://www.zhihu.com/',
    xiaohongshu: 'https://www.xiaohongshu.com/',
    bilibili: 'https://www.bilibili.com/',
  }
  return urls[platformId] || '#'
}
