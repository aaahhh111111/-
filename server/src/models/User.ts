import { db } from '../database/sqlite'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  email: string
  password: string
  created_at: string
}

export interface UserCreateInput {
  username: string
  email: string
  password: string
}

export const UserModel = {
  create: (input: UserCreateInput): User => {
    const id = uuidv4()
    const hashedPassword = bcrypt.hashSync(input.password, 10)
    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run(id, input.username, input.email, hashedPassword)
    return { ...input, id, password: hashedPassword, created_at: new Date().toISOString() }
  },

  findByEmail: (email: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as User | undefined
  },

  findById: (id: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as User | undefined
  },

  findByUsername: (username: string): User | undefined => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get(username) as User | undefined
  },

  verifyPassword: (user: User, password: string): boolean => {
    return bcrypt.compareSync(password, user.password)
  },
}
