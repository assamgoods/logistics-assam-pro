import './globals.css'
import { Toaster } from 'sonner'

export const metadata = {
  title: {
    default: 'Assam Goods Carrier — Safe • Fast • Reliable',
    template: '%s • Assam Goods Carrier',
  },
  description: 'India’s premium logistics & transport network from the heart of Assam. Live shipment tracking, booking, printable LR / Bilty, branch-to-branch transfers and enterprise-grade Transport Management System.',
  applicationName: 'Assam Goods Carrier TMS',
  keywords: ['transport','logistics','Assam','goods carrier','shipment tracking','LR','Bilty','TMS'],
  authors: [{ name: 'Assam Goods Carrier' }],
  themeColor: '#0F3D91',
  openGraph: {
    title: 'Assam Goods Carrier',
    description: 'Safe • Fast • Reliable — India’s trusted North-East logistics partner.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
