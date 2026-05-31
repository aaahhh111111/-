# 部署指南

## 架构

- **前端**: Vercel (React + Vite)
- **后端**: Railway (Express + SQLite)

---

## 1. 部署后端 (Railway)

### 1.1 创建 Railway 账号
1. 访问 https://railway.app
2. 用 GitHub 登录

### 1.2 部署步骤
1. 点击 **New Project** → **Deploy from GitHub repo**
2. 选择你的仓库
3. Railway 会自动检测到 `server` 目录
4. 点击 **Deploy** 开始部署

### 1.3 获取后端 URL
部署完成后，Railway 会给你一个 URL，例如：
```
https://your-app.up.railway.app
```

复制这个 URL，后面会用到。

### 1.4 设置环境变量（可选）
如果需要，可以设置：
- `PORT`: 端口（Railway 会自动设置）

---

## 2. 部署前端 (Vercel)

### 2.1 创建 Vercel 账号
1. 访问 https://vercel.com
2. 用 GitHub 登录

### 2.2 部署步骤
1. 点击 **Add New...** → **Project**
2. 导入你的 GitHub 仓库
3. 设置：
   - **Framework Preset**: Vite
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 设置环境变量
在 Vercel 项目设置中添加：
- **Variable Name**: `VITE_API_URL`
- **Value**: 你的 Railway 后端 URL（上面第 1.3 步的 URL）

### 2.4 部署
点击 **Deploy**

---

## 3. 浏览器扩展配置

部署后，修改扩展的 `content.js` 中的 API 地址为你的 Railway URL。

---

## 成本

- Railway: 免费额度足够个人使用
- Vercel: 免费额度足够个人使用

---

## 更新代码

推送代码到 GitHub 后：
- Railway: 会自动重新部署
- Vercel: 会自动重新部署

或者手动触发：
- Railway: 在项目页面点击 **Redeploy**
- Vercel: 在项目页面点击 **Redeploy**
