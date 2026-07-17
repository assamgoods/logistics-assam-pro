// Notification sender - MOCKED by default. If TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_WHATSAPP_FROM are configured in .env, it will call the real Twilio API.
import { getDb } from '@/lib/mongo'
import { v4 as uuidv4 } from 'uuid'

const TEMPLATES = {
  BOOKING_CREATED: (b) => `📦 *Assam Goods Carrier*\nBooking Confirmed!\nLR: ${b.lrNumber}\nFrom: ${b.origin} ➔ ${b.destination}\nTotal: ₹${b.totalAmount}\nTrack: ${process.env.NEXT_PUBLIC_BASE_URL}/track/${b.lrNumber}`,
  DISPATCHED: (b) => `🚚 Your shipment ${b.lrNumber} has been dispatched from ${b.currentLocation || b.origin}. ETA ${b.eta || 'soon'}. Track: ${process.env.NEXT_PUBLIC_BASE_URL}/track/${b.lrNumber}`,
  OUT_FOR_DELIVERY: (b) => `🛣️ Out for delivery! Shipment ${b.lrNumber} will be delivered today at ${b.receiver?.address || 'destination'}. — AGC`,
  DELIVERED: (b) => `✅ Delivered! Your shipment ${b.lrNumber} has been delivered successfully. Thank you for choosing Assam Goods Carrier.`,
}

export async function sendNotification({ event, booking, channels = ['SMS', 'WHATSAPP'] }) {
  const template = TEMPLATES[event]
  if (!template) return { ok: false, error: 'unknown event' }
  const msg = template(booking)
  const db = await getDb()
  const results = []
  for (const ch of channels) {
    const phone = booking.receiver?.phone || booking.sender?.phone
    if (!phone) continue
    const doc = {
      id: uuidv4(), lrNumber: booking.lrNumber, event, channel: ch, phone, message: msg,
      status: 'SENT_MOCK', createdAt: new Date(),
    }
    // If real Twilio configured, we'd invoke here. Currently MOCKED.
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && ch === 'WHATSAPP') {
      try {
        const from = process.env.TWILIO_WHATSAPP_FROM
        const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`
        const params = new URLSearchParams({ From: `whatsapp:${from}`, To: `whatsapp:+91${phone}`, Body: msg })
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
        const r = await fetch(url, { method:'POST', headers:{ Authorization:`Basic ${auth}`, 'Content-Type':'application/x-www-form-urlencoded' }, body: params })
        doc.status = r.ok ? 'SENT' : 'FAILED'
      } catch (e) { doc.status = 'FAILED'; doc.error = e.message }
    }
    await db.collection('notifications').insertOne(doc)
    results.push(doc)
  }
  return { ok: true, count: results.length }
}
