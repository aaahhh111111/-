import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database/sqlite';
import authRoutes from './controllers/authController';
import contentRoutes from './controllers/contentController';
import publishRoutes from './controllers/publishController';
import { authMiddleware } from './middleware/auth';
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '10mb' }));
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
initializeDatabase();
app.use('/api/auth', authRoutes);
app.use('/api/content', authMiddleware, contentRoutes);
app.use('/api/publish', authMiddleware, publishRoutes);
app.get('/api/platforms', (req, res) => {
    const platforms = [
        {
            id: 'wechat',
            name: '微信公众号',
            icon: 'message-circle',
            color: '#07c160',
            rules: {
                maxTitleLength: 64,
                maxBodyLength: 20000,
                allowedTags: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'br'],
                specialFeatures: ['html格式', '引导关注'],
            },
        },
        {
            id: 'zhihu',
            name: '知乎',
            icon: 'help-circle',
            color: '#0066ff',
            rules: {
                maxTitleLength: 100,
                maxBodyLength: 50000,
                allowedTags: ['markdown'],
                specialFeatures: ['Markdown支持', '话题标签'],
            },
        },
        {
            id: 'bilibili',
            name: 'B站',
            icon: 'video',
            color: '#fb7299',
            rules: {
                maxTitleLength: 30,
                maxBodyLength: 5000,
                allowedTags: ['纯文本'],
                specialFeatures: ['精简分段', '话题标签'],
            },
        },
        {
            id: 'xiaohongshu',
            name: '小红书',
            icon: 'book-open',
            color: '#fe2c55',
            rules: {
                maxTitleLength: 20,
                maxBodyLength: 1000,
                allowedTags: ['emoji增强'],
                specialFeatures: ['Emoji优化', '移动端优化'],
            },
        },
    ];
    res.json(platforms);
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map