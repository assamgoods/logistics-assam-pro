import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { v4 as uuidv4 } from 'uuid'
import { sendNotification } from '@/lib/notify'
import { getSession, createSession, logActivity } from '@/lib/authz'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'assam123'

function json(data, status = 200) { return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } }) }

async function nextLrNumber(db) {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const key = `${y}${m}${d}`
  const res = await db.collection('counters').findOneAndUpdate(
    { _id: `lr_${key}` }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' }
  )
  const seq = (res && res.value && res.value.seq) || (res && res.seq) || 1
  return `AGC-${key}-${String(seq).padStart(4, '0')}`
}

const DEFAULT_STAGES = [
  { key: 'BOOKED', label: 'Booking Received' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'WAREHOUSE', label: 'In Warehouse' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'ARRIVED', label: 'Arrived at Destination' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
]

const NOTIFY_EVENTS = { BOOKED: 'BOOKING_CREATED', DISPATCHED: 'DISPATCHED', OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY', DELIVERED: 'DELIVERED' }

const ROLE_PERMISSIONS = {
  admin:    ['*'],
  branch:   ['booking.create','booking.read','booking.status','pod.upload','rate.read'],
  driver:   ['booking.read.own','pod.upload','booking.status.limited'],
  customer: ['booking.read.own','pod.download'],
}

function sanitize(doc) { if (!doc) return doc; const { _id, ...rest } = doc; return rest }

async function handle(request, ctx) {
  const method = request.method
  const p = await ctx.params
  const parts = (p?.path) || []
  const route = '/' + parts.join('/')
  const url = new URL(request.url)

  try {
    const db = await getDb()

    if (route === '/' || route === '/health') return json({ ok: true, service: 'assam-goods-carrier', time: new Date().toISOString() })

    // -------- AUTH ---------
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      const settings = await db.collection('settings').findOne({ _id: 'company' })
      const bcrypt = (await import('bcryptjs')).default
      let ok = false
      if (settings?.adminPasswordHash) {
        ok = await bcrypt.compare(body?.password || '', settings.adminPasswordHash)
      } else {
        ok = body?.password === ADMIN_PASSWORD
      }
      if (ok) {
        const token = await createSession('admin', 'admin-root', { name: 'Super Admin', email: settings?.email })
        await logActivity(db, { actor: 'admin-root', role: 'admin', action: 'LOGIN', target: 'admin' })
        return json({ ok: true, token, role: 'admin', name: 'Super Admin', email: settings?.email, permissions: ROLE_PERMISSIONS.admin })
      }
      return json({ ok: false, error: 'Invalid password' }, 401)
    }
    if (route === '/branch/login' && method === 'POST') {
      const { code, email, password } = await request.json()
      const q = email ? { role: 'branch', email, active: { $ne: false } } : { role: 'branch', code, active: { $ne: false } }
      const user = await db.collection('users').findOne(q)
      if (!user) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const bcrypt = (await import('bcryptjs')).default
      const isHashed = String(user.password || '').startsWith('$2')
      const ok = isHashed ? await bcrypt.compare(password||'', user.password) : (user.password === password)
      if (!ok) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const token = await createSession('branch', user.id, { name: user.name, code: user.code, branchId: user.branchId, email: user.email })
      await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date(), lastLoginIp: request.headers.get('x-forwarded-for') || 'local', lastLoginUa: request.headers.get('user-agent') || '' } })
      await logActivity(db, { actor: user.id, role: 'branch', action: 'LOGIN', target: user.code })
      return json({ ok: true, token, role: 'branch', name: user.name, code: user.code, email: user.email, permissions: ROLE_PERMISSIONS.branch, mustChangePassword: !!user.mustChangePassword })
    }
    if (route === '/driver/login' && method === 'POST') {
      const { phone, password } = await request.json()
      const user = await db.collection('users').findOne({ role: 'driver', phone, active: { $ne: false } })
      if (!user) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const bcrypt = (await import('bcryptjs')).default
      const isHashed = String(user.password || '').startsWith('$2')
      const ok = isHashed ? await bcrypt.compare(password||'', user.password) : (user.password === password)
      if (!ok) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const token = await createSession('driver', user.id, { name: user.name, phone })
      await db.collection('users').updateOne({ id: user.id }, { $set: { lastLoginAt: new Date(), lastLoginIp: request.headers.get('x-forwarded-for') || 'local', lastLoginUa: request.headers.get('user-agent') || '' } })
      await logActivity(db, { actor: user.id, role: 'driver', action: 'LOGIN', target: phone })
      return json({ ok: true, token, role: 'driver', name: user.name, permissions: ROLE_PERMISSIONS.driver, mustChangePassword: !!user.mustChangePassword })
    }
    if (route === '/customer/login' && method === 'POST') {
      // Simple phone-based customer login (in production add OTP)
      const { phone } = await request.json()
      if (!phone || phone.length < 10) return json({ ok: false, error: 'Enter valid phone' }, 400)
      const token = await createSession('customer', phone, { phone, name: 'Customer' })
      return json({ ok: true, token, role: 'customer', phone, permissions: ROLE_PERMISSIONS.customer })
    }
    if (route === '/me' && method === 'GET') {
      const s = await getSession(request)
      if (!s) return json({ ok: false }, 401)
      const { _id, ...rest } = s; return json({ ok: true, session: rest })
    }
    if (route === '/logout' && method === 'POST') {
      const s = await getSession(request); if (s) await db.collection('sessions').deleteOne({ token: s.token })
      return json({ ok: true })
    }

    // -------- STATS ---------
    if (route === '/stats' && method === 'GET') {
      const col = db.collection('bookings')
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
      const [total, today, delivered, inTransit, pending, cancelled, revenueAgg, outstandingAgg] = await Promise.all([
        col.countDocuments({}),
        col.countDocuments({ createdAt: { $gte: startOfDay } }),
        col.countDocuments({ status: 'DELIVERED' }),
        col.countDocuments({ status: { $in: ['DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'OUT_FOR_DELIVERY'] } }),
        col.countDocuments({ status: { $in: ['BOOKED', 'PICKED_UP', 'WAREHOUSE'] } }),
        col.countDocuments({ status: 'CANCELLED' }),
        col.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]).toArray(),
        col.aggregate([{ $match: { paymentStatus: { $ne: 'PAID' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]).toArray(),
      ])
      return json({ totalBookings: total, todaysBookings: today, deliveredShipments: delivered, inTransitShipments: inTransit, pendingDeliveries: pending, cancelledShipments: cancelled, totalRevenue: revenueAgg[0]?.total || 0, outstandingPayments: outstandingAgg[0]?.total || 0 })
    }

    // -------- BOOKINGS ---------
    if (route === '/bookings' && method === 'GET') {
      const filter = {}
      const status = url.searchParams.get('status'); if (status) filter.status = status
      const branchCode = url.searchParams.get('branch'); if (branchCode) filter.branchCode = branchCode
      const phone = url.searchParams.get('phone'); if (phone) filter.$or = [{ 'sender.phone': phone }, { 'receiver.phone': phone }]
      const items = await db.collection('bookings').find(filter).sort({ createdAt: -1 }).limit(500).toArray()
      return json({ items: items.map(sanitize) })
    }
    if (route === '/bookings' && method === 'POST') {
      const body = await request.json()
      const s = await getSession(request)
      const lrNumber = await nextLrNumber(db)
      const now = new Date()
      const totalAmount = Number(body.totalAmount || 0)
      const doc = {
        id: uuidv4(), lrNumber,
        date: body.date || now.toISOString().slice(0,10),
        sender: { name: body.senderName || '', phone: body.senderPhone || '', address: body.pickupAddress || '', gst: body.senderGst || '' },
        receiver: { name: body.receiverName || '', phone: body.receiverPhone || '', address: body.deliveryAddress || '', gst: body.receiverGst || '' },
        origin: body.origin || '', destination: body.destination || '',
        invoiceNumber: body.invoiceNumber || '',
        eWayBill: body.eWayBill || '',
        remarks: body.remarks || '',
        packages: Number(body.packages || 1), actualWeight: Number(body.actualWeight || 0), volumetricWeight: Number(body.volumetricWeight || 0), chargeableWeight: Number(body.chargeableWeight || 0),
        freightRate: Number(body.freightRate || 0), biltyCharge: Number(body.biltyCharge || 0), doorDeliveryCharge: Number(body.doorDeliveryCharge || 0),
        insurance: Number(body.insurance || 0), loadingUnloading: Number(body.loadingUnloading || 0), hamali: Number(body.hamali || body.loadingUnloading || 0), otherCharges: Number(body.otherCharges || 0),
        totalAmount, paymentStatus: body.paymentStatus || 'PENDING', paymentMode: body.paymentMode || 'CASH',
        branchCode: body.branchCode || s?.code || 'HO',
        assignedDriver: body.assignedDriver || null,
        status: 'BOOKED', currentLocation: body.origin || 'Guwahati', eta: body.eta || '',
        timeline: [{ key: 'BOOKED', label: 'Booking Received', at: now.toISOString(), location: body.origin || 'Guwahati', note: 'Consignment booked at Assam Goods Carrier' }],
        createdAt: now, updatedAt: now,
      }
      await db.collection('bookings').insertOne(doc)
      await logActivity(db, { actor: s?.userId || 'admin-root', role: s?.role || 'admin', action: 'BOOKING_CREATED', target: lrNumber })
      await sendNotification({ event: 'BOOKING_CREATED', booking: doc })
      return json({ ok: true, booking: sanitize(doc) })
    }
    if (parts[0] === 'bookings' && parts.length === 2 && method === 'GET') {
      const lr = decodeURIComponent(parts[1])
      const doc = await db.collection('bookings').findOne({ lrNumber: lr })
      if (!doc) return json({ ok: false, error: 'Not found' }, 404)
      return json({ ok: true, booking: sanitize(doc) })
    }
    if (parts[0] === 'track' && parts.length === 2 && method === 'GET') {
      const lr = decodeURIComponent(parts[1])
      const doc = await db.collection('bookings').findOne({ lrNumber: lr })
      if (!doc) return json({ ok: false, error: 'Shipment not found. Please check the LR number.' }, 404)
      const s = sanitize(doc)
      return json({ ok: true, lrNumber: s.lrNumber, status: s.status, origin: s.origin, destination: s.destination, currentLocation: s.currentLocation, eta: s.eta, sender: { name: s.sender?.name }, receiver: { name: s.receiver?.name }, packages: s.packages, chargeableWeight: s.chargeableWeight, timeline: s.timeline || [], stages: DEFAULT_STAGES, updatedAt: s.updatedAt, deliveryDate: s.deliveryDate || null, pod: s.pod || null })
    }
    if (parts[0] === 'bookings' && parts[2] === 'status' && method === 'POST') {
      const lr = decodeURIComponent(parts[1])
      const body = await request.json()
      const s = await getSession(request)
      const stage = DEFAULT_STAGES.find(x => x.key === body.status) || { key: body.status, label: body.status }
      const now = new Date()
      const entry = { key: stage.key, label: stage.label, at: now.toISOString(), location: body.location || '', note: body.note || '', by: s?.name || s?.role || 'system' }
      const update = {
        $set: { status: stage.key, updatedAt: now, ...(body.location ? { currentLocation: body.location } : {}), ...(stage.key === 'DELIVERED' ? { deliveryDate: now.toISOString() } : {}) },
        $push: { timeline: entry },
      }
      const res = await db.collection('bookings').findOneAndUpdate({ lrNumber: lr }, update, { returnDocument: 'after' })
      const val = res?.value || res
      if (!val) return json({ ok: false, error: 'Not found' }, 404)
      await logActivity(db, { actor: s?.userId || 'admin-root', role: s?.role || 'admin', action: 'STATUS_UPDATE', target: lr, meta: { status: stage.key } })
      const notifyEvt = NOTIFY_EVENTS[stage.key]; if (notifyEvt) await sendNotification({ event: notifyEvt, booking: val })
      return json({ ok: true, booking: sanitize(val) })
    }
    if (parts[0] === 'bookings' && parts[2] === 'pod' && method === 'POST') {
      const lr = decodeURIComponent(parts[1])
      const body = await request.json()
      const s = await getSession(request)
      const pod = { photo: body.photo || null, signature: body.signature || null, receiverName: body.receiverName || null, receivedAt: new Date().toISOString(), by: s?.name || s?.role }
      const res = await db.collection('bookings').findOneAndUpdate({ lrNumber: lr }, { $set: { pod, status: 'DELIVERED', deliveryDate: pod.receivedAt, updatedAt: new Date() }, $push: { timeline: { key: 'DELIVERED', label: 'Delivered', at: pod.receivedAt, location: body.location || '', note: `POD captured by ${pod.by}`, by: pod.by } } }, { returnDocument: 'after' })
      const val = res?.value || res
      if (!val) return json({ ok: false, error: 'Not found' }, 404)
      await logActivity(db, { actor: s?.userId, role: s?.role, action: 'POD_UPLOAD', target: lr })
      await sendNotification({ event: 'DELIVERED', booking: val })
      return json({ ok: true, booking: sanitize(val) })
    }

    // -------- COMPANY SETTINGS ---------
    if (route === '/settings' && method === 'GET') {
      let s = await db.collection('settings').findOne({ _id: 'company' })
      if (!s) {
        s = {
          _id: 'company',
          companyName: 'ASSAM GOODS CARRIER',
          tagline: 'Safe • Fast • Reliable',
          gstNumber: '18AABCA1234A1Z5',
          address: 'G.S. Road, Guwahati, Assam - 781005',
          phone: '8847428801',
          whatsapp: '8847428801',
          email: 'bookings@assamgoodscarrier.in',
          website: 'https://assamgoodscarrier.in',
          bankName: '',
          bankAccount: '',
          bankIfsc: '',
          bankBranch: '',
          logoUrl: '',
          lrPrefix: 'AGC',
          transferPrefix: 'TXF',
          gstPercent: 18,
          sessionTimeoutMinutes: 60,
          theme: 'light',
          updatedAt: new Date(),
        }
        await db.collection('settings').insertOne(s)
      }
      const { _id, ...rest } = s
      return json({ ok: true, settings: rest })
    }
    if (route === '/settings' && method === 'PUT') {
      const s = await getSession(request)
      if (!s || s.role !== 'admin') return json({ ok: false, error: 'Super Admin only' }, 403)
      const body = await request.json()
      const allow = ['companyName','tagline','gstNumber','address','phone','whatsapp','email','website','bankName','bankAccount','bankIfsc','bankBranch','logoUrl','lrPrefix','transferPrefix','gstPercent','sessionTimeoutMinutes','theme','smtp']
      const set = { updatedAt: new Date() }
      for (const k of allow) if (body[k] !== undefined) set[k] = body[k]
      await db.collection('settings').updateOne({ _id: 'company' }, { $set: set }, { upsert: true })
      await logActivity(db, { actor: s.userId, role: s.role, action: 'SETTINGS_UPDATE', target: 'company', meta: Object.keys(set) })
      const updated = await db.collection('settings').findOne({ _id: 'company' })
      const { _id, ...rest } = updated
      return json({ ok: true, settings: rest })
    }

    // -------- PASSWORD MANAGEMENT ---------
    if (route === '/users/change-password' && method === 'POST') {
      const s = await getSession(request)
      if (!s) return json({ ok:false, error:'Not authenticated' }, 401)
      const { oldPassword, newPassword } = await request.json()
      if (!newPassword || newPassword.length < 6) return json({ ok:false, error:'New password must be at least 6 characters' }, 400)
      const user = await db.collection('users').findOne({ id: s.userId })
      const bcrypt = (await import('bcryptjs')).default
      if (user) {
        const isHashed = String(user.password || '').startsWith('$2')
        const match = isHashed ? await bcrypt.compare(oldPassword||'', user.password) : (user.password === oldPassword)
        if (!match) return json({ ok:false, error:'Old password incorrect' }, 400)
        const hashed = await bcrypt.hash(newPassword, 10)
        await db.collection('users').updateOne({ id: s.userId }, { $set: { password: hashed, mustChangePassword: false, passwordChangedAt: new Date() }, $unset: { plainInitialPassword: '' } })
      } else if (s.role === 'admin') {
        // Admin root can change its "password" stored in settings
        const hashed = await bcrypt.hash(newPassword, 10)
        await db.collection('settings').updateOne({ _id: 'company' }, { $set: { adminPasswordHash: hashed, adminPasswordChangedAt: new Date() } }, { upsert: true })
      }
      await logActivity(db, { actor: s.userId, role: s.role, action: 'PASSWORD_CHANGED', target: s.userId })
      return json({ ok:true })
    }

    // -------- FORGOT / RESET PASSWORD (Email OTP) ---------
    if (route === '/auth/forgot-password' && method === 'POST') {
      const { email } = await request.json()
      if (!email) return json({ ok:false, error:'Email is required' }, 400)
      // Simple rate limit: max 3 per email per 15min
      const since = new Date(Date.now() - 15*60*1000)
      const recent = await db.collection('otp_tokens').countDocuments({ email, createdAt: { $gte: since } })
      if (recent >= 3) return json({ ok:false, error:'Too many reset requests. Please try again in 15 minutes.' }, 429)
      // Locate user by email in users OR in settings (admin)
      const user = await db.collection('users').findOne({ email })
      const settings = await db.collection('settings').findOne({ _id: 'company' })
      const isAdmin = !user && settings && settings.email === email
      if (!user && !isAdmin) {
        // Do not reveal existence; still respond ok
        return json({ ok: true, message: 'If the email is registered, an OTP has been sent.' })
      }
      const otp = String(Math.floor(100000 + Math.random()*900000))
      const bcrypt = (await import('bcryptjs')).default
      const otpHash = await bcrypt.hash(otp, 10)
      const resetToken = uuidv4()
      const expiresAt = new Date(Date.now() + 15*60*1000) // 15 min
      const doc = { id: uuidv4(), email, otpHash, resetToken, userId: user?.id || 'admin-root', role: user?.role || (isAdmin ? 'admin' : 'user'), used: false, expiresAt, createdAt: new Date() }
      await db.collection('otp_tokens').insertOne(doc)
      // Send email via SMTP if configured; else log to activity for admin retrieval
      const smtp = settings?.smtp || {}

console.log("SMTP SETTINGS:", smtp)

let mailed = false
      if (smtp.host && smtp.user && smtp.pass) {
        try {
          const nodemailer = (await import('nodemailer')).default
          const transporter = nodemailer.createTransport({ host: smtp.host, port: Number(smtp.port||587), secure: !!smtp.secure, auth: { user: smtp.user, pass: smtp.pass } })
          const from = smtp.from || `${settings.companyName || 'Assam Goods Carrier'} <${smtp.user}>`
          const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/reset-password?token=${resetToken}`
          await transporter.sendMail({
            from, to: email, subject: `${settings.companyName || 'AGC'} \u2014 Password Reset OTP`,
            html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #E5E7EB;border-radius:12px">
              <div style="font-size:22px;font-weight:900;color:#0F3D91">${settings.companyName || 'ASSAM GOODS CARRIER'}</div>
              <div style="color:#F97316;font-size:11px;letter-spacing:3px;font-weight:700">SAFE \u2022 FAST \u2022 RELIABLE</div>
              <hr style="border:none;border-top:2px solid #F97316;margin:16px 0"/>
              <h2 style="color:#0F3D91;margin:0 0 8px">Password Reset Request</h2>
              <p style="color:#374151">Use the following OTP to reset your password. It expires in <b>15 minutes</b>.</p>
              <div style="font-size:36px;font-weight:900;letter-spacing:8px;color:#0F3D91;background:#F3F4F6;padding:16px;text-align:center;border-radius:10px">${otp}</div>
              <p style="color:#6B7280;font-size:13px;margin-top:16px">Or click the link below to open the reset page:</p>
              <a href="${resetLink}" style="display:inline-block;background:#0F3D91;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Reset Password</a>
              <p style="color:#9CA3AF;font-size:11px;margin-top:24px">If you did not request this, please ignore this email.</p>
            </div>`,
          })
          mailed = true
        } catch (e) { console.error('SMTP send failed', e) }
      }
      await logActivity(db, { actor: user?.id || 'system', role: user?.role || 'anon', action: 'PASSWORD_RESET_REQUESTED', target: email, meta: { mailed, mock_otp: mailed ? undefined : otp } })
      return json({ ok:true, message: mailed ? 'OTP sent to your email.' : 'OTP generated (SMTP not configured — check Activity Log for OTP).', mailed })
    }
    if (route === '/auth/verify-otp' && method === 'POST') {
      const { email, otp } = await request.json()
      if (!email || !otp) return json({ ok:false, error:'Email and OTP required' }, 400)
      const now = new Date()
      const tokens = await db.collection('otp_tokens').find({ email, used: false, expiresAt: { $gt: now } }).sort({ createdAt: -1 }).limit(3).toArray()
      const bcrypt = (await import('bcryptjs')).default
      for (const t of tokens) {
        if (await bcrypt.compare(otp, t.otpHash)) {
          return json({ ok:true, resetToken: t.resetToken })
        }
      }
      return json({ ok:false, error:'Invalid or expired OTP' }, 400)
    }
    if (route === '/auth/reset-password' && method === 'POST') {
      const { resetToken, newPassword, otp, email } = await request.json()
      if (!newPassword || newPassword.length < 6) return json({ ok:false, error:'Password must be at least 6 characters' }, 400)
      const now = new Date()
      let tokenDoc = null
      if (resetToken) {
        tokenDoc = await db.collection('otp_tokens').findOne({ resetToken, used: false, expiresAt: { $gt: now } })
      } else if (email && otp) {
        const bcrypt = (await import('bcryptjs')).default
        const tokens = await db.collection('otp_tokens').find({ email, used: false, expiresAt: { $gt: now } }).sort({ createdAt: -1 }).limit(3).toArray()
        for (const t of tokens) if (await bcrypt.compare(otp, t.otpHash)) { tokenDoc = t; break }
      }
      if (!tokenDoc) return json({ ok:false, error:'Invalid or expired reset token / OTP' }, 400)
      const bcrypt = (await import('bcryptjs')).default
      const hashed = await bcrypt.hash(newPassword, 10)
      if (tokenDoc.role === 'admin' && tokenDoc.userId === 'admin-root') {
        await db.collection('settings').updateOne({ _id: 'company' }, { $set: { adminPasswordHash: hashed, adminPasswordChangedAt: new Date() } }, { upsert: true })
      } else {
        await db.collection('users').updateOne({ id: tokenDoc.userId }, { $set: { password: hashed, mustChangePassword: false, passwordChangedAt: new Date() }, $unset: { plainInitialPassword: '' } })
      }
      await db.collection('otp_tokens').updateOne({ id: tokenDoc.id }, { $set: { used: true, usedAt: new Date() } })
      // Invalidate other tokens for same email
      await db.collection('otp_tokens').updateMany({ email: tokenDoc.email, used: false, id: { $ne: tokenDoc.id } }, { $set: { used: true } })
      await logActivity(db, { actor: tokenDoc.userId, role: tokenDoc.role, action: 'PASSWORD_RESET_COMPLETED', target: tokenDoc.email })
      return json({ ok:true })
    }
    if (parts[0] === 'users' && parts[2] === 'reset-password' && method === 'POST') {
      const s = await getSession(request)
      if (!s || s.role !== 'admin') return json({ ok:false, error:'Super Admin only' }, 403)
      const { newPassword } = await request.json()
      const bcrypt = (await import('bcryptjs')).default
      const hashed = await bcrypt.hash(newPassword || 'agc123', 10)
      await db.collection('users').updateOne({ id: parts[1] }, { $set: { password: hashed, mustChangePassword: true, passwordChangedAt: new Date() } })
      await logActivity(db, { actor: s.userId, role: s.role, action: 'PASSWORD_RESET', target: parts[1] })
      return json({ ok:true })
    }
    if (parts[0] === 'users' && parts[2] === 'toggle-active' && method === 'POST') {
      const s = await getSession(request)
      if (!s || s.role !== 'admin') return json({ ok:false, error:'Super Admin only' }, 403)
      const u = await db.collection('users').findOne({ id: parts[1] })
      if (!u) return json({ ok:false, error:'Not found' }, 404)
      await db.collection('users').updateOne({ id: parts[1] }, { $set: { active: !(u.active !== false) } })
      await logActivity(db, { actor: s.userId, role: s.role, action: 'USER_TOGGLE_ACTIVE', target: parts[1] })
      return json({ ok:true, active: !(u.active !== false) })
    }

    // -------- LABEL SIZES ---------
    if (route === '/label-sizes' && method === 'GET') {
      let items = await db.collection('label_sizes').find({}).sort({ createdAt: 1 }).toArray()
      if (items.length === 0) {
        // Seed defaults
        const defaults = [
          { name: '100 × 150 mm (4×6)', width: 100, height: 150, isDefault: true },
          { name: '100 × 100 mm (4×4)', width: 100, height: 100, isDefault: true },
          { name: '100 × 75 mm (4×3)',  width: 100, height: 75,  isDefault: true },
          { name: '100 × 50 mm (4×2)',  width: 100, height: 50,  isDefault: true },
          { name: '75 × 50 mm (3×2)',   width: 75,  height: 50,  isDefault: true },
          { name: '50 × 25 mm (2×1)',   width: 50,  height: 25,  isDefault: true },
        ].map(x => ({ id: uuidv4(), ...x, createdAt: new Date() }))
        await db.collection('label_sizes').insertMany(defaults)
        items = defaults
      }
      return json({ items: items.map(sanitize) })
    }
    if (route === '/label-sizes' && method === 'POST') {
      const b = await request.json()
      const w = Number(b.width); const h = Number(b.height)
      if (!w || !h || w < 10 || h < 10 || w > 300 || h > 300) return json({ ok:false, error:'Enter valid width & height in mm (10-300)' }, 400)
      const name = b.name || `${w} × ${h} mm`
      const doc = { id: uuidv4(), name, width: w, height: h, isDefault: false, createdAt: new Date() }
      await db.collection('label_sizes').insertOne(doc)
      return json({ ok: true, size: sanitize(doc) })
    }
    if (parts[0] === 'label-sizes' && parts.length === 2 && method === 'DELETE') {
      await db.collection('label_sizes').deleteOne({ id: parts[1], isDefault: { $ne: true } })
      return json({ ok: true })
    }

    // -------- BRANCH TRANSFERS ---------
    if (route === '/transfers' && method === 'GET') {
      const filter = {}
      const lr = url.searchParams.get('lr'); if (lr) filter.lrNumber = lr
      const from = url.searchParams.get('from'); if (from) filter.fromBranch = from
      const to = url.searchParams.get('to'); if (to) filter.toBranch = to
      const status = url.searchParams.get('status'); if (status) filter.status = status
      const items = await db.collection('transfers').find(filter).sort({ createdAt: -1 }).limit(500).toArray()
      return json({ items: items.map(sanitize) })
    }
    if (route === '/transfers' && method === 'POST') {
      const body = await request.json()
      const s = await getSession(request)
      if (!body.lrNumber || !body.fromBranch || !body.toBranch) return json({ ok: false, error: 'lrNumber, fromBranch and toBranch are required' }, 400)
      if (body.fromBranch === body.toBranch) return json({ ok: false, error: 'From and To branches must be different' }, 400)
      const booking = await db.collection('bookings').findOne({ lrNumber: body.lrNumber })
      if (!booking) return json({ ok: false, error: 'Booking (LR) not found' }, 404)
      const now = new Date()
      const key = String(now.getFullYear()).slice(-2) + String(now.getMonth()+1).padStart(2,'0') + String(now.getDate()).padStart(2,'0')
      const cRes = await db.collection('counters').findOneAndUpdate({ _id: `xfer_${key}` }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: 'after' })
      const seq = (cRes && cRes.value && cRes.value.seq) || (cRes && cRes.seq) || 1
      const transferId = `TXF-${key}-${String(seq).padStart(4,'0')}`
      const doc = {
        id: uuidv4(), transferId, lrNumber: body.lrNumber,
        fromBranch: body.fromBranch, toBranch: body.toBranch,
        remarks: body.remarks || '', vehicleNumber: body.vehicleNumber || '', driverName: body.driverName || '',
        status: 'IN_TRANSIT',
        transferredBy: s?.name || s?.role || 'admin',
        transferredAt: now.toISOString(),
        receivedBy: null, receivedAt: null, receivedRemarks: null,
        timeline: [{ event: 'DISPATCHED', at: now.toISOString(), branch: body.fromBranch, by: s?.name || 'admin', note: `Shipment transferred to ${body.toBranch}. ${body.remarks || ''}`.trim() }],
        createdAt: now, updatedAt: now,
      }
      await db.collection('transfers').insertOne(doc)
      // Push into booking timeline & set currentLocation to toBranch
      await db.collection('bookings').updateOne(
        { lrNumber: body.lrNumber },
        { $set: { currentLocation: body.toBranch, branchCode: body.toBranch, updatedAt: now, status: 'IN_TRANSIT' },
          $push: { timeline: { key: 'IN_TRANSIT', label: `Transferred ${body.fromBranch} \u2192 ${body.toBranch}`, at: now.toISOString(), location: body.toBranch, note: `Transfer ${transferId}. ${body.remarks || ''}`.trim(), by: s?.name || 'admin' } } }
      )
      await logActivity(db, { actor: s?.userId || 'admin-root', role: s?.role || 'admin', action: 'TRANSFER_CREATED', target: transferId, meta: { lr: body.lrNumber, from: body.fromBranch, to: body.toBranch } })
      return json({ ok: true, transfer: sanitize(doc) })
    }
    if (parts[0] === 'transfers' && parts.length === 2 && method === 'GET') {
      const doc = await db.collection('transfers').findOne({ transferId: parts[1] })
      if (!doc) return json({ ok: false, error: 'Not found' }, 404)
      return json({ ok: true, transfer: sanitize(doc) })
    }
    if (parts[0] === 'transfers' && parts[2] === 'receive' && method === 'POST') {
      const transferId = parts[1]
      const body = await request.json().catch(() => ({}))
      const s = await getSession(request)
      const now = new Date()
      const existing = await db.collection('transfers').findOne({ transferId })
      if (!existing) return json({ ok: false, error: 'Transfer not found' }, 404)
      if (existing.status === 'RECEIVED') return json({ ok: false, error: 'Already received' }, 400)
      const receivedBy = body.receivedBy || s?.name || s?.role || 'branch'
      const update = {
        $set: { status: 'RECEIVED', receivedBy, receivedAt: now.toISOString(), receivedRemarks: body.remarks || '', updatedAt: now },
        $push: { timeline: { event: 'RECEIVED', at: now.toISOString(), branch: existing.toBranch, by: receivedBy, note: body.remarks || 'Received at destination branch' } },
      }
      const res = await db.collection('transfers').findOneAndUpdate({ transferId }, update, { returnDocument: 'after' })
      const val = res?.value || res
      // Push to booking timeline
      await db.collection('bookings').updateOne(
        { lrNumber: existing.lrNumber },
        { $set: { currentLocation: existing.toBranch, updatedAt: now },
          $push: { timeline: { key: 'ARRIVED', label: `Received at ${existing.toBranch}`, at: now.toISOString(), location: existing.toBranch, note: `Transfer ${transferId} received. ${body.remarks || ''}`.trim(), by: receivedBy } } }
      )
      await logActivity(db, { actor: s?.userId || 'branch', role: s?.role || 'branch', action: 'TRANSFER_RECEIVED', target: transferId, meta: { lr: existing.lrNumber } })
      return json({ ok: true, transfer: sanitize(val) })
    }
    if (parts[0] === 'bookings' && parts[2] === 'transfers' && method === 'GET') {
      const lr = decodeURIComponent(parts[1])
      const items = await db.collection('transfers').find({ lrNumber: lr }).sort({ createdAt: 1 }).toArray()
      return json({ items: items.map(sanitize) })
    }

    // -------- RATES ---------
    if (route === '/rates' && method === 'GET') {
      const items = await db.collection('rates').find({}).sort({ createdAt: -1 }).toArray()
      return json({ items: items.map(sanitize) })
    }
    if (route === '/rates' && method === 'POST') {
      const body = await request.json()
      const doc = { id: uuidv4(), fromState: body.fromState||'', toState: body.toState||'', fromCity: body.fromCity||'', toCity: body.toCity||'', ratePerKg: Number(body.ratePerKg||0), minBilty: Number(body.minBilty||0), biltyCharge: Number(body.biltyCharge||0), doorCharge: Number(body.doorCharge||0), insurancePct: Number(body.insurancePct||0), fuelSurcharge: Number(body.fuelSurcharge||0), gst: Number(body.gst||18), createdAt: new Date() }
      await db.collection('rates').insertOne(doc)
      return json({ ok: true, rate: sanitize(doc) })
    }
    if (parts[0] === 'rates' && parts.length === 2 && method === 'DELETE') {
      await db.collection('rates').deleteOne({ id: parts[1] }); return json({ ok: true })
    }

    // -------- BRANCHES & USERS ---------
    if (route === '/branches' && method === 'GET') { const items = await db.collection('branches').find({}).toArray(); return json({ items: items.map(sanitize) }) }
    if (route === '/branches' && method === 'POST') {
      const b = await request.json()
      const doc = { id: uuidv4(), code: b.code, name: b.name, city: b.city, state: b.state || 'Assam', phone: b.phone, address: b.address, createdAt: new Date() }
      await db.collection('branches').insertOne(doc); return json({ ok: true, branch: sanitize(doc) })
    }
    if (parts[0] === 'branches' && parts.length === 2 && method === 'DELETE') { await db.collection('branches').deleteOne({ id: parts[1] }); return json({ ok: true }) }

    if (route === '/users' && method === 'GET') { const items = await db.collection('users').find({}).toArray(); return json({ items: items.map(sanitize) }) }
    if (route === '/users' && method === 'POST') {
      const b = await request.json()
      if (!b.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email)) return json({ ok:false, error:'A valid email address is required' }, 400)
      const existing = await db.collection('users').findOne({ email: b.email })
      if (existing) return json({ ok:false, error:'A user with this email already exists' }, 400)
      const bcrypt = (await import('bcryptjs')).default
      const rawPw = b.password || Math.random().toString(36).slice(2, 10)
      const hashed = await bcrypt.hash(rawPw, 10)
      const doc = { id: uuidv4(), name: b.name, role: b.role, email: b.email.toLowerCase(), phone: b.phone || '', code: b.code || '', branchId: b.branchId || null, password: hashed, plainInitialPassword: rawPw, mustChangePassword: true, active: true, createdAt: new Date() }
      await db.collection('users').insertOne(doc); return json({ ok: true, user: sanitize(doc) })
    }
    if (parts[0] === 'users' && parts.length === 2 && method === 'PATCH') {
      const s = await getSession(request)
      if (!s || s.role !== 'admin') return json({ ok:false, error:'Super Admin only' }, 403)
      const body = await request.json()
      const allow = ['name','email','phone','code','active','branchId']
      const set = {}; for (const k of allow) if (body[k] !== undefined) set[k] = body[k]
      if (set.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(set.email)) return json({ ok:false, error:'Invalid email' }, 400)
      if (set.email) set.email = set.email.toLowerCase()
      await db.collection('users').updateOne({ id: parts[1] }, { $set: set })
      await logActivity(db, { actor: s.userId, role: s.role, action: 'USER_UPDATED', target: parts[1], meta: Object.keys(set) })
      return json({ ok:true })
    }
    if (parts[0] === 'users' && parts.length === 2 && method === 'DELETE') { await db.collection('users').deleteOne({ id: parts[1] }); return json({ ok: true }) }

    // -------- REPORTS ---------
    if (route === '/reports/daily' && method === 'GET') {
      const day = url.searchParams.get('date') || new Date().toISOString().slice(0,10)
      const start = new Date(day + 'T00:00:00'); const end = new Date(day + 'T23:59:59')
      const items = await db.collection('bookings').find({ createdAt: { $gte: start, $lte: end } }).toArray()
      const total = items.reduce((a,b)=>a+Number(b.totalAmount||0),0)
      return json({ date: day, count: items.length, total, items: items.map(sanitize) })
    }
    if (route === '/reports/monthly' && method === 'GET') {
      const ym = url.searchParams.get('ym') || new Date().toISOString().slice(0,7)
      const [y,m] = ym.split('-').map(Number)
      const start = new Date(y, m-1, 1); const end = new Date(y, m, 0, 23, 59, 59)
      const items = await db.collection('bookings').find({ createdAt: { $gte: start, $lte: end } }).toArray()
      const total = items.reduce((a,b)=>a+Number(b.totalAmount||0),0)
      return json({ ym, count: items.length, total, items: items.map(sanitize) })
    }
    if (route === '/reports/outstanding' && method === 'GET') {
      const items = await db.collection('bookings').find({ paymentStatus: { $ne: 'PAID' } }).toArray()
      const total = items.reduce((a,b)=>a+Number(b.totalAmount||0),0)
      return json({ count: items.length, total, items: items.map(sanitize) })
    }
    if (route === '/reports/branch' && method === 'GET') {
      const agg = await db.collection('bookings').aggregate([{ $group: { _id: '$branchCode', count: { $sum: 1 }, total: { $sum: '$totalAmount' }, delivered: { $sum: { $cond: [{ $eq: ['$status','DELIVERED'] }, 1, 0] } } } }, { $sort: { total: -1 } }]).toArray()
      return json({ items: agg })
    }
    if (route === '/reports/customer' && method === 'GET') {
      const agg = await db.collection('bookings').aggregate([{ $group: { _id: { name: '$sender.name', phone: '$sender.phone' }, count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }, { $sort: { total: -1 } }, { $limit: 100 }]).toArray()
      return json({ items: agg.map(x => ({ name: x._id.name, phone: x._id.phone, count: x.count, total: x.total })) })
    }

    // -------- ACTIVITY & NOTIFICATIONS ---------
    if (route === '/activity' && method === 'GET') {
      const items = await db.collection('activity').find({}).sort({ at: -1 }).limit(200).toArray()
      return json({ items: items.map(sanitize) })
    }
    if (route === '/notifications' && method === 'GET') {
      const items = await db.collection('notifications').find({}).sort({ createdAt: -1 }).limit(200).toArray()
      return json({ items: items.map(sanitize) })
    }

    // -------- ENQUIRIES ---------
    if (route === '/enquiries' && method === 'POST') { const body = await request.json(); await db.collection('enquiries').insertOne({ id: uuidv4(), ...body, createdAt: new Date() }); return json({ ok: true }) }
    if (route === '/enquiries' && method === 'GET') { const items = await db.collection('enquiries').find({}).sort({ createdAt: -1 }).toArray(); return json({ items: items.map(sanitize) }) }

    // -------- CUSTOMER (public) ---------
    if (route === '/customer/bookings' && method === 'GET') {
      const phone = url.searchParams.get('phone'); if (!phone) return json({ items: [] })
      const items = await db.collection('bookings').find({ $or: [{ 'sender.phone': phone }, { 'receiver.phone': phone }] }).sort({ createdAt: -1 }).toArray()
      return json({ items: items.map(sanitize) })
    }

    return json({ ok: false, error: 'Route not found', route, method }, 404)
  } catch (e) {
    console.error('API error', e)
    return json({ ok: false, error: e.message || 'Server error' }, 500)
  }
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const DELETE = handle
export const PATCH = handle
