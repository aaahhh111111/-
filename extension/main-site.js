// 七牛内容助手 - 主站脚本
// 在七牛App主站运行，监听保存事件并同步内容到扩展

console.log('七牛主站助手已启动')

// 监听 localStorage 变化
window.addEventListener('storage', async (e) => {
  if (e.key === 'qiniu_last_saved_content' && e.newValue) {
    try {
      const content = JSON.parse(e.newValue)
      if (content && content.title) {
        await syncToExtension(content)
      }
    } catch (err) {
      // 忽略
    }
  }
})

// 定时检查 localStorage（因为同一个页面内的变化不会触发 storage 事件）
setInterval(async () => {
  const contentStr = localStorage.getItem('qiniu_last_saved_content')
  if (contentStr) {
    try {
      const content = JSON.parse(contentStr)
      // 检查是否已经同步过（通过时间戳）
      const lastSync = localStorage.getItem('qiniu_last_sync')
      if (content.timestamp && content.timestamp !== lastSync) {
        await syncToExtension(content)
        localStorage.setItem('qiniu_last_sync', content.timestamp)
      }
    } catch (err) {
      // 忽略
    }
  }
}, 1000)

// 提供全局函数供主站调用
window.__qiniuSyncToExtension = async function(content) {
  try {
    await syncToExtension(content)
    console.log('内容已同步到扩展')
    return true
  } catch (err) {
    console.error('同步失败:', err)
    return false
  }
}

async function syncToExtension(content) {
  const message = {
    type: 'SAVE_CONTENT',
    contentId: content.id || content.contentId || Date.now().toString(),
    title: content.title,
    body: content.body,
    tags: content.tags || []
  }
  
  // 同时保存到 localStorage（供第三方页面读取）
  localStorage.setItem('qiniu_pending_content_id', message.contentId)
  
  // 先检查扩展是否可用
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
    console.log('扩展未安装，跳过同步')
    return
  }
  
  try {
    await chrome.runtime.sendMessage(message)
    console.log('已同步到扩展:', message.title)
  } catch (err) {
    // 忽略所有错误（扩展休眠、上下文失效等），不影响功能
  }
}

console.log('主站助手已初始化')
