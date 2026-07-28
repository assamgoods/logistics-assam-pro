import { Resend } from 'resend'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongo'
import { v4 as uuidv4 } from 'uuid'
import { sendNotification } from '@/lib/notify'
import { getSession, createSession, logActivity } from '@/lib/authz'

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
  branch:    ['booking.create','booking.read','booking.status','pod.upload','rate.read'],
  driver:    ['booking.read.own','pod.upload','booking.status.limited'],
  customer: ['booking.read.own','pod.download'],
}

function sanitize(doc) { if (!doc) return doc; const { _id, ...rest } = doc; return rest }

export async function GET(request, ctx) { return handle(request, ctx) }
export async function POST(request, ctx) { return handle(request, ctx) }
export async function PUT(request, ctx) { return handle(request, ctx) }
export async function DELETE(request, ctx) { return handle(request, ctx) }

async function handle(request, ctx) {
  const method = request.method
  const p = await ctx.params
  const parts = (p?.path) || []
  const route = '/' + parts.join('/')
  const url = new URL(request.url)

  // -------- FAST-TRACK PINCODE LOOKUP --------
  const isPincodeRoute = parts.includes('pincode') || parts.includes('pincodes') || route.includes('/pincode')
  if (isPincodeRoute && method === 'GET') {
    const pinIndex = parts.findIndex(p => p === 'pincode' || p === 'pincodes')
    const codeFromParts = pinIndex !== -1 ? parts[pinIndex + 1] : null
    const code = (codeFromParts || url.searchParams.get('code') || url.searchParams.get('pincode') || '').trim()

    if (!code || code.length < 6) {
      return json({ ok: false, success: false, error: 'Valid 6-digit PIN code required' }, 400)
    }

    let district = ''
    let city = ''
    let state = ''
    let officeName = ''
    let found = false

    try {
      const db = await getDb()
      const numericCode = Number(code)

      const pinDoc = await db.collection('pincodes').findOne({
        $or: [
          { pincode: code },
          { pincode: String(code) },
          ...(isNaN(numericCode) ? [] : [{ pincode: numericCode }])
        ]
      })

      if (pinDoc) {
        district = pinDoc.Districtname || pinDoc.district || pinDoc.District || pinDoc.city || ''
        city = pinDoc.Districtname || pinDoc.district || pinDoc.District || pinDoc.city || ''
        state = pinDoc.statename || pinDoc.state || pinDoc.State || ''
        officeName = pinDoc.officename || pinDoc.officeName || ''
        found = true
      }
    } catch (dbErr) {
      console.error("Pincode DB fetch failed, falling back to API:", dbErr)
    }

    if (!found) {
      try {
        const postRes = await fetch(`https://api.postalpincode.in/pincode/${code}`)
        const postData = await postRes.json()

        if (postData && postData[0]?.Status === 'Success' && postData[0]?.PostOffice?.length > 0) {
          const po = postData[0].PostOffice[0]
          district = po.District || po.Block || ''
          city = po.District || po.Block || ''
          state = po.State || ''
          officeName = po.Name || ''
          found = true
        }
      } catch (apiErr) {
        console.error("Postal API Failed:", apiErr)
      }
    }

    if (found) {
      const payload = {
        ok: true,
        success: true,
        pincode: code,
        pinCode: code,
        district,
        city,
        state,
        officeName,
        data: { pincode: code, district, city, state, officeName }
      }
      return json(payload, 200)
    }

    return json({ ok: false, success: false, error: 'Invalid PIN Code' }, 404)
  }

  try {
    const db = await getDb()

    if (route === '/' || route === '/health') return json({ ok: true, service: 'assam-goods-carrier', time: new Date().toISOString() })

    // -------- ADMIN BILLING (GET & POST) --------
    if (route === '/admin/billing') {
      if (method === 'GET') {
        try {
          const invoicesCollection = db.collection('invoices')
          const invoices = await invoicesCollection.find({}).sort({ createdAt: -1 }).toArray()
          return json({ ok: true, invoices: invoices.map(sanitize) })
        } catch (error) {
          console.error('Error handling /admin/billing GET:', error)
          return json({ ok: false, error: error.message || 'Internal Server Error' }, 500)
        }
      }

      if (method === 'POST') {
        try {
          const body = await request.json().catch(() => ({}))
          const { lrNumber, amount } = body

          if (!lrNumber || amount === undefined) {
            return json({ ok: false, error: 'lrNumber and amount are required' }, 400)
          }

          const invoicesCollection = db.collection('invoices')

          // 1. Check if an invoice already exists for the same lrNumber
          const existingInvoice = await invoicesCollection.findOne({ lrNumber })
          if (existingInvoice) {
            return json({ ok: true, invoice: sanitize(existingInvoice) }, 200)
          }

          // Find booking using lrNumber
          const bookingsCollection = db.collection('bookings')
          const booking = await bookingsCollection.findOne({ lrNumber })

          if (!booking) {
            return json({ ok: false, error: 'Booking not found with the provided lrNumber' }, 404)
          }

          // Generate a unique invoice number
          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
          let isUnique = false
          let invoiceNumber = ''

          while (!isUnique) {
            const randomSuffix = Math.floor(1000 + Math.random() * 9000)
            invoiceNumber = `INV-${dateStr}-${randomSuffix}`
            const existing = await invoicesCollection.findOne({ invoiceNumber })
            if (!existing) {
              isUnique = true
            }
          }

          // 2. Construct invoice document with all important booking information
          const invoice = {
            id: uuidv4(),
            invoiceNumber,
            lrNumber,
            origin: booking.origin || '',
            destination: booking.destination || '',
            sender: booking.sender || {},
            receiver: booking.receiver || {},
            packages: booking.packages || 0,
            chargeableWeight: booking.chargeableWeight || 0,
            paymentMode: booking.paymentMode || 'CASH',
            paymentStatus: booking.paymentStatus || 'PENDING',
            freight: booking.freightRate || booking.freight || amount,
            gst: booking.gst || 0,
            totalAmount: amount,
            createdAt: new Date()
          }

          // Insert invoice into invoices collection
          const result = await invoicesCollection.insertOne(invoice)
          invoice._id = result.insertedId

          return json({ ok: true, invoice: sanitize(invoice) }, 201)

        } catch (error) {
          console.error('Error handling /admin/billing POST:', error)
          return json({ ok: false, error: error.message || 'Internal Server Error' }, 500)
        }
      }
    }

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

    // -------- CUSTOMERS SEARCH & AUTOFILL ---------
    if (route === '/customers' && method === 'GET') {
      const q = (url.searchParams.get('q') || url.searchParams.get('phone') || '').trim()

      if (!q) return json({ items: [], customer: null })

      const items = await db.collection('customers')
        .find({
          $or: [
            { phone: q },
            { name: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } }
          ]
        })
        .limit(10)
        .toArray()

      const exactCustomer = items.find(c => c.phone === q) || items[0] || null

      return json({ 
        ok: true,
        items: items.map(sanitize), 
        customer: exactCustomer ? sanitize(exactCustomer) : null 
      })
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

      // AUTO-SAVE Sender Customer for next time
      if (doc.sender.phone) {
        await db.collection("customers").updateOne(
          { phone: doc.sender.phone },
          {
            $set: { 
              type: "sender", 
              name: doc.sender.name, 
              phone: doc.sender.phone, 
              address: doc.sender.address, 
              gst: doc.sender.gst, 
              updatedAt: new Date() 
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
      }

      // AUTO-SAVE Receiver Customer for next time
      if (doc.receiver.phone) {
        await db.collection("customers").updateOne(
          { phone: doc.receiver.phone },
          {
            $set: { 
              type: "receiver", 
              name: doc.receiver.name, 
              phone: doc.receiver.phone, 
              address: doc.receiver.address, 
              gst: doc.receiver.gst, 
              updatedAt: new Date() 
            },
            $setOnInsert: { createdAt: new Date() },
          },
          { upsert: true }
        );
      }

      await logActivity(db, { actor: s?.userId || 'admin-root', role: s?.role || 'admin', action: 'BOOKING_CREATED', target: lrNumber })
      
      // Safe notification wrapper (so bad auth won't crash the booking)
      try {
        await sendNotification({ event: 'BOOKING_CREATED', booking: doc })
      } catch (nErr) {
        console.error("Notification Warning (Ignored):", nErr)
      }

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
      
      const notifyEvt = NOTIFY_EVENTS[stage.key]; 
      if (notifyEvt) {
        try {
          await sendNotification({ event: notifyEvt, booking: val })
        } catch (nErr) {
          console.error("Notification Warning (Ignored):", nErr)
        }
      }

      return json({ ok: true, booking: sanitize(val) })
    }
    if (parts[0] === 'bookings' && parts.length === 2 && method === 'PUT') {

  const id = parts[1]
  const body = await request.json()

  const result = await db.collection('bookings').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...body,
        updatedAt: new Date()
      }
    }
  )

  if(result.matchedCount === 0){
    return json({
      ok:false,
      error:'Booking not found'
    },404)
  }

  return json({
    ok:true,
    message:'Booking Updated Successfully'
  })
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
      
      try {
        await sendNotification({ event: 'DELIVERED', booking: val })
      } catch (nErr) {
        console.error("Notification Warning (Ignored):", nErr)
      }

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
          bankName: '', bankAccount: '', bankIfsc: '', bankBranch: '', logoUrl: '',
          lrPrefix: 'AGC', transferPrefix: 'TXF', gstPercent: 18, sessionTimeoutMinutes: 60, theme: 'light', updatedAt: new Date(),
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
        const hashed = await bcrypt.hash(newPassword, 10)
        await db.collection('settings').updateOne({ _id: 'company' }, { $set: { adminPasswordHash: hashed, adminPasswordChangedAt: new Date() } }, { upsert: true })
      }
      await logActivity(db, { actor: s.userId, role: s.role, action: 'PASSWORD_CHANGED', target: s.userId })
      return json({ ok:true })
    }

    // -------- FORGOT / RESET PASSWORD ---------
    if (route === '/auth/forgot-password' && method === 'POST') {
      const { email } = await request.json()
      if (!email) return json({ ok:false, error:'Email is required' }, 400)
      const since = new Date(Date.now() - 15*60*1000)
      const recent = await db.collection('otp_tokens').countDocuments({ email, createdAt: { $gte: since } })
      if (recent >= 3) return json({ ok:false, error:'Too many reset requests. Please try again in 15 minutes.' }, 429)

      const user = await db.collection('users').findOne({ email })
      const settings = await db.collection('settings').findOne({ _id: 'company' })
      const isAdmin = settings?.email === email || process.env.SMTP_USER === email
      if (!user && !isAdmin) {
        return json({ ok: true, message: 'If the email is registered, an OTP has been sent.' })
      }
      const otp = String(Math.floor(100000 + Math.random()*900000))
      const bcrypt = (await import('bcryptjs')).default
      const otpHash = await bcrypt.hash(otp, 10)
      const resetToken = uuidv4()
      const expiresAt = new Date(Date.now() + 15*60*1000)
      const doc = { id: uuidv4(), email, otpHash, resetToken, userId: user?.id || 'admin-root', role: user?.role || (isAdmin ? 'admin' : 'user'), used: false, expiresAt, createdAt: new Date() }
      await db.collection('otp_tokens').insertOne(doc)
      
      let mailed = false
      try {
        const resendInstance = new Resend(process.env.RESEND_API_KEY)
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/reset-password?token=${resetToken}`
        await resendInstance.emails.send({
          from: "Assam Goods Carrier <onboarding@resend.dev>",
          to: email,
          subject: `${settings?.companyName || 'AGC'} — Password Reset OTP`,
          html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #E5E7EB;border-radius:12px">
              <div style="font-size:22px;font-weight:900;color:#0F3D91">${settings?.companyName || 'ASSAM GOODS CARRIER'}</div>
              <div style="color:#F97316;font-size:11px;letter-spacing:3px;font-weight:700">SAFE • FAST • RELIABLE</div>
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
      } catch (e) {
        console.error("Resend send failed:", e);
      }

      await logActivity(db, { actor: user?.id || 'system', role: user?.role || 'anon', action: 'PASSWORD_RESET_REQUESTED', target: email, meta: { mailed, mock_otp: mailed ? undefined : otp } })
      return json({ ok:true, message: mailed ? 'OTP sent to your email.' : 'OTP generated (Email delivery failed — check Activity Log for OTP).', mailed })
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
      await db.collection('otp_tokens').updateMany({ email: tokenDoc.email, used: false, id: { $ne: tokenDoc.id } }, { $set: { used: true } })
      await logActivity(db, { actor: tokenDoc.userId, role: tokenDoc.role, action: 'PASSWORD_RESET_COMPLETED', target: tokenDoc.email })
      return json({ ok:true })
    }
  } catch (err) {
    console.error('API Error:', err)
    return json({ ok: false, error: err.message || 'Internal Server Error' }, 500)
  }

  return json({ ok: false, error: 'Not Found' }, 404)
}