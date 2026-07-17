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
      if (body?.password === ADMIN_PASSWORD) {
        const token = await createSession('admin', 'admin-root', { name: 'Super Admin' })
        await logActivity(db, { actor: 'admin-root', role: 'admin', action: 'LOGIN', target: 'admin' })
        return json({ ok: true, token, role: 'admin', name: 'Super Admin', permissions: ROLE_PERMISSIONS.admin })
      }
      return json({ ok: false, error: 'Invalid password' }, 401)
    }
    if (route === '/branch/login' && method === 'POST') {
      const { code, password } = await request.json()
      const user = await db.collection('users').findOne({ role: 'branch', code, password, active: { $ne: false } })
      if (!user) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const token = await createSession('branch', user.id, { name: user.name, code: user.code, branchId: user.branchId })
      await logActivity(db, { actor: user.id, role: 'branch', action: 'LOGIN', target: user.code })
      return json({ ok: true, token, role: 'branch', name: user.name, code: user.code, permissions: ROLE_PERMISSIONS.branch })
    }
    if (route === '/driver/login' && method === 'POST') {
      const { phone, password } = await request.json()
      const user = await db.collection('users').findOne({ role: 'driver', phone, password, active: { $ne: false } })
      if (!user) return json({ ok: false, error: 'Invalid credentials' }, 401)
      const token = await createSession('driver', user.id, { name: user.name, phone })
      await logActivity(db, { actor: user.id, role: 'driver', action: 'LOGIN', target: phone })
      return json({ ok: true, token, role: 'driver', name: user.name, permissions: ROLE_PERMISSIONS.driver })
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
      const doc = { id: uuidv4(), name: b.name, role: b.role, phone: b.phone || '', code: b.code || '', branchId: b.branchId || null, password: b.password || 'agc123', active: true, createdAt: new Date() }
      await db.collection('users').insertOne(doc); return json({ ok: true, user: sanitize(doc) })
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
