# 多平台内容发布工具 - 项目规格说明

## 1. 项目概述

### 项目名称
Multi-Platform Publisher (多平台内容发布工具)

### 核心功能
帮助创作者在微信公众号、知乎、B站、小红书等平台同步发布内容，自动适配各平台格式与风格，支持一键模拟发布。

### 目标用户
- 内容创作者
- 自媒体运营者
- 多平台运营团队

## 2. 技术架构

### 技术栈
| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.x |
| 前端构建 | Vite | 6.x |
| 类型系统 | TypeScript | 5.x |
| UI框架 | Tailwind CSS | 3.x |
| 富文本编辑 | TipTap | 2.x |
| 状态管理 | Zustand | 5.x |
| 后端框架 | Express | 4.x |
| 数据库 | SQLite (better-sqlite3) | 11.x |
| 认证 | JWT | 9.x |
| 密码加密 | bcryptjs | 2.x |

### 项目结构
```
multi-platform-publisher/
├── client/                    # React前端
│   ├── src/
│   │   ├── components/       # 组件
│   │   │   ├── Editor/       # 编辑器组件
│   │   │   └── ui/           # 毛玻璃UI组件
│   │   ├── pages/            # 页面
│   │   │   ├── Login.tsx     # 登录/注册页
│   │   │   ├── Dashboard.tsx # 内容管理仪表盘
│   │   │   └── Editor.tsx     # 内容编辑器页
│   │   ├── hooks/            # 自定义Hooks
│   │   ├── services/         # API调用
│   │   ├── store/            # Zustand状态管理
│   │   └── types/            # TypeScript类型定义
│   └── package.json
├── server/                    # Node.js后端
│   ├── src/
│   │   ├── adapters/         # 平台适配器
│   │   │   ├── BaseAdapter.ts        # 适配器基类
│   │   │   ├── WeChatAdapter.ts      # 微信公众号适配器
│   │   │   ├── ZhihuAdapter.ts       # 知乎适配器
│   │   │   ├── BilibiliAdapter.ts    # B站适配器
│   │   │   └── XiaohongshuAdapter.ts # 小红书适配器
│   │   ├── controllers/      # 路由控制器
│   │   ├── middleware/       # 中间件
│   │   ├── models/          # 数据模型
│   │   ├── database/        # 数据库配置
│   │   └── index.ts         # 服务入口
│   └── package.json
├── SPEC.md
└── README.md
```

## 3. 功能规格

### 3.1 用户认证系统
- **注册**: 用户名、邮箱、密码（6位以上）
- **登录**: 邮箱 + 密码
- **JWT认证**: 7天有效期
- **会话持久化**: localStorage存储

### 3.2 内容管理
- **创建内容**: 标题、正文、标签
- **编辑内容**: 富文本编辑器
- **删除内容**: 确认后删除
- **列表展示**: 卡片式布局，显示平台标签

### 3.3 富文本编辑器
- **格式支持**: 粗体、斜体、标题、列表、引用
- **快捷键**: Ctrl+B, Ctrl+I 等
- **实时预览**: 所见即所得

### 3.4 平台适配器系统

#### 微信公众号适配器
| 规则 | 值 |
|------|-----|
| 标题长度限制 | 64字符 |
| 正文长度限制 | 20000字符 |
| 输出格式 | HTML |
| 特殊处理 | 添加引导关注 |

#### 知乎适配器
| 规则 | 值 |
|------|-----|
| 标题长度限制 | 100字符 |
| 正文长度限制 | 50000字符 |
| 输出格式 | Markdown |
| 特殊处理 | 话题标签、敏感词检测 |

#### B站适配器
| 规则 | 值 |
|------|-----|
| 标题长度限制 | 30字符 |
| 正文长度限制 | 5000字符 |
| 输出格式 | 精简纯文本 |
| 特殊处理 | 话题标签、精简分段 |

#### 小红书适配器
| 规则 | 值 |
|------|-----|
| 标题长度限制 | 20字符 |
| 正文长度限制 | 1000字符 |
| 输出格式 | Emoji增强文本 |
| 特殊处理 | Emoji优化、移动端优化 |

### 3.5 模拟发布
- 显示发布进度动画
- 各平台依次模拟发布
- 展示发布结果（成功/失败）

## 4. API 规格

### 认证接口

#### POST /api/auth/register
```json
Request: { "username": "string", "email": "string", "password": "string" }
Response: { "token": "string", "user": { "id": "string", "username": "string", "email": "string" } }
```

#### POST /api/auth/login
```json
Request: { "email": "string", "password": "string" }
Response: { "token": "string", "user": { "id": "string", "username": "string", "email": "string" } }
```

#### GET /api/auth/profile
```
Header: Authorization: Bearer <token>
Response: { "id": "string", "username": "string", "email": "string" }
```

### 内容接口

#### GET /api/content
```
Header: Authorization: Bearer <token>
Response: Content[]
```

#### POST /api/content
```json
Request: { "title": "string", "body": "string", "tags": "string[]", "platforms": "string[]" }
Response: Content
```

#### PUT /api/content/:id
```json
Request: { "title": "string", "body": "string", "tags": "string[]", "platforms": "string[]" }
Response: Content
```

#### DELETE /api/content/:id
```
Response: 204 No Content
```

#### POST /api/content/:id/preview
```json
Request: { "platforms": "string[]" }
Response: Content (包含 platformContent)
```

#### POST /api/content/:id/publish
```json
Request: { "platforms": "string[]" }
Response: { "results": [{ "platform": "string", "status": "simulated", "message": "string" }] }
```

### 平台接口

#### GET /api/platforms
```json
Response: Platform[]
```

## 5. 平台适配器扩展架构

### 新增平台步骤

1. **创建适配器类** 继承 `BaseAdapter`
2. **实现抽象方法**:
   - `transformBody()`: 正文格式转换
   - `addPlatformFeatures()`: 平台特性处理
3. **注册适配器**: 在 `PlatformAdapterFactory` 中注册

```typescript
// 示例：新增微博适配器
class WeiboAdapter extends BaseAdapter {
  platformId = 'weibo'
  platformName = '微博'
  maxTitleLength = 30
  maxBodyLength = 2000

  protected transformBody(body: string): string {
    // 微博特定的格式转换
    return body.substring(0, 2000)
  }

  protected addPlatformFeatures(content: ContentInput, adapted: PlatformContent): void {
    // 添加微博话题标签等
    adapted.adaptedBody += ' #超话#'
  }
}
```

## 6. UI设计规格

### 毛玻璃效果
- 背景: `rgba(255, 255, 255, 0.15)`
- 模糊: `blur(20px)`
- 边框: `rgba(255, 255, 255, 0.3)`
- 阴影: `0 8px 32px rgba(0, 0, 0, 0.1)`

### 渐变背景
- 角度: -45deg
- 颜色: #ee7752, #e73c7e, #23a6d5, #23d5ab
- 动画: 15秒循环

### 响应式断点
| 设备 | 宽度 |
|------|------|
| 移动端 | < 640px |
| 平板 | 640px - 1024px |
| 桌面 | > 1024px |

## 7. 数据模型

### User
```typescript
interface User {
  id: string
  username: string
  email: string
  password: string (hashed)
  created_at: string
}
```

### Content
```typescript
interface Content {
  id: string
  user_id: string
  title: string
  body: string
  tags: string[]
  images: string[]
  platforms: string[]
  platform_content: Record<string, PlatformContent>
  created_at: string
  updated_at: string
}
```

### PlatformContent
```typescript
interface PlatformContent {
  adaptedTitle: string
  adaptedBody: string
  warnings: string[]
  characterCount: number
}
```

## 8. 运行说明

### 安装依赖
```bash
# 后端
cd server && npm install

# 前端
cd client && npm install
```

### 启动服务
```bash
# 终端1: 启动后端
cd server && npm run dev

# 终端2: 启动前端
cd client && npm run dev
```

### 访问应用
- 前端: http://localhost:5173
- 后端API: http://localhost:3000

## 9. 真实平台发布功能

### 功能概述
通过 Playwright 浏览器自动化技术，实现一键打开各平台编辑器并自动填入内容，用户在各平台手动确认发布。

### 技术实现
- **浏览器自动化**: Playwright (Chromium)
- **登录态管理**: storageState 保存浏览器上下文
- **自动填表**: 自动定位并填写标题、正文、标签等字段

### 支持平台
| 平台 | 编辑器URL | 填写字段 |
|------|-----------|----------|
| 微信公众号 | https://mp.weixin.qq.com/ | 标题、正文 |
| 知乎 | https://zhuanlan.zhihu.com/write | 标题、正文、话题 |
| 小红书 | https://creator.xiaohongshu.com/publish/publish | 标题、正文、标签 |
| B站 | https://member.bilibili.com/v2#/upload/article | 标题、正文、标签 |

### API接口

#### POST /api/publish/launch
```json
Request: {
  "title": "string",
  "body": "string",
  "tags": "string[]",
  "platforms": "string[]"
}
Response: {
  "success": true,
  "results": [
    { "platform": "wechat", "success": true, "url": "string" },
    { "platform": "zhihu", "success": true, "url": "string" }
  ]
}
```

#### GET /api/publish/auth-status
```json
Response: {
  "platforms": [
    { "platform": "wechat", "name": "微信公众号", "isAuthenticated": true, "needsLogin": false }
  ]
}
```

#### POST /api/publish/authenticate/:platform
```json
Response: { "success": true, "message": "授权成功" }
```

### 使用流程
1. **首次授权**: 在设置页面点击"去授权"，系统打开浏览器登录页面
2. **手动登录**: 用户在各平台登录并授权
3. **一键发布**: 点击发布按钮，系统自动打开各平台编辑器
4. **确认发布**: 用户在各平台预览内容并手动点击发布

### 目录结构
```
server/src/
├── services/
│   └── platformLauncher.ts      # 平台启动器
├── playwright/
│   ├── config.ts               # Playwright配置
│   └── platforms/
│       ├── BasePlatform.ts     # 平台基类
│       ├── wechat.ts          # 微信公众号
│       ├── zhihu.ts           # 知乎
│       ├── xiaohongshu.ts     # 小红书
│       └── bilibili.ts        # B站
└── playwright-storage/        # 登录态存储（需.gitignore）
```

### 注意事项
- 部分平台可能需要手动上传图片/封面
- 首次使用需要手动授权一次
- 登录态保存在本地文件，重启后需重新授权

## 10. 未来扩展方向

- [x] 真实平台浏览器自动化发布
- [ ] 真实平台API对接（需各平台开发者认证）
- [ ] 内容版本管理
- [ ] 定时发布
- [ ] 发布统计与分析
- [ ] 图片上传与管理
- [ ] 草稿箱功能
- [ ] 多语言支持
