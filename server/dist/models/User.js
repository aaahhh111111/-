import { db } from '../database/sqlite';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
export const UserModel = {
    create: (input) => {
        const id = uuidv4();
        const hashedPassword = bcrypt.hashSync(input.password, 10);
        const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password)
      VALUES (?, ?, ?, ?)
    `);
        stmt.run(id, input.username, input.email, hashedPassword);
        return { ...input, id, password: hashedPassword, created_at: new Date().toISOString() };
    },
    findByEmail: (email) => {
        const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    },
    findById: (id) => {
        const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    },
    findByUsername: (username) => {
        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    },
    verifyPassword: (user, password) => {
        return bcrypt.compareSync(password, user.password);
    },
};
//# sourceMappingURL=User.js.map