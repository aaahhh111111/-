import { Router, Response } from 'express'
import { UserModel } from '../models/User'
import { generateToken } from '../middleware/auth'
import type { AuthRequest } from '../middleware/auth'

const router = Router()

router.post('/register', (req, res: Response) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      res.status(400).json({ error: '请填写所有必填字段' })
      return
    }

    if (password.length < 6) {
      res.status(400).json({ error: '密码至少需要6个字符' })
      return
    }

    const existingUser = UserModel.findByEmail(email)
    if (existingUser) {
      res.status(400).json({ error: '该邮箱已被注册' })
      return
    }

    const existingUsername = UserModel.findByUsername(username)
    if (existingUsername) {
      res.status(400).json({ error: '该用户名已被使用' })
      return
    }

    const user = UserModel.create({ username, email, password })
    const token = generateToken(user.id)

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ error: '请填写邮箱和密码' })
      return
    }

    const user = UserModel.findByEmail(email)
    if (!user) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const isValid = UserModel.verifyPassword(user, password)
    if (!isValid) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const token = generateToken(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

router.get('/profile', (req, res: Response) => {
  try {
    const authReq = req as AuthRequest
    if (!authReq.userId) {
      res.status(401).json({ error: '未认证' })
      return
    }

    const user = UserModel.findById(authReq.userId)
    if (!user) {
      res.status(404).json({ error: '用户不存在' })
      return
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: '服务器内部错误' })
  }
})

export default router
