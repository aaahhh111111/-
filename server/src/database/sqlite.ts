import Database, { Database as DatabaseType } from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'publisher.db')

export const db: DatabaseType = new Database(dbPath)

db.pragma('journal_mode = WAL')

export function initializeDatabase() {
  // 创建表（不包含新列）
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      tags TEXT DEFAULT '[]',
      images TEXT DEFAULT '[]',
      platforms TEXT DEFAULT '[]',
      platform_content TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_contents_user_id ON contents(user_id);
  `)

  // 迁移：添加新列（如果不存在）
  const migrationQueries = [
    "ALTER TABLE contents ADD COLUMN media_type TEXT DEFAULT 'text'",
    "ALTER TABLE contents ADD COLUMN media_files TEXT DEFAULT '[]'",
    "ALTER TABLE contents ADD COLUMN thumbnail TEXT",
  ]

  for (const query of migrationQueries) {
    try {
      db.exec(query)
    } catch (error: any) {
      // 忽略 "duplicate column name" 错误
      if (!error.message.includes('duplicate column name')) {
        console.error('Migration error:', error.message)
      }
    }
  }

  console.log('Database initialized successfully')
}
