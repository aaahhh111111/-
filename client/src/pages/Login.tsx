import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Zap, Star } from 'lucide-react'
import { NeoButton, NeoCard, NeoInput } from '@/components/ui/Neo'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isRegister) {
        if (formData.password !== formData.confirmPassword) {
          setError('两次密码输入不一致')
          setLoading(false)
          return
        }

        const response = await authApi.register(formData.username, formData.email, formData.password)
        login(response.user, response.token)
      } else {
        const response = await authApi.login(formData.email, formData.password)
        login(response.user, response.token)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4 pattern-dots">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-4 bg-[#FFD93D] border-4 border-black shadow-[6px_6px_0px_0px_#000] rotate-3">
              <Zap className="w-10 h-10" strokeWidth={3} />
            </div>
            <div className="p-4 bg-[#FF6B6B] border-4 border-black shadow-[6px_6px_0px_0px_#000] -rotate-2">
              <Star className="w-10 h-10" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">多平台发布工具</h1>
          <p className="text-black/60 mt-2 font-bold uppercase tracking-wider text-sm">一键适配，多平台同步</p>
        </div>

        {/* Login Card */}
        <NeoCard bgColor="white">
          <div className="p-8">
            <h2 className="text-2xl font-black uppercase text-center mb-6">
              {isRegister ? '创建账号' : '欢迎回来'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <NeoInput
                  label="用户名"
                  name="username"
                  placeholder="请输入用户名"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              )}

              <NeoInput
                label="邮箱"
                type="email"
                name="email"
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <NeoInput
                label="密码"
                type="password"
                name="password"
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {isRegister && (
                <NeoInput
                  label="确认密码"
                  type="password"
                  name="confirmPassword"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              )}

              {error && (
                <div className="p-3 bg-[#FF6B6B] border-4 border-black text-white font-bold text-sm">
                  {error}
                </div>
              )}

              <NeoButton type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    处理中...
                  </>
                ) : isRegister ? (
                  '注册'
                ) : (
                  '登录'
                )}
              </NeoButton>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                }}
                className="font-bold underline underline-offset-4 hover:text-[#FF6B6B] transition-colors"
              >
                {isRegister ? (
                  <>
                    已有账号？<span className="uppercase">立即登录</span>
                  </>
                ) : (
                  <>
                    没有账号？<span className="uppercase">立即注册</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t-4 border-black">
              <p className="text-xs text-black/50 font-bold uppercase text-center tracking-wider">
                登录即表示同意服务条款和隐私政策
              </p>
            </div>
          </div>
        </NeoCard>

        {/* Platform Badges */}
        <div className="flex justify-center gap-3 mt-6">
          <span className="px-3 py-1 bg-green-400 border-2 border-black text-xs font-bold uppercase">微信</span>
          <span className="px-3 py-1 bg-blue-400 border-2 border-black text-xs font-bold uppercase">知乎</span>
          <span className="px-3 py-1 bg-pink-400 border-2 border-black text-xs font-bold uppercase">B站</span>
          <span className="px-3 py-1 bg-red-400 border-2 border-black text-xs font-bold uppercase">小红书</span>
        </div>
      </div>
    </div>
  )
}
