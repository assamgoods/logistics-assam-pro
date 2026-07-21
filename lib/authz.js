import { getDb } from '@/lib/mongo'

export async function getSession(request) {
  if (!request || !request.headers) return null

  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ')
    ? auth.slice(7)
    : (request.headers.get('x-token') || '')

  if (!token) return null

  const db = await getDb()
  const s = await db.collection('sessions').findOne({ token })
  return s
}

export async function createSession(role, userId, extra = {}) {
  const db = await getDb()
  const { v4 } = await import('uuid')
  const token = v4()
  await db.collection('sessions').insertOne({ token, role, userId, ...extra, createdAt: new Date() })
  return token
}

export async function logActivity(db, { actor, role, action, target, meta = {} }) {
  await db.collection('activity').insertOne({ actor, role, action, target, meta, at: new Date() })
}
