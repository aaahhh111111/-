// 七牛内容助手 - Content Script
// 在支持的第三方平台上运行

let currentContent = null
let currentContentId = null
let buttonVisible = false
let btnContainer = null

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
        tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || []),
        media_files: data.media_files || []
      }
      console.log('===== 七牛助手读取的内容 =====')
      console.log('ID:', currentContent.id)
      console.log('标题:', currentContent.title)
      console.log('正文长度:', currentContent.body?.length || 0)
      console.log('正文内容:', currentContent.body?.substring(0, 200))
      console.log('标签:', currentContent.tags)
      console.log('媒体文件:', currentContent.media_files)
      console.log('================================')
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

  btnContainer = document.createElement('div')
  btnContainer.id = 'qiniu-fill-btn'
  btnContainer.innerHTML = `
    <div class="qiniu-btn qiniu-btn-all">
      一键
      <div class="qiniu-tooltip">一键填入全部</div>
    </div>
    <div class="qiniu-btn qiniu-btn-title">
      标题
      <div class="qiniu-tooltip">只填标题</div>
    </div>
    <div class="qiniu-btn qiniu-btn-body">
      正文
      <div class="qiniu-tooltip">只填正文</div>
    </div>
    <div class="qiniu-btn qiniu-btn-tags">
      标签
      <div class="qiniu-tooltip">只填标签</div>
    </div>
    <div class="qiniu-btn qiniu-btn-file">
      文件
      <div class="qiniu-tooltip">只填文件</div>
    </div>
  `
  
  // 绑定点击事件
  btnContainer.querySelector('.qiniu-btn-all').onclick = () => {
    const url = window.location.href
    if (url.includes('localhost')) {
      alert('请在第三方平台页面使用此功能')
      return
    }
    fillContentAll()
  }
  btnContainer.querySelector('.qiniu-btn-title').onclick = () => {
    const url = window.location.href
    if (url.includes('localhost')) {
      alert('请在第三方平台页面使用此功能')
      return
    }
    fillTitle()
  }
  btnContainer.querySelector('.qiniu-btn-body').onclick = () => {
    const url = window.location.href
    if (url.includes('localhost')) {
      alert('请在第三方平台页面使用此功能')
      return
    }
    fillBody()
  }
  btnContainer.querySelector('.qiniu-btn-tags').onclick = () => {
    const url = window.location.href
    if (url.includes('localhost')) {
      alert('请在第三方平台页面使用此功能')
      return
    }
    fillTags()
  }
  btnContainer.querySelector('.qiniu-btn-file').onclick = () => {
    const url = window.location.href
    if (url.includes('localhost')) {
      alert('请在第三方平台页面使用此功能')
      return
    }
    fillFiles()
  }
  
  document.body.appendChild(btnContainer)
  console.log('七牛悬浮按钮组已显示')

  setTimeout(() => {
    btnContainer.style.opacity = '0'
    setTimeout(() => {
      btnContainer.remove()
      btnContainer = null
      buttonVisible = false
    }, 300)
  }, 120000)
}

// 全量填入
async function fillContentAll() {
  await fillContent()
}

// 单独填标题
async function fillTitle() {
  await loadContentIfNeeded()
  if (!currentContent) return
  
  console.log('===== 填入标题 =====')
  console.log('标题:', currentContent.title)
  console.log('当前URL:', window.location.href)
  console.log('====================')
  
  const url = window.location.href
  if (url.includes('member.bilibili.com')) {
    const titleInput = document.querySelector('input.editor-title-input') ||
                       document.querySelector('input[placeholder*="标题"]')
    if (titleInput) {
      titleInput.value = currentContent.title.substring(0, 40)
      titleInput.dispatchEvent(new Event('input', { bubbles: true }))
      alert('标题已填入！')
    }
  } else if (url.includes('creator.xiaohongshu.com')) {
    const titleInput = document.querySelector('textarea.d-text')
    if (titleInput) {
      titleInput.value = currentContent.title.substring(0, 20)
      titleInput.dispatchEvent(new Event('input', { bubbles: true }))
      titleInput.dispatchEvent(new Event('change', { bubbles: true }))
      alert('标题已填入！')
    }
  } else if (url.includes('mp.weixin.qq.com')) {
    const titleInput = document.querySelector('#title') ||
                        document.querySelector('input[placeholder*="标题"]')
    if (titleInput) {
      titleInput.value = currentContent.title
      titleInput.dispatchEvent(new Event('input', { bubbles: true }))
      alert('标题已填入！')
    }
  } else if (url.includes('zhuanlan.zhihu.com')) {
    // 知乎标题
    console.log('当前在知乎，查找标题输入框...')
    
    // 等待 textarea 出现
    const titleInput = await waitForElement('textarea', 3000)
    console.log('找到的标题输入框:', titleInput)
    
    if (titleInput) {
      titleInput.value = currentContent.title
      titleInput.dispatchEvent(new Event('input', { bubbles: true }))
      titleInput.dispatchEvent(new Event('change', { bubbles: true }))
      alert('知乎标题已填入！')
    } else {
      console.log('未找到知乎标题输入框')
    }
  }
}

// 等待元素出现
async function waitForElement(selector, maxWait = 5000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    const el = document.querySelector(selector)
    if (el) return el
    await new Promise(r => setTimeout(r, 200))
  }
  return null
}

// 单独填正文
async function fillBody() {
  await loadContentIfNeeded()
  if (!currentContent) return
  
  console.log('===== 填入正文 =====')
  console.log('正文长度:', currentContent.body?.length || 0)
  console.log('正文内容:', currentContent.body?.substring(0, 200))
  console.log('===================')
  
  const url = window.location.href
  if (url.includes('member.bilibili.com')) {
    await fillQuillEditor(currentContent.body)
    alert('B站正文已填入！')
  } else if (url.includes('creator.xiaohongshu.com')) {
    await fillXiaohongshuBody(currentContent.body)
    alert('小红书正文已填入！')
  } else if (url.includes('zhuanlan.zhihu.com')) {
    console.log('当前在知乎，填入正文...')
    await fillZhihuBody(currentContent.body)
    alert('知乎正文已填入！')
  }
}

// 知乎正文填入
async function fillZhihuBody(body) {
  console.log('fillZhihuBody 被调用')
  const plainText = stripHtml(body).substring(0, 50000)
  console.log('处理后正文:', plainText)
  
  // 等待正文编辑器出现
  const editor = await waitForElement('.public-DraftEditor-content', 3000)
  if (editor) {
    console.log('找到知乎编辑器')
    editor.click()
    await sleep(300)
    editor.innerHTML = ''
    editor.innerText = plainText
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    editor.dispatchEvent(new Event('change', { bubbles: true }))
    console.log('知乎正文填入成功，长度:', plainText.length)
  } else {
    console.log('未找到知乎编辑器')
  }
}

// 单独填标签
async function fillTags() {
  await loadContentIfNeeded()
  if (!currentContent) return
  
  console.log('===== 填入标签 =====')
  console.log('标签:', currentContent.tags)
  console.log('===================')
  
  const url = window.location.href
  if (url.includes('member.bilibili.com')) {
    await fillBilibiliTags(currentContent.tags)
    alert('B站标签已填入！')
  } else if (url.includes('creator.xiaohongshu.com')) {
    await fillXiaohongshuTags(currentContent.tags)
    alert('小红书标签已填入！')
  }
}

// 加载内容（如果还没加载）
async function loadContentIfNeeded() {
  if (!currentContent && currentContentId) {
    await loadContentFromApi(currentContentId)
  }
  if (!currentContent) {
    alert('没有待填入的内容，请先在七牛App中保存内容')
  }
}

// 小红书 - 只填正文
async function fillXiaohongshuBody(body) {
  const editor = document.querySelector('div.tiptap.ProseMirror')
  if (!editor) {
    console.log('未找到小红书编辑器')
    return
  }
  
  console.log('小红书填入正文，长度:', body?.length)
  const plainText = stripHtml(body).substring(0, 1000)
  
  editor.focus()
  editor.innerHTML = ''
  
  const textNode = document.createTextNode(plainText)
  editor.appendChild(textNode)
  
  const range = document.createRange()
  range.selectNodeContents(editor)
  range.collapse(false)
  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    sel.addRange(range)
  }
  
  editor.dispatchEvent(new InputEvent('input', {
    bubbles: true, cancelable: true, inputType: 'insertText', data: plainText
  }))
  editor.dispatchEvent(new Event('change', { bubbles: true }))
}

// 小红书 - 只填标签
async function fillXiaohongshuTags(tags) {
  if (!tags || tags.length === 0) return
  
  console.log('小红书填入标签:', tags)
  const tagInput = document.querySelector('input[placeholder*="标签"]') ||
                  document.querySelector('input[placeholder*="话题"]') ||
                  document.querySelector('input.d-input')
  
  if (tagInput) {
    for (const tag of tags.slice(0, 10)) {
      tagInput.value = '#' + tag
      tagInput.dispatchEvent(new Event('input', { bubbles: true }))
      tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
      await new Promise(r => setTimeout(r, 200))
    }
  }
}

async function fillContent() {
  console.log('开始填入内容...')
  
  const url = window.location.href
  
  // 七牛App页面不需要填入
  if (url.includes('localhost:5173') || url.includes('localhost:3000')) {
    console.log('当前在七牛App页面，不需要填入')
    return
  }
  
  if (!currentContent && currentContentId) {
    await loadContentFromApi(currentContentId)
  }

  if (!currentContent) {
    alert('没有待填入的内容，请先在七牛App中保存内容')
    return
  }

  const { title, body, tags } = currentContent

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
                     document.querySelector('input[placeholder*="标题"]') ||
                     document.querySelector('input.TitleInput') ||
                     document.querySelector('.title-input')
  if (titleInput) {
    titleInput.value = title.substring(0, 40)
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // 2. 填入正文
  await fillBiliEditor(body)

  // 3. 填入标签
  await fillBilibiliTags(tags)

  // 4. 清除选中状态
  window.getSelection()?.removeAllRanges()
  document.body.focus()
  
  alert('B站专栏内容已填入！')
}

// 等待 Quill 实例初始化完成
async function waitForQuill(maxWait = 5000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    let quill = document.querySelector('.ql-container')?.__quill
    if (!quill && window.quill) quill = window.quill
    if (quill) return quill
    for (const key of Object.keys(window)) {
      if (key.toLowerCase().includes('quill')) {
        const obj = window[key]
        if (obj && obj.root && obj.root.classList?.contains('ql-editor')) {
          return obj
        }
      }
    }
    await new Promise(r => setTimeout(r, 200))
  }
  return null
}

// B站编辑器填入
async function fillBiliEditor(body) {
  console.log('开始填入B站正文...')
  const plainText = stripHtml(body).substring(0, 5000)
  
  // 尝试多种选择器
  const selectors = [
    '.ql-editor',
    '.editor-content',
    '[contenteditable="true"]',
    '.tiptap',
    '.ProseMirror',
    '.editor-body'
  ]
  
  let editor = null
  for (const sel of selectors) {
    editor = document.querySelector(sel)
    if (editor) {
      console.log('找到编辑器:', sel)
      break
    }
  }
  
  if (!editor) {
    console.log('未找到B站编辑器，尝试 body')
    editor = document.body
  }
  
  // 点击编辑器
  editor.click()
  await sleep(300)
  
  // 清空并填入
  editor.innerHTML = ''
  editor.innerText = plainText
  
  // 触发输入事件
  editor.dispatchEvent(new Event('input', { bubbles: true }))
  editor.dispatchEvent(new Event('change', { bubbles: true }))
  
  console.log('B站正文填入成功，长度:', plainText.length)
}

// Quill 编辑器填入（备用）
async function fillQuillEditor(body) {
  const quillEditor = document.querySelector('.ql-editor')
  if (!quillEditor) {
    console.log('未找到 Quill 编辑器，使用 DOM 操作')
    await fillBiliEditor(body)
    return
  }

  // 等待 Quill 实例初始化
  console.log('等待 Quill 实例初始化...')
  let quill = await waitForQuill()
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
    // 兜底：DOM 操作
    await fillBiliEditor(body)
  }
}

// B站标签填入
async function fillBilibiliTags(tags) {
  if (!tags || tags.length === 0) {
    console.log('没有标签需要填入')
    return
  }

  console.log('开始填入B站标签:', tags)

  // 查找标签输入框（在标签容器内的 input）
  const tagInput = document.querySelector('.flex.flex-wrap.gap-2 input') ||
                   document.querySelector('.tag-section input') ||
                   document.querySelector('input[placeholder*="标签"]') ||
                   document.querySelector('input[placeholder*="添加"]') ||
                   document.querySelector('input[placeholder*="话题"]') ||
                   document.querySelector('input.d-input')

  if (tagInput) {
    console.log('找到B站标签输入框')
    for (const tag of tags.slice(0, 10)) {
      tagInput.value = tag
      tagInput.dispatchEvent(new Event('input', { bubbles: true }))
      tagInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
      await sleep(200)
    }
    console.log('B站标签填入成功')
  } else {
    console.log('未找到B站标签输入框')
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
  console.log('===== 知乎填入 =====')
  console.log('标题:', title)
  console.log('正文长度:', body?.length)
  console.log('====================')
  
  // 填入标题
  const titleInput = document.querySelector('input[placeholder*="标题"]') ||
                      document.querySelector('.TitleInput-input') ||
                      document.querySelector('input[data-za-key="post_title"]')
  if (titleInput) {
    titleInput.value = title
    titleInput.dispatchEvent(new Event('input', { bubbles: true }))
    titleInput.dispatchEvent(new Event('change', { bubbles: true }))
  }
  
  // 填入正文 - 知乎使用 contenteditable
  const plainText = stripHtml(body).substring(0, 50000)
  
  // 尝试多种选择器
  const selectors = [
    '.RichText.ztext',
    '.ztext-editor',
    '[contenteditable="true"]',
    '.tiptap',
    '.ProseMirror',
    '.editor-body',
    '#root .content'
  ]
  
  let editor = null
  for (const sel of selectors) {
    editor = document.querySelector(sel)
    if (editor) {
      console.log('找到知乎编辑器:', sel)
      break
    }
  }
  
  if (editor) {
    editor.click()
    await sleep(300)
    editor.innerHTML = ''
    editor.innerText = plainText
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    editor.dispatchEvent(new Event('change', { bubbles: true }))
    console.log('知乎正文填入成功，长度:', plainText.length)
  } else {
    console.log('未找到知乎编辑器')
  }
  
  alert('知乎内容已填入！')
}

// ==================== 小红书填入 ====================
async function fillXiaohongshu(title, body, tags) {
  console.log('===== 小红书填入 =====')
  console.log('标题:', title)
  console.log('正文长度:', body?.length)
  console.log('========================')
  
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
    editor.focus()
    
    // 清空现有内容
    editor.innerHTML = ''
    
    // 创建文本节点填入
    const textNode = document.createTextNode(plainText)
    editor.appendChild(textNode)
    
    // 移动光标到末尾
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
    
    // 触发 Tiptap 能识别的输入事件
    editor.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: plainText
    }))
    
    // 触发 change 事件
    editor.dispatchEvent(new Event('change', { bubbles: true }))
    
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

// 单独填文件
async function fillFiles() {
  await loadContentIfNeeded()
  if (!currentContent) return
  
  console.log('===== 填入文件 =====')
  console.log('媒体文件:', currentContent.media_files)
  console.log('====================')
  
  const url = window.location.href
  
  if (url.includes('creator.xiaohongshu.com')) {
    // 小红书：触发文件上传按钮
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      console.log('找到小红书文件上传 input')
      // 注意：浏览器安全限制，无法直接操作文件选择器
      // 需要用户手动选择文件
      alert('小红书文件上传：请在弹出的文件选择框中选择文件')
      fileInput.click()
    } else {
      alert('未找到小红书文件上传入口')
    }
  } else if (url.includes('member.bilibili.com')) {
    // B站视频上传
    const fileInput = document.querySelector('input[type="file"]')
    if (fileInput) {
      alert('B站文件上传：请在弹出的文件选择框中选择视频文件')
      fileInput.click()
    } else {
      alert('未找到B站文件上传入口')
    }
  } else {
    alert('当前平台暂不支持文件上传')
  }
}
