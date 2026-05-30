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
} from 'lucide-react'
import { GlassButton, GlassCard } from '@/components/ui'
import { publishApi, PlatformAuthStatus } from '@/services/api'

const platformIcons: Record<string, React.ReactNode> = {
  wechat: <MessageCircle className="w-6 h-6" />,
  zhihu: <HelpCircle className="w-6 h-6" />,
  bilibili: <Video className="w-6 h-6" />,
  xiaohongshu: <BookOpen className="w-6 h-6" />,
}

const platformColors: Record<string, string> = {
  wechat: 'text-green-400',
  zhihu: 'text-blue-400',
  bilibili: 'text-pink-400',
  xiaohongshu: 'text-red-400',
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
    <div className="min-h-screen gradient-bg">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">平台授权设置</h1>
            <p className="text-white/50 text-sm">管理各平台的登录状态</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-2">授权说明</h2>
          <p className="text-white/60">
            点击"去授权"按钮，系统将打开各平台的登录页面。请使用你的账号登录并授权，系统会自动保存登录状态。
            首次授权后，后续使用无需重复登录。
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {authStatus.map((platform) => (
              <GlassCard key={platform.platform}>
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`${platformColors[platform.platform]} p-3 rounded-xl bg-white/10`}>
                      {platformIcons[platform.platform]}
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">{platform.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {platform.isAuthenticated ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm">已授权</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 text-sm">未授权</span>
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
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                      title="打开平台主页"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>

                    <GlassButton
                      onClick={() => handleAuthenticate(platform.platform)}
                      disabled={authenticating === platform.platform}
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
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white font-medium mb-2">注意事项</h3>
          <ul className="text-white/60 text-sm space-y-1 list-disc list-inside">
            <li>授权过程中请勿关闭浏览器窗口</li>
            <li>登录后系统会自动保存登录状态到本地</li>
            <li>如需解除授权，请删除浏览器缓存或点击"重新授权"</li>
            <li>部分平台可能需要扫码或短信验证</li>
          </ul>
        </div>
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
