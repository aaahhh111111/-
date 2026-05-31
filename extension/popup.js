// 七牛内容助手 - Popup 页面
// 显示扩展状态并提供一键填入功能

// 当前存储的内容
let currentContent = null
let currentContentId = null

// 加载保存的内容
async function loadContent() {
  // 1. 先尝试从扩展存储获取
  const result = await chrome.storage.local.get(['current_content', 'current_content_id'])
  if (result.current_content) {
    currentContent = result.current_content
    currentContentId = result.current_content_id
    updateUI()
    return
  }
  
  // 2. 备用：从 localStorage 获取 contentId，再从 API 获取内容
  const localCid = localStorage.getItem('qiniu_pending_content_id')
  if (localCid) {
    currentContentId = localCid
    try {
      const response = await fetch(`http://localhost:3000/api/extension/content/${localCid}`)
      if (response.ok) {
        const data = await response.json()
        currentContent = {
          id: data.id,
          title: data.title,
          body: data.body,
          tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || [])
        }
        updateUI()
      }
    } catch (e) {
      // 忽略
    }
  }
}

// 更新UI
function updateUI() {
  const preview = document.getElementById('content-preview')
  const fillBtn = document.getElementById('fill-btn')
  const statusText = document.querySelector('.status-text')

  if (currentContent) {
    const title = currentContent.title || '无标题'
    preview.textContent = title.substring(0, 50) + (title.length > 50 ? '...' : '')
    fillBtn.disabled = false
    statusText.textContent = '内容已加载 ✓'
  } else {
    preview.textContent = '暂无内容'
    fillBtn.disabled = true
    statusText.textContent = '等待从七牛App获取...'
  }
}

// 填入内容到当前页面
async function fillToCurrentPage() {
  if (!currentContent) {
    // 尝试从 background 获取最新内容
    try {
      const result = await chrome.runtime.sendMessage({ type: 'GET_CONTENT' })
      if (result && result.content) {
        currentContent = result.content
        currentContentId = result.contentId
      }
    } catch (e) {
      // 忽略
    }
  }

  if (!currentContent) {
    alert('没有内容，请在七牛App中保存内容后再试')
    return
  }

  // 获取当前标签页
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  
  if (!tab) {
    alert('无法获取当前标签页')
    return
  }

  // 检查URL是否在支持的平台上
  const supportedPlatforms = [
    'member.bilibili.com',
    'mp.weixin.qq.com',
    'zhuanlan.zhihu.com',
    'creator.xiaohongshu.com',
    'www.bilibili.com/v/publish'
  ]

  const isSupported = supportedPlatforms.some(url => tab.url?.includes(url))
  
  if (!isSupported) {
    alert('请先打开支持的平台编辑器页面\n支持的平台：B站、微信公众号、知乎、小红书')
    return
  }

  // 发送消息到 content script
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'FILL_CONTENT',
      content: currentContent
    })
    
    // 关闭 popup
    window.close()
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('填入失败，请刷新页面后重试')
  }
}

// 事件绑定
document.addEventListener('DOMContentLoaded', () => {
  loadContent()
  
  const fillBtn = document.getElementById('fill-btn')
  if (fillBtn) {
    fillBtn.addEventListener('click', fillToCurrentPage)
  }
})
