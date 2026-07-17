import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: 'ASSAM GOODS CARRIER — Safe • Fast • Reliable',
  description: 'Premium logistics & transport across Assam and North-East India. Live tracking, booking, and delivery of goods with Assam Goods Carrier.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-900">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
