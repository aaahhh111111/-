import { users } from '../database/json'
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
    const user: User = {
      id,
      username: input.username,
      email: input.email,
      password: hashedPassword,
      created_at: new Date().toISOString()
    }
    users.create(user)
    return user
  },

  findByEmail: (email: string): User | undefined => {
    return users.findByEmail(email)
  },

  findById: (id: string): User | undefined => {
    return users.findById(id)
  },

  findByUsername: (username: string): User | undefined => {
    return users.findByUsername(username)
  },

  verifyPassword: (user: User, password: string): boolean => {
    return bcrypt.compareSync(password, user.password)
  },
}
