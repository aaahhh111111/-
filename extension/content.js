// 七牛内容助手 - Content Script
// 在支持的第三方平台上运行

let currentContent = null
let currentContentId = null
let buttonVisible = false

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

window.addEventListener('load', () => {
  setTimeout(init, 3000)
})

async function init() {
  console.log('七牛内容助手已初始化')
  
  // 从 URL 参数获取 contentId
  const urlParams = new URLSearchParams(window.location.search)
  const cid = urlParams.get('qiniu_cid')
  
  // 备用：从 localStorage 获取 contentId
  let localCid = localStorage.getItem('qiniu_pending_content_id')
  
  if (cid) {
    console.log('从 URL 找到 Content ID:', cid)
    currentContentId = cid
    showFloatingButton()
    await loadContentFromApi(cid)
  } else if (localCid) {
    console.log('从 localStorage 找到 Content ID:', localCid)
    currentContentId = localCid
    showFloatingButton()
    await loadContentFromApi(localCid)
  } else {
    console.log('没有找到 Content ID，尝试从扩展存储获取...')
    await loadContentFromStorage()
  }
}

async function loadContentFromApi(contentId) {
  try {
    console.log('正在从 API 获取内容...')
    const response = await fetch(`http://localhost:3000/api/extension/content/${contentId}`)
    
    if (response.ok) {
      const data = await response.json()
      currentContent = {
        id: data.id,
        title: data.title,
        body: data.body,
        tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || [])
      }
      console.log('从 API 获取内容成功:', currentContent)
      updateButtonTooltip()
    } else {
      console.error('获取内容失败:', response.status)
    }
  } catch (e) {
    console.error('从 API 获取内容失败:', e)
  }
}

async function loadContentFromStorage() {
  try {
    const result = await chrome.runtime.sendMessage({ type: 'GET_CONTENT' })
    if (result && result.content) {
      currentContent = result.content
      currentContentId = result.contentId
      console.log('从存储读取内容:', currentContent.title)
      showFloatingButton()
      updateButtonTooltip()
    }
  } catch (e) {
    console.error('读取存储失败:', e)
  }
}

function updateButtonTooltip() {
  const tooltip = document.querySelector('.qiniu-tooltip')
  if (tooltip && currentContent) {
    tooltip.textContent = currentContent.title ? '填入: ' + currentContent.title.substring(0, 15) : '一键填入'
  }
}

function showFloatingButton() {
  if (buttonVisible) return
  buttonVisible = true
  
  const existing = document.getElementById('qiniu-fill-btn')
  if (existing) existing.remove()

  const btn = document.createElement('div')
  btn.id = 'qiniu-fill-btn'
  btn.innerHTML = `
    <div class="qiniu-logo">七</div>
    <div class="qiniu-tooltip">一键填入内容</div>
  `
  btn.onclick = () => fillContent()
  document.body.appendChild(btn)
  console.log('悬浮按钮已显示')

  setTimeout(() => {
    btn.style.opacity = '0'
    setTimeout(() => {
      btn.remove()
      buttonVisible = false
    }, 300)
  }, 120000)
}

async function fillContent() {
  console.log('开始填入内容...')
  
  if (!currentContent && currentContentId) {
    await loadContentFromApi(currentContentId)
  }

  if (!currentContent) {
    alert('没有待填入的内容，请先在七牛App中保存内容')
    return
  }

  const { title, body, tags } = currentContent
  const url = window.location.href

  try {
    // B站专栏/文章编辑页
    if (url.includes('member.bilibili.com')) {
      await fillBilibiliArticle(title, body, tags)
    } else if (url.includes('www.bilibili.com/v/publish')) {
      await fillBilibiliDynamic(title, body, tags)
    } else if (url.includes('mp.weixin.qq.com')) {
      await fillWeChat(title, body, tags)
    } else if (url.includes('zhuanlan.zhihu.com')) {
      await fillZhihu(title, body, tags)
    } else if (url.includes('creator.xiaohongshu.com')) {
      await fillXiaohongshu(title, body, tags)
    } else {
      alert('未知平台，请手动填入')
    }
  } catch (e) {
    console.error('填入失败:', e)
    alert('填入失败: ' + e.message)
  }
}

// ==================== B站专栏填入 ====================
async function fillBilibiliArticle(title, body, tags) {
  // 1. 填入标题
  const titleInput = document.querySelector('input.editor-title-input') ||
                     document.querySelector('input[placeholder*="标题"]')
  if (titleInput) {
    titleInput.value = title.substring(0, 40)
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // 2. 填入正文（Quill 编辑器）
  await fillQuillEditor(body)

  // 3. 填入标签
  await fillBilibiliTags(tags)

  // 4. 清除选中状态
  window.getSelection()?.removeAllRanges()
  document.body.focus()
  
  alert('B站专栏内容已填入！')
}

// Quill 编辑器填入
async function fillQuillEditor(body) {
  const quillEditor = document.querySelector('.ql-editor')
  if (!quillEditor) {
    console.log('未找到 Quill 编辑器')
    return
  }

  // 获取 Quill 实例
  let quill = document.querySelector('.ql-container')?.__quill
  if (!quill && window.quill) quill = window.quill

  if (quill) {
    console.log('找到 Quill 实例，开始填入正文...')
    const plainText = stripHtml(body).substring(0, 5000)
    
    // 填入正文
    quill.setText(plainText)
    
    // 聚焦并移动光标
    quill.root.focus()
    quill.setSelection(quill.getLength(), quill.getLength())
    
    // 模拟输入空格再删除（触发 B站验证）
    document.execCommand('insertText', false, ' ')
    setTimeout(() => {
      document.execCommand('delete', false, null)
      quill.blur()
    }, 100)
    
    // 触发事件
    quill.root.dispatchEvent(new Event('input', { bubbles: true }))
    quill.root.dispatchEvent(new Event('change', { bubbles: true }))
    
    console.log('正文填入成功，长度:', plainText.length)
  } else {
    console.log('未找到 Quill 实例，尝试 DOM 操作')
    quillEditor.click()
    await sleep(300)
    quillEditor.innerHTML = ''
    quillEditor.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    document.execCommand('insertText', false, stripHtml(body).substring(0, 5000))
    quillEditor.dispatchEvent(new Event('input', { bubbles: true }))
    quillEditor.dispatchEvent(new Event('change', { bubbles: true }))
  }
}

// B站标签填入
async function fillBilibiliTags(tags) {
  if (!tags || tags.length === 0) {
    console.log('没有标签需要填入')
    return
  }

  console.log('开始填入标签:', tags)

  // 查找标签输入框（在标签容器内的 input）
  const tagInput = document.querySelector('.flex.flex-wrap.gap-2 input') ||
                   document.querySelector('.tag-section input') ||
                   document.querySelector('input[placeholder*="标签"]') ||
                   document.querySelector('input[placeholder*="添加"]')

  if (tagInput) {
    console.log('找到标签输入框:', tagInput)
    for (const tag of tags.slice(0, 10)) {
      tagInput.value = tag
      tagInput.dispatchEvent(new Event('input', { bubbles: true }))
      tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
      await sleep(200)
    }
    console.log('标签填入成功')
  } else {
    console.log('未找到标签输入框，尝试查找已有标签...')
    // 查找已有标签的容器
    const tagContainer = document.querySelector('.flex.flex-wrap.gap-2')
    if (tagContainer) {
      console.log('找到标签容器，添加标签元素')
      // 清除现有标签
      tagContainer.querySelectorAll('span').forEach(el => el.remove())
      
      // 添加标签
      for (const tag of tags.slice(0, 10)) {
        const tagSpan = document.createElement('span')
        tagSpan.className = 'px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm flex items-center gap-2'
        tagSpan.innerHTML = `#${tag}<button class="text-white/50 hover:text-white">×</button>`
        tagContainer.appendChild(tagSpan)
      }
      console.log('标签元素添加成功')
    } else {
      console.log('未找到标签容器，跳过标签')
    }
  }
}

// ==================== B站视频填入 ====================
async function fillBilibiliVideo(title, body, tags) {
  const titleInput = document.querySelector('input[placeholder*="标题"]') ||
                      document.querySelector('input.title-input')
  if (titleInput) {
    titleInput.value = title.substring(0, 40)
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  const descInput = document.querySelector('textarea[placeholder*="简介"]') ||
                     document.querySelector('textarea[name="desc"]')
  if (descInput) {
    descInput.value = stripHtml(body).substring(0, 500)
    descInput.dispatchEvent(new Event('input', { bubbles: true }))
  }
  
  await fillBilibiliTags(tags)
  alert('B站视频信息已填入！视频请手动上传。')
}

// ==================== B站动态填入 ====================
async function fillBilibiliDynamic(title, body, tags) {
  const textInput = document.querySelector('textarea[placeholder*="说点什么"]') ||
                     document.querySelector('div[contenteditable="true"]')
  if (textInput) {
    textInput.click()
    await sleep(300)
    const content = title + '\n\n' + stripHtml(body).substring(0, 500)
    document.execCommand('insertText', false, content)
  }
  alert('B站动态已填入！')
}

// ==================== 微信公众号填入 ====================
async function fillWeChat(title, body, tags) {
  const titleInput = document.querySelector('#title') ||
                      document.querySelector('input[name="title"]') ||
                      document.querySelector('input[placeholder*="标题"]')
  if (titleInput) {
    titleInput.value = title
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
  }
  alert('微信公众号标题已填入！')
}

// ==================== 知乎填入 ====================
async function fillZhihu(title, body, tags) {
  const titleInput = document.querySelector('input[placeholder*="标题"]') ||
                      document.querySelector('.TitleInput-input')
  if (titleInput) {
    titleInput.value = title
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
  }
  alert('知乎标题已填入！')
}

// ==================== 小红书填入 ====================
async function fillXiaohongshu(title, body, tags) {
  // 填入标题
  const titleInput = document.querySelector('textarea.d-text[placeholder="输入标题"]') ||
                      document.querySelector('textarea.d-text')
  if (titleInput) {
    titleInput.value = title.substring(0, 20)
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
    titleInput.dispatchEvent(new Event('change', { bubbles: true }))
    console.log('小红书标题填入成功')
  }

  // 填入正文（Tiptap 编辑器）
  const editor = document.querySelector('div.tiptap.ProseMirror')
  if (editor) {
    console.log('找到小红书编辑器，开始填入正文...')
    const plainText = stripHtml(body).substring(0, 1000)
    
    // 点击聚焦
    editor.click()
    await sleep(300)
    
    // 清空现有内容
    editor.innerHTML = ''
    editor.dispatchEvent(new FocusEvent('focus', { bubbles: true }))
    
    // 模拟真实输入（分段填入）
    const textChunks = plainText.match(/.{1,50}/g) || []
    for (const chunk of textChunks) {
      document.execCommand('insertText', false, chunk)
      await sleep(20)
    }
    
    // 触发 Tiptap 事件
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    editor.dispatchEvent(new Event('change', { bubbles: true }))
    editor.dispatchEvent(new Event('blur', { bubbles: true }))
    
    console.log('小红书正文填入成功，长度:', plainText.length)
  } else {
    console.log('未找到小红书编辑器')
  }

  // 填入标签
  if (tags?.length > 0) {
    await sleep(300)
    const tagInput = document.querySelector('input[placeholder*="标签"]') ||
                    document.querySelector('input[placeholder*="话题"]')
    if (tagInput) {
      for (const tag of tags.slice(0, 10)) {
        tagInput.value = '#' + tag
        tagInput.dispatchEvent(new Event('input', { bubbles: true }))
        tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
        await sleep(200)
      }
      console.log('小红书标签填入成功')
    }
  }

  alert('小红书内容已填入！图片请手动上传。')
}
