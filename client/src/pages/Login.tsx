import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { GlassButton, GlassInput } from '@/components/ui'
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
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">多平台发布工具</h1>
          <p className="text-white/70">一键适配，多平台同步发布</p>
        </div>

        <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            {isRegister ? '创建账号' : '欢迎回来'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <GlassInput
                label="用户名"
                name="username"
                placeholder="请输入用户名"
                value={formData.username}
                onChange={handleChange}
                required
              />
            )}

            <GlassInput
              label="邮箱"
              type="email"
              name="email"
              placeholder="请输入邮箱"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <GlassInput
              label="密码"
              type="password"
              name="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {isRegister && (
              <GlassInput
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
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-3 text-red-200 text-sm">
                {error}
              </div>
            )}

            <GlassButton type="submit" className="w-full" size="lg" disabled={loading}>
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
            </GlassButton>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              {isRegister ? (
                <>
                  已有账号？<span className="underline">立即登录</span>
                </>
              ) : (
                <>
                  没有账号？<span className="underline">立即注册</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-white/50 text-xs text-center">
              登录即表示同意我们的服务条款和隐私政策
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-6 text-white/50 text-sm">
          <span>微信公众号</span>
          <span>|</span>
          <span>知乎</span>
          <span>|</span>
          <span>B站</span>
          <span>|</span>
          <span>小红书</span>
        </div>
      </div>
    </div>
  )
}
