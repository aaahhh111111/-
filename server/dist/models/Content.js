import { db } from '../database/sqlite';
import { v4 as uuidv4 } from 'uuid';
export const ContentModel = {
    create: (input) => {
        const id = uuidv4();
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      INSERT INTO contents (id, user_id, title, body, tags, images, platforms, platform_content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        stmt.run(id, input.user_id, input.title, input.body || '', JSON.stringify(input.tags || []), JSON.stringify(input.images || []), JSON.stringify(input.platforms || []), JSON.stringify(input.platform_content || {}), now, now);
        return {
            id,
            user_id: input.user_id,
            title: input.title,
            body: input.body || '',
            tags: input.tags || [],
            images: input.images || [],
            platforms: input.platforms || [],
            platform_content: input.platform_content || {},
            created_at: now,
            updated_at: now,
        };
    },
    findByUserId: (userId) => {
        const stmt = db.prepare('SELECT * FROM contents WHERE user_id = ? ORDER BY updated_at DESC');
        const rows = stmt.all(userId);
        return rows.map(ContentModel.mapRowToContent);
    },
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM contents WHERE id = ?');
        const row = stmt.get(id);
        return row ? ContentModel.mapRowToContent(row) : undefined;
    },
    update: (id, updates) => {
        const existing = ContentModel.findById(id);
        if (!existing)
            return undefined;
        const now = new Date().toISOString();
        const stmt = db.prepare(`
      UPDATE contents SET
        title = ?,
        body = ?,
        tags = ?,
        images = ?,
        platforms = ?,
        platform_content = ?,
        updated_at = ?
      WHERE id = ?
    `);
        stmt.run(updates.title ?? existing.title, updates.body ?? existing.body, JSON.stringify(updates.tags ?? existing.tags), JSON.stringify(updates.images ?? existing.images), JSON.stringify(updates.platforms ?? existing.platforms), JSON.stringify(updates.platform_content ?? existing.platform_content), now, id);
        return ContentModel.findById(id);
    },
    delete: (id) => {
        const stmt = db.prepare('DELETE FROM contents WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    },
    mapRowToContent: (row) => ({
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        body: row.body,
        tags: JSON.parse(row.tags || '[]'),
        images: JSON.parse(row.images || '[]'),
        platforms: JSON.parse(row.platforms || '[]'),
        platform_content: JSON.parse(row.platform_content || '{}'),
        created_at: row.created_at,
        updated_at: row.updated_at,
    }),
};
//# sourceMappingURL=Content.js.map