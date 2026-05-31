// 七牛内容助手 - Background Service Worker
// 处理主站和第三方页面之间的消息传递

// 监听来自 content script 或 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_CONTENT') {
    // 保存内容到本地存储
    const contentData = {
      id: message.contentId,
      title: message.title,
      body: message.body,
      tags: message.tags || [],
      timestamp: Date.now()
    }
    chrome.storage.local.set({ 
      current_content: contentData,
      current_content_id: message.contentId
    }, () => {
      console.log('已保存内容:', message.contentId, message.title)
      sendResponse({ success: true })
    })
    return true // 异步响应
  }
  
  if (message.type === 'GET_CONTENT') {
    chrome.storage.local.get(['current_content', 'current_content_id'], (result) => {
      sendResponse({
        content: result.current_content,
        contentId: result.current_content_id
      })
    })
    return true
  }
  
  if (message.type === 'CLEAR_CONTENT') {
    chrome.storage.local.remove(['current_content', 'current_content_id'], () => {
      sendResponse({ success: true })
    })
    return true
  }
})

// 监听安装/更新
chrome.runtime.onInstalled.addListener(() => {
  console.log('七牛内容助手已安装')
})
