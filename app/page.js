'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Truck, Search, Phone, MessageCircle, MapPin, Shield, Clock, Package, Star, ChevronRight, Award, Zap, CheckCircle2, Building2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Logo, LogoMark } from '@/components/Logo'

const HERO_IMG = 'https://images.pexels.com/photos/28264496/pexels-photo-28264496.jpeg'
const FLEET_IMG = 'https://images.pexels.com/photos/37169749/pexels-photo-37169749.jpeg'

const PHONE = '8847428801'

function LogoLegacy({ size = 'md' }) { return null }

function Navbar() {
  return (
    <header className="absolute top-0 inset-x-0 z-30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between text-white">
        <Logo theme="dark"/>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#track" className="hover:text-agc-gold transition">Track</a>
          <a href="#services" className="hover:text-agc-gold transition">Services</a>
          <a href="#coverage" className="hover:text-agc-gold transition">Coverage</a>
          <a href="/customer" className="hover:text-agc-gold transition">Customer</a>
          <a href="/branch" className="hover:text-agc-gold transition">Branch</a>
          <a href="/driver" className="hover:text-agc-gold transition">Driver</a>
          <a href="/admin" className="hover:text-agc-gold transition">Admin</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href={`tel:${PHONE}`} className="hidden sm:inline-flex">
            <Button className="bg-agc-gold hover:brightness-110 text-[#0F3D91] font-bold"><Phone className="h-4 w-4 mr-2"/>{PHONE}</Button>
          </a>
        </div>
      </div>
    </header>
  )
}

function AnimatedTruck() {
  return (
    <div className="relative w-full h-24 mt-4">
      <div className="absolute bottom-0 inset-x-0 h-1 road-lines" />
      <div className="absolute bottom-2 left-0 animate-truck">
        <div className="flex items-end gap-1">
          <div className="relative">
            <div className="w-24 h-12 bg-agc-gold rounded-sm rounded-tr-2xl relative shadow-xl">
              <div className="absolute -top-6 right-1 w-10 h-6 bg-[#0F3D91] rounded-t-md">
                <div className="absolute inset-1 bg-sky-200/70 rounded-sm" />
              </div>
              <div className="absolute inset-1 border-2 border-[#0F3D91]/20 rounded-sm text-[8px] font-black text-[#0F3D91] grid place-items-center">AGC</div>
            </div>
            <div className="flex gap-6 -mt-2 ml-2">
              <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-400 animate-wheel" />
              <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-slate-400 animate-wheel" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const router = useRouter()
  const [lr, setLr] = useState('')
  const submit = (e) => { e.preventDefault(); if (lr.trim()) router.push(`/track/${encodeURIComponent(lr.trim())}`) }
  return (
    <section className="relative min-h-[92vh] w-full overflow-hidden">
      <img src={HERO_IMG} alt="Transport truck highway" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 hero-overlay" />
      <Navbar />
      <div className="relative container mx-auto px-4 pt-32 pb-16 text-white">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-agc-gold animate-pulse"/> India's Trusted North-East Logistics Partner
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-black leading-tight">
              Delivering <span className="text-agc-gold">Assam</span>.<br/>
              Powering <span className="text-agc-gold">Bharat</span>.
            </h1>
            <p className="mt-4 text-white/80 text-lg max-w-xl">
              Book, track and manage your consignments across Assam & North-East India with the country's most reliable goods carrier — <b>Safe • Fast • Reliable</b>.
            </p>
            <AnimatedTruck />
            <div className="flex flex-wrap gap-3 mt-4">
              <a href={`tel:${PHONE}`}><Button size="lg" className="bg-agc-gold hover:brightness-110 text-[#0F3D91] font-bold"><Phone className="h-4 w-4 mr-2"/>Call {PHONE}</Button></a>
              <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noreferrer"><Button size="lg" variant="outline" className="bg-emerald-500 border-emerald-500 hover:bg-emerald-600 text-white"><MessageCircle className="h-4 w-4 mr-2"/>WhatsApp</Button></a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
            <Card id="track" className="bg-white/95 backdrop-blur border-0 shadow-2xl shadow-black/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-[#0F3D91] font-bold"><Search className="h-5 w-5 text-agc-gold"/> Live Shipment Tracking</div>
                <p className="text-sm text-slate-500 mt-1">Enter your LR / Bilty number to see real-time status.</p>
                <form onSubmit={submit} className="mt-4 flex gap-2">
                  <Input value={lr} onChange={e=>setLr(e.target.value)} placeholder="e.g. AGC-250612-0001" className="h-12 text-base border-slate-300 focus-visible:ring-agc-gold"/>
                  <Button type="submit" className="h-12 px-6 bg-[#0F3D91] hover:bg-[#1E4FB8] text-white font-bold">Track <ChevronRight className="h-4 w-4 ml-1"/></Button>
                </form>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[{i:Shield,t:'Insured'},{i:Clock,t:'On-Time'},{i:Award,t:'Trusted'}].map(({i:Ic,t},k)=>(
                    <div key={k} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <Ic className="h-5 w-5 text-agc-gold mx-auto"/>
                      <div className="text-xs font-semibold text-slate-700 mt-1">{t}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <EnquiryCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function EnquiryCard() {
  const [form, setForm] = useState({ name:'', phone:'', from:'', to:'', message:'' })
  const [loading, setLoading] = useState(false)
  const set = (k,v)=>setForm(f=>({...f,[k]:v}))
  const submit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const r = await fetch('/api/enquiries', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
      if (!r.ok) throw new Error('failed')
      toast.success('Enquiry submitted. Our team will contact you shortly.')
      setForm({ name:'', phone:'', from:'', to:'', message:'' })
    } catch { toast.error('Something went wrong. Please try again.') }
    setLoading(false)
  }
  return (
    <Card className="mt-4 bg-white border border-slate-200">
      <CardContent className="p-5">
        <div className="font-bold flex items-center gap-2 text-[#0F3D91]"><Package className="h-4 w-4 text-agc-orange"/> Booking Enquiry</div>
        <form onSubmit={submit} className="mt-3 grid grid-cols-2 gap-2">
          <Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Your name"/>
          <Input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="Phone"/>
          <Input value={form.from} onChange={e=>set('from',e.target.value)} placeholder="From city"/>
          <Input value={form.to} onChange={e=>set('to',e.target.value)} placeholder="To city"/>
          <Input value={form.message} onChange={e=>set('message',e.target.value)} placeholder="What are you shipping?" className="col-span-2"/>
          <Button disabled={loading} className="col-span-2 bg-agc-orange text-white font-bold hover:brightness-110">{loading ? 'Sending...' : 'Get a Quote'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function Services() {
  const items = [
    { i: Truck, t: 'Full Truck Load', d: 'Dedicated trucks for large consignments across India.' },
    { i: Package, t: 'Part Load', d: 'Cost-effective shared truck service for smaller loads.' },
    { i: Zap, t: 'Express Delivery', d: 'Guaranteed on-time delivery for urgent shipments.' },
    { i: Shield, t: 'Insured Cargo', d: 'Complete insurance cover for high-value goods.' },
    { i: Building2, t: 'Warehousing', d: 'Modern warehouses across Assam & North-East.' },
    { i: MapPin, t: 'Door Delivery', d: 'Doorstep pickup and delivery pan-India.' },
  ]
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-xs font-bold tracking-[0.25em] text-agc-gold">OUR SERVICES</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-black text-[#0F3D91]">Complete Logistics Solutions</h2>
          <p className="mt-3 text-slate-600">From single parcel to full truck loads — end-to-end logistics designed for businesses of every size.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({i:Ic,t,d},k)=>(
            <motion.div key={k} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:k*0.05}}>
              <Card className="group border-slate-200 hover:border-agc-gold hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg gradient-navy grid place-items-center group-hover:gradient-gold transition-all">
                    <Ic className="h-5 w-5 text-white group-hover:text-[#0F3D91]"/>
                  </div>
                  <div className="mt-4 font-bold text-lg text-[#0F3D91]">{t}</div>
                  <div className="mt-1 text-sm text-slate-600">{d}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Coverage() {
  const cities = ['Guwahati','Dibrugarh','Silchar','Jorhat','Tezpur','Nagaon','Tinsukia','Bongaigaon','Barpeta','Karimganj','Golaghat','Sivasagar','Dhubri','Diphu','Kokrajhar','North Lakhimpur']
  return (
    <section id="coverage" className="py-20 gradient-navy text-white relative overflow-hidden">
      <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-agc-gold/10 blur-3xl"/>
      <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-agc-gold/10 blur-3xl"/>
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-xs font-bold tracking-[0.25em] text-agc-gold">ASSAM ROUTE COVERAGE</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-black">Every City. Every Route. Every Time.</h2>
            <p className="mt-3 text-white/80">We cover the entire state of Assam and connect it with all major metros of India through a dense network of branches, hubs and delivery partners.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[{n:'25+',l:'Branches'},{n:'500+',l:'Vehicles'},{n:'10K+',l:'Monthly Shipments'},{n:'99.2%',l:'On-Time Delivery'}].map((s,k)=>(
                <div key={k} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-3xl font-black text-agc-gold">{s.n}</div>
                  <div className="text-xs uppercase tracking-widest text-white/70 mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <img src={FLEET_IMG} className="rounded-2xl shadow-2xl shadow-black/40 border border-white/10"/>
            <div className="mt-4 flex flex-wrap gap-2">
              {cities.map(c=>(<span key={c} className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/90">{c}</span>))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Testimonials() {
  const items = [
    { n: 'Rajesh Sharma', c:'Sharma Traders, Guwahati', t:'Best transport service in Assam. Timely delivery every time and their tracking system is very accurate.' },
    { n: 'Meera Devi', c:'Meera Silk House, Sualkuchi', t:'I ship silk products across India using AGC. Their team handles fragile goods with utmost care.' },
    { n: 'Vikram Bora', c:'Bora Tea Estate, Dibrugarh', t:'For years we have trusted Assam Goods Carrier for our tea exports. Rates are fair, service is world-class.' },
  ]
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="text-xs font-bold tracking-[0.25em] text-agc-gold">TESTIMONIALS</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-black text-[#0F3D91]">Trusted by Businesses Across Assam</h2>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {items.map((t,k)=>(
            <Card key={k} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex gap-1 text-agc-gold">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current"/>)}</div>
                <p className="mt-3 text-slate-700 italic">“{t.t}”</p>
                <div className="mt-4">
                  <div className="font-bold text-[#0F3D91]">{t.n}</div>
                  <div className="text-xs text-slate-500">{t.c}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer id="contact" className="gradient-navy text-white">
      <div className="container mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <Logo size="lg" theme="dark"/>
          <p className="mt-4 text-sm text-white/70">India's most trusted goods carrier from the heart of Assam. Serving businesses and families since decades with unmatched reliability.</p>
        </div>
        <div>
          <div className="font-bold text-agc-gold">Contact</div>
          <div className="mt-3 text-sm text-white/80 space-y-2">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-agc-gold"/> {PHONE}</div>
            <div className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-agc-gold"/> WhatsApp Support 24×7</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-agc-gold"/> Head Office: Guwahati, Assam</div>
          </div>
        </div>
        <div>
          <div className="font-bold text-agc-gold">Quick Links</div>
          <div className="mt-3 text-sm text-white/80 space-y-2">
            <div><a href="#track" className="hover:text-agc-gold">Track Shipment</a></div>
            <div><a href="/customer" className="hover:text-agc-gold">Customer Portal</a></div>
            <div><a href="/branch" className="hover:text-agc-gold">Branch Login</a></div>
            <div><a href="/driver" className="hover:text-agc-gold">Driver App</a></div>
            <div><a href="/admin" className="hover:text-agc-gold">Admin Login</a></div>
          </div>
        </div>
        <div>
          <div className="font-bold text-agc-gold">Certifications</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['ISO 9001','GST Registered','MSME','IBA Approved'].map(x=>(
              <span key={x} className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">{x}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-xs text-white/60 flex justify-between">
          <div>© {new Date().getFullYear()} Assam Goods Carrier. All rights reserved.</div>
          <div>Safe • Fast • Reliable</div>
        </div>
      </div>
    </footer>
  )
}

function FloatingButtons() {
  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col gap-3">
      <a href={`https://wa.me/91${PHONE}`} target="_blank" rel="noreferrer" className="h-14 w-14 rounded-full bg-emerald-500 hover:bg-emerald-600 grid place-items-center shadow-2xl shadow-emerald-500/40 text-white">
        <MessageCircle className="h-6 w-6"/>
      </a>
      <a href={`tel:${PHONE}`} className="h-14 w-14 rounded-full bg-agc-gold grid place-items-center shadow-2xl shadow-amber-500/40 text-[#0F3D91]">
        <Phone className="h-6 w-6"/>
      </a>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Hero/>
      <Services/>
      <Coverage/>
      <Testimonials/>
      <Footer/>
      <FloatingButtons/>
    </div>
  )
}
