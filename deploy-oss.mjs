import OSS from 'ali-oss'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = 'E:/AICoding/Kimi3_project'
const distDir = join(ROOT, 'dist')

const REGION = process.env.OSS_REGION
const AK_ID = process.env.OSS_ACCESS_KEY_ID
const AK_SECRET = process.env.OSS_ACCESS_KEY_SECRET
const BUCKET = process.env.OSS_BUCKET

if (!REGION || !AK_ID || !AK_SECRET || !BUCKET) {
  console.error(
    '❌ 请设置环境变量 OSS_REGION / OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET / OSS_BUCKET'
  )
  process.exit(1)
}

const client = new OSS({
  region: REGION,
  accessKeyId: AK_ID,
  accessKeySecret: AK_SECRET,
  bucket: BUCKET
})

function* walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name)
    if (e.isDirectory()) yield* walk(f)
    else yield { local: f, key: relative(distDir, f).replace(/\\/g, '/') }
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
}
function mimeOf(name) {
  return (
    MIME[name.slice(name.lastIndexOf('.')).toLowerCase()] ||
    'application/octet-stream'
  )
}

function cacheHeader(key) {
  // HTML 不缓存（确保用户看到最新版本）， JS/CSS 长缓存
  return key.endsWith('.html')
    ? 'no-cache'
    : 'public, max-age=31536000, immutable'
}

try {
  // 1. 确保 Bucket 存在
  try {
    await client.getBucketInfo(BUCKET)
    console.log(`✅ Bucket "${BUCKET}" 已存在`)
  } catch {
    await client.putBucket(BUCKET)
    console.log(`✅ 已创建 Bucket "${BUCKET}" (${REGION})`)
  }

  // 2. 静态网站托管（SPA 路由回退：所有未匹配路径 → index.html）
  await client.putBucketWebsite(BUCKET, {
    index: 'index.html',
    error: 'index.html'
  })
  console.log('✅ 静态网站托管已开启（SPA 路由回退）')

  // 3. 公共读
  await client.putBucketACL(BUCKET, 'public-read')
  console.log('✅ Bucket 权限已设为公共读')

  // 4. 上传所有文件
  if (!existsSync(distDir)) {
    console.error('❌ dist/ 目录不存在，请先运行 npm run build')
    process.exit(1)
  }

  let n = 0
  for (const { local, key } of walk(distDir)) {
    const contentType = mimeOf(key)
    await client.put(key, readFileSync(local), {
      mime: contentType, // ✅ OSS SDK 方式设置 Content-Type
      headers: {
        'Content-Type': contentType, // ✅ 显式 HTTP 头（双保险）
        'Content-Disposition': 'inline', // ✅ 强制浏览器预览，不下载
        'Cache-Control': cacheHeader(key)
      }
    })
    console.log(`  📤 ${key}  [${contentType}]`)
    n++
  }

  console.log(`\n✅ 共上传 ${n} 个文件`)
  console.log('═══════════════════════════════════════')
  console.log(`  🌐 https://${BUCKET}.oss-${REGION}.aliyuncs.com`)
  console.log('═══════════════════════════════════════')
} catch (e) {
  console.error('❌ 部署失败：', e.message)
  process.exit(1)
}
