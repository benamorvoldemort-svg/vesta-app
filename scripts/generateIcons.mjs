import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

if (!existsSync('./public')) mkdirSync('./public')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  
  // Background
  ctx.fillStyle = '#B8935A'
  ctx.fillRect(0, 0, size, size)
  
  // Letter V
  ctx.fillStyle = '#FAF6F1'
  ctx.font = `bold ${size * 0.6}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('V', size / 2, size / 2)
  
  const buffer = canvas.toBuffer('image/png')
  writeFileSync(outputPath, buffer)
  console.log(`Generated ${outputPath}`)
}

generateIcon(192, join('./public', 'icon-192.png'))
generateIcon(512, join('./public', 'icon-512.png'))
