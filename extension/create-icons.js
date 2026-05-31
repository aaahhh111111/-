// 生成简单的图标 PNG 文件
const fs = require('fs')
const path = require('path')

// 创建一个简单的 16x16 PNG (最小的有效PNG)
// 这是紫色的 "七" 字图标
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x10, // width: 16
  0x00, 0x00, 0x00, 0x10, // height: 16
  0x08, 0x06, // bit depth: 8, color type: RGBA
  0x00, 0x00, 0x00, // compression, filter, interlace
  0x1F, 0xF3, 0xFF, 0x61, // CRC
])

// 简单的紫色背景 16x16 PNG
const { createCanvas } = require('canvas')

// 由于没有 canvas 库，我们创建一个 SVG 然后复制到 icons 文件夹
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="60" fill="url(#grad)"/>
  <text x="64" y="85" font-size="70" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">七</text>
</svg>`

fs.writeFileSync(path.join(__dirname, 'icons', 'icon.svg'), svg)
console.log('SVG icon created. Please convert to PNG manually or use an online tool.')
console.log('Files created in extension folder:')
console.log('- manifest.json')
console.log('- popup.html')
console.log('- popup.js')
console.log('- content.js')
console.log('- content.css')
console.log('- icons/icon.svg (需要转换为 PNG)')
