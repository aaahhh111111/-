import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'database.json')

interface Database {
  users: any[]
  contents: any[]
}

let db: Database = {
  users: [],
  contents: []
}

export function loadDatabase(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(data)
    }
  } catch (error) {
    console.log('创建新数据库...')
  }
  return db
}

export function saveDatabase(): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export function initializeDatabase(): void {
  loadDatabase()
  console.log('Database initialized successfully')
}

// Helper functions
export const users = {
  findByEmail: (email: string) => db.users.find(u => u.email === email),
  findById: (id: string) => db.users.find(u => u.id === id),
  findByUsername: (username: string) => db.users.find(u => u.username === username),
  create: (user: any) => {
    db.users.push(user)
    saveDatabase()
    return user
  }
}

export const contents = {
  findByUserId: (userId: string) => db.contents.filter(c => c.user_id === userId).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
  findById: (id: string) => db.contents.find(c => c.id === id),
  create: (content: any) => {
    db.contents.push(content)
    saveDatabase()
    return content
  },
  update: (id: string, updates: any) => {
    const index = db.contents.findIndex(c => c.id === id)
    if (index !== -1) {
      db.contents[index] = { ...db.contents[index], ...updates }
      saveDatabase()
      return db.contents[index]
    }
    return null
  },
  delete: (id: string) => {
    const index = db.contents.findIndex(c => c.id === id)
    if (index !== -1) {
      db.contents.splice(index, 1)
      saveDatabase()
      return true
    }
    return false
  }
}
