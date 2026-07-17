import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { v4 as uuidv4 } from 'uuid'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'assam123'

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
}

async function nextLrNumber(db) {
  const now = new Date()
  const y = String(now.getFullYear()).slice(-2)
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const key = `${y}${m}${d}`
  const res = await db.collection('counters').findOneAndUpdate(
    { _id: `lr_${key}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' }
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

function sanitize(doc) {
  if (!doc) return doc
  const { _id, ...rest } = doc
  return rest
}

async function handle(request, { params }) {
  const method = request.method
  const parts = (params?.path) || []
  const route = '/' + parts.join('/')

  try {
    const db = await getDb()

    // Health
    if (route === '/' || route === '/health') {
      return json({ ok: true, service: 'assam-goods-carrier', time: new Date().toISOString() })
    }

    // Admin login
    if (route === '/admin/login' && method === 'POST') {
      const body = await request.json().catch(() => ({}))
      if (body?.password === ADMIN_PASSWORD) {
        const token = uuidv4()
        await db.collection('sessions').insertOne({ token, role: 'admin', createdAt: new Date() })
        return json({ ok: true, token })
      }
      return json({ ok: false, error: 'Invalid password' }, 401)
    }

    // Stats
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
      return json({
        totalBookings: total,
        todaysBookings: today,
        deliveredShipments: delivered,
        inTransitShipments: inTransit,
        pendingDeliveries: pending,
        cancelledShipments: cancelled,
        totalRevenue: revenueAgg[0]?.total || 0,
        outstandingPayments: outstandingAgg[0]?.total || 0,
      })
    }

    // Bookings list
    if (route === '/bookings' && method === 'GET') {
      const items = await db.collection('bookings').find({}).sort({ createdAt: -1 }).limit(200).toArray()
      return json({ items: items.map(sanitize) })
    }

    // Create booking
    if (route === '/bookings' && method === 'POST') {
      const body = await request.json()
      const lrNumber = await nextLrNumber(db)
      const now = new Date()
      const totalAmount = Number(body.totalAmount || 0)
      const doc = {
        id: uuidv4(),
        lrNumber,
        date: body.date || now.toISOString().slice(0,10),
        sender: {
          name: body.senderName || '',
          phone: body.senderPhone || '',
          address: body.pickupAddress || '',
          gst: body.senderGst || '',
        },
        receiver: {
          name: body.receiverName || '',
          phone: body.receiverPhone || '',
          address: body.deliveryAddress || '',
          gst: body.receiverGst || '',
        },
        origin: body.origin || '',
        destination: body.destination || '',
        invoiceNumber: body.invoiceNumber || '',
        packages: Number(body.packages || 1),
        actualWeight: Number(body.actualWeight || 0),
        volumetricWeight: Number(body.volumetricWeight || 0),
        chargeableWeight: Number(body.chargeableWeight || 0),
        freightRate: Number(body.freightRate || 0),
        biltyCharge: Number(body.biltyCharge || 0),
        doorDeliveryCharge: Number(body.doorDeliveryCharge || 0),
        insurance: Number(body.insurance || 0),
        loadingUnloading: Number(body.loadingUnloading || 0),
        otherCharges: Number(body.otherCharges || 0),
        totalAmount,
        paymentStatus: body.paymentStatus || 'PENDING',
        paymentMode: body.paymentMode || 'CASH',
        status: 'BOOKED',
        currentLocation: body.origin || 'Guwahati',
        eta: body.eta || '',
        timeline: [{ key: 'BOOKED', label: 'Booking Received', at: now.toISOString(), location: body.origin || 'Guwahati', note: 'Consignment booked at Assam Goods Carrier' }],
        createdAt: now,
        updatedAt: now,
      }
      await db.collection('bookings').insertOne(doc)
      return json({ ok: true, booking: sanitize(doc) })
    }

    // Single booking by lr (also public tracking)
    if (parts[0] === 'bookings' && parts.length === 2 && method === 'GET') {
      const lr = decodeURIComponent(parts[1])
      const doc = await db.collection('bookings').findOne({ lrNumber: lr })
      if (!doc) return json({ ok: false, error: 'Not found' }, 404)
      return json({ ok: true, booking: sanitize(doc) })
    }

    // Public track by LR
    if (parts[0] === 'track' && parts.length === 2 && method === 'GET') {
      const lr = decodeURIComponent(parts[1])
      const doc = await db.collection('bookings').findOne({ lrNumber: lr })
      if (!doc) return json({ ok: false, error: 'Shipment not found. Please check the LR number.' }, 404)
      const s = sanitize(doc)
      return json({
        ok: true,
        lrNumber: s.lrNumber,
        status: s.status,
        origin: s.origin,
        destination: s.destination,
        currentLocation: s.currentLocation,
        eta: s.eta,
        sender: { name: s.sender?.name },
        receiver: { name: s.receiver?.name },
        packages: s.packages,
        chargeableWeight: s.chargeableWeight,
        timeline: s.timeline || [],
        stages: DEFAULT_STAGES,
        updatedAt: s.updatedAt,
        deliveryDate: s.deliveryDate || null,
        podImage: s.podImage || null,
      })
    }

    // Update status
    if (parts[0] === 'bookings' && parts[2] === 'status' && method === 'POST') {
      const lr = decodeURIComponent(parts[1])
      const body = await request.json()
      const stage = DEFAULT_STAGES.find(s => s.key === body.status) || { key: body.status, label: body.status }
      const now = new Date()
      const entry = { key: stage.key, label: stage.label, at: now.toISOString(), location: body.location || '', note: body.note || '' }
      const update = {
        $set: {
          status: stage.key,
          currentLocation: body.location || undefined,
          updatedAt: now,
          ...(stage.key === 'DELIVERED' ? { deliveryDate: now.toISOString() } : {}),
        },
        $push: { timeline: entry },
      }
      // remove undefined
      Object.keys(update.$set).forEach(k => update.$set[k] === undefined && delete update.$set[k])
      const res = await db.collection('bookings').findOneAndUpdate({ lrNumber: lr }, update, { returnDocument: 'after' })
      const val = res?.value || res
      if (!val) return json({ ok: false, error: 'Not found' }, 404)
      return json({ ok: true, booking: sanitize(val) })
    }

    // Enquiries
    if (route === '/enquiries' && method === 'POST') {
      const body = await request.json()
      const doc = { id: uuidv4(), ...body, createdAt: new Date() }
      await db.collection('enquiries').insertOne(doc)
      return json({ ok: true })
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
