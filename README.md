## 项目演示视频
<center>
<video width="600" controls>
  <source src="https://user-images.githubusercontent.com/213208978/600633827-46428234-10ab-44e0-bf50-eccd5979aa2a.mp4" type="video/mp4">
</video>
</center>

# 多平台内容发布工具

一款帮助创作者在微信公众号、知乎、B站、小红书等平台同步发布内容的工具，自动适配各平台格式与风格。

## 功能特性

- **用户认证**: 注册/登录系统，JWT令牌认证
- **富文本编辑**: 支持粗体、斜体、标题、列表、引用等格式
- **多平台适配**: 微信公众号、知乎、B站、小红书
- **一键预览**: 实时预览各平台适配效果
- **真实平台发布**: 使用浏览器自动化一键打开平台编辑器并自动填入内容
- **毛玻璃UI**: 现代美观的毛玻璃界面设计

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS
- TipTap 富文本编辑器
- Zustand 状态管理

### 后端
- Node.js + Express
- TypeScript
- SQLite 数据库
- JWT 认证
- Playwright 浏览器自动化

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 启动服务

```bash
# 终端1: 启动后端 (端口 3000)
cd server
npm run dev

# 终端2: 启动前端 (端口 5173)
cd client
npm run dev
```

### 3. 访问应用

打开浏览器访问: http://localhost:5173

## 使用流程

1. **注册账号** - 创建新的用户账号
2. **登录** - 使用邮箱和密码登录
3. **授权平台** - 首次使用在设置页面授权各平台
4. **创建内容** - 点击"新建内容"开始创作
5. **编辑内容** - 使用富文本编辑器编写正文
6. **添加标签** - 为内容添加标签便于分类
7. **选择平台** - 勾选要发布的目标平台
8. **一键发布** - 自动打开平台编辑器并填入内容

## 平台适配规则

| 平台 | 标题限制 | 正文限制 | 格式 |
|------|----------|----------|------|
| 微信公众号 | 64字符 | 20000字符 | HTML |
| 知乎 | 100字符 | 50000字符 | Markdown |
| B站 | 40字符 | 5000字符 | 精简文本 |
| 小红书 | 20字符 | 1000字符 | Emoji增强 |

## 扩展新平台

详见 [SPEC.md](SPEC.md) 中的"平台适配器扩展架构"章节。

## 项目结构

```
multi-platform-publisher/
├── client/           # React前端
├── server/           # Node.js后端
├── SPEC.md           # 项目规格说明
└── README.md         # 本文件
```

## License

MIT
