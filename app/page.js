'use client'
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter
} from "react-icons/fa6";

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import {
Truck,
Phone,
Search,
MessageCircle,
MapPin,
Shield,
Clock,
Award,
Package,
Star,
ChevronRight,
TruckIcon,
Building2,
Menu,
X,
CheckCircle2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card,CardContent } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'

const PHONE="8847428801"

const HERO_IMG="/images/hero-truck.png"

const FLEET_IMG="/images/fleet.png"

function Navbar(){

const [open,setOpen]=useState(false)

return(

<header className="fixed top-0 inset-x-0 z-50 bg-[#0F3D91]/90 backdrop-blur-xl border-b border-white/10">

<div className="container mx-auto px-4 h-20 flex items-center justify-between">

<Logo theme="dark"/>

<nav className="hidden lg:flex items-center gap-8 text-white font-semibold">

<a href="#track" className="hover:text-agc-gold">Track</a>

<a href="#services" className="hover:text-agc-gold">Services</a>

<a href="#coverage" className="hover:text-agc-gold">Coverage</a>

<a href="#contact" className="hover:text-agc-gold">Contact</a>

</nav>

<div className="hidden lg:flex items-center gap-3">

<a href="/customer">

<Button variant="ghost" className="text-white">

Customer

</Button>

</a>

<a href="/branch">

<Button variant="ghost" className="text-white">

Branch

</Button>

</a>

<a href="/driver">

<Button variant="ghost" className="text-white">

Driver

</Button>

</a>

<a href="/admin">

<Button variant="ghost" className="text-white">

Admin

</Button>

</a>

<a href={`tel:${PHONE}`}>

<Button className="rounded-full bg-agc-gold text-[#0F3D91] font-black px-6">

<Phone className="mr-2 h-4 w-4"/>

{PHONE}

</Button>

</a>

</div>

<button

className="lg:hidden text-white"

onClick={()=>setOpen(!open)}

>

{open ?

<X className="h-7 w-7"/>

:

<Menu className="h-7 w-7"/>

}

</button>

</div>

{open&&(

<div className="lg:hidden bg-[#0F3D91] border-t border-white/10">

<div className="flex flex-col p-5 gap-5 text-white">

<a href="#track">Track</a>

<a href="#services">Services</a>

<a href="#coverage">Coverage</a>

<a href="/customer">Customer</a>

<a href="/branch">Branch</a>

<a href="/driver">Driver</a>

<a href="/admin">Admin</a>

</div>

</div>

)}

</header>

)

}
function Hero() {

const router=useRouter()

const [lr,setLr]=useState("")

const submit=(e)=>{

e.preventDefault()

if(!lr.trim()) return

router.push(`/track/${encodeURIComponent(lr.trim())}`)

}

return(

<section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#071D49] via-[#0F3D91] to-[#03112D]">

<img

src={HERO_IMG}

className="absolute inset-0 w-full h-full object-cover"

alt="AGC"

/>

<div className="absolute inset-0 bg-[#071D49]/75"/>

<div className="absolute inset-0 bg-gradient-to-r from-[#071D49] via-[#071D49]/80 to-transparent"/>

<div className="absolute -left-32 top-0 w-[500px] h-[500px] rounded-full bg-agc-gold/10 blur-[140px]"/>

<div className="absolute right-0 bottom-0 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[140px]"/>

<Navbar/>

<div className="relative container mx-auto px-4 pt-40 pb-32">

<div className="grid lg:grid-cols-2 gap-16 items-center">

<motion.div

initial={{opacity:0,x:-60}}

animate={{opacity:1,x:0}}

transition={{duration:.8}}

>

<div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">

<span className="h-2 w-2 rounded-full bg-agc-gold animate-pulse"/>

<span className="text-white text-sm font-semibold">

North-East India's Premium Logistics Network

</span>

</div>

<h1 className="mt-8 text-6xl lg:text-[110px] font-black leading-[1.05] text-white">

Experience

<br/>

<span className="text-agc-gold">

Logistics

</span>

<br/>

Without Limits

</h1>

<p className="mt-8 max-w-2xl text-lg leading-9 text-white/80">

Assam Goods Carrier connects Chandigarh,
Punjab, Delhi and North India directly with
Assam & the complete North-East through
our dedicated transportation network.

</p>

<div className="grid grid-cols-3 gap-8 mt-10 max-w-lg">

<div>

<h2 className="text-5xl font-black text-agc-gold">

25+

</h2>

<p className="mt-2 text-white/60">

Branches

</p>

</div>

<div>

<h2 className="text-5xl font-black text-agc-gold">

500+

</h2>

<p className="mt-2 text-white/60">

Fleet

</p>

</div>

<div>

<h2 className="text-5xl font-black text-agc-gold">

10000+

</h2>

<p className="mt-2 text-white/60">

Shipments

</p>

</div>

</div>

<div className="flex flex-wrap gap-5 mt-12">

<a href={`tel:${PHONE}`}>

<Button

size="lg"

className="rounded-full bg-agc-gold text-[#0F3D91] px-10 h-14 font-black"

>

<Phone className="mr-2 h-5 w-5"/>

Call Now

</Button>

</a>

<a

href={`https://wa.me/91${PHONE}`}

target="_blank"

rel="noreferrer"

>

<Button

size="lg"

variant="outline"

className="rounded-full border-white/30 bg-[#173873]/95 text-white h-14 px-10"

>

<MessageCircle className="mr-2 h-5 w-5"/>

WhatsApp

</Button>

</a>

</div>

</motion.div>
<motion.div

initial={{opacity:0,x:60}}

animate={{opacity:1,x:0}}

transition={{duration:.8,delay:.2}}

className="relative"

>

<div className="absolute -left-0 top-10 hidden xl:block">

<div className="bg-white rounded-3xl shadow-2xl p-5 w-52">

<p className="text-xs text-slate-500">

Today's Deliveries

</p>

<h2 className="text-4xl font-black text-[#0F3D91]">

286

</h2>

<p className="text-green-600 font-bold">

+18%

</p>

</div>

</div>

<Card

id="track"

className="rounded-[35px] border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,.45)]"

>

<CardContent className="p-10">

<div className="flex items-center gap-3 text-agc-gold font-bold uppercase tracking-[3px]">

<Search className="h-5 w-5"/>

Live Tracking

</div>

<h2 className="mt-4 text-3xl font-black text-white">

Track Your Shipment

</h2>

<p className="mt-3 text-white/70">

Enter your LR / Bilty number below.

</p>

<form

onSubmit={submit}

className="mt-8 space-y-4"

>

<Input

value={lr}

onChange={(e)=>setLr(e.target.value)}

placeholder="AGC-250612-0001"

className="h-14 rounded-2xl bg-white/10 border-white/20 text-white placeholder:text-white/40"

/>

<Button

type="submit"

className="w-full h-14 rounded-2xl bg-agc-gold text-[#0F3D91] font-black"

>

Track Shipment

<ChevronRight className="ml-2 h-5 w-5"/>

</Button>

</form>

<div className="grid grid-cols-3 gap-4 mt-8">

{[
{
icon:Shield,
title:"Safe"
},
{
icon:Clock,
title:"On Time"
},
{
icon:Award,
title:"Trusted"
}
].map((item,index)=>{

const Icon=item.icon

return(

<div

key={index}

className="rounded-2xl bg-white/10 border border-white/10 p-4 text-center"

>

<Icon className="mx-auto h-6 w-6 text-agc-gold"/>

<p className="mt-2 text-sm text-white">

{item.title}

</p>

</div>

)

})}

</div>

</CardContent>

</Card>

<div className="absolute -right-5 bottom-10 hidden xl:block">

<div className="bg-white rounded-3xl shadow-2xl p-5 w-56">

<p className="text-xs text-slate-500">

Fleet Status

</p>

<h2 className="text-2xl font-black text-[#0F3D91]">

498 Active Trucks

</h2>

<p className="mt-2 text-slate-500">

GPS Enabled Fleet

</p>

</div>

</div>

</motion.div>

</div>

</div>

<div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">

<svg
viewBox="0 0 1440 120"
className="w-full h-24"
preserveAspectRatio="none"
>

<path
fill="#ffffff"
d="M0,96L80,90C160,84,320,72,480,68C640,64,800,64,960,74C1120,84,1280,106,1360,116L1440,128L1440,160L0,160Z"
/>

</svg>

</div>

</section>

)

}
// ==========================================
// PART 3A
// Floating Stats + Partner Slider
// ==========================================

function FloatingStats(){

const stats=[

{number:"25+",label:"Branches"},
{number:"500+",label:"Vehicles"},
{number:"10K+",label:"Monthly Shipments"},
{number:"99.8%",label:"Success Rate"}

]

return(

<section className="relative -mt-14 z-30">

<div className="container mx-auto px-4">

<div className="rounded-[35px] bg-white shadow-[0_25px_70px_rgba(0,0,0,.12)] overflow-hidden">

<div className="grid md:grid-cols-4">

{stats.map((item,index)=>(

<div

key={index}

className="text-center p-10 border-r last:border-r-0 border-slate-200"

>

<h2 className="text-5xl font-black text-[#0F3D91]">

{item.number}

</h2>

<p className="mt-3 uppercase tracking-[4px] text-xs text-slate-500">

{item.label}

</p>

</div>

))}

</div>

</div>

</div>

</section>

)

}

function Partners(){

const partners=[

"ASHOK LEYLAND",

"TATA MOTORS",

"EICHER",

"BHARAT BENZ",

"MAHINDRA",

"AGC",

"LOGISTICS",

"TRANSPORT"

]

return(

<section className="py-20 bg-white">

<div className="container mx-auto px-4">

<p className="text-center uppercase tracking-[6px] text-slate-400 font-bold">

Trusted Transport Network

</p>

<div className="overflow-hidden mt-12">

<motion.div

className="flex gap-8"

animate={{x:["0%","-50%"]}}

transition={{

repeat:Infinity,

duration:22,

ease:"linear"

}}

>

{[...partners,...partners].map((item,index)=>(

<div

key={index}

className="min-w-[220px] h-24 rounded-3xl border border-slate-200 bg-slate-50 flex items-center justify-center text-[#0F3D91] text-xl font-black"

>

{item}

</div>

))}

</motion.div>

</div>

</div>

</section>

)
}
// ==========================================
// PART 3B
// Premium North-East Showcase
// ==========================================

const northeastStates=[

{
name:"Assam",
city:"Guwahati",
image:"/images/assam.png",
desc:"Gateway to North-East India with the largest logistics hub and daily transport operations."
},

{
name:"Meghalaya",
city:"Shillong",
image:"/images/meghalaya.png",
desc:"Fast cargo movement through hill routes with secure commercial deliveries."
},

{
name:"Arunachal Pradesh",
city:"Itanagar",
image:"/images/arunachal.png",
desc:"Reliable transportation to remote regions using dedicated fleet operations."
},

{
name:"Nagaland",
city:"Dimapur",
image:"/images/nagaland.png",
desc:"Efficient interstate cargo movement connecting industries and businesses."
}

]

function NorthEastSection(){

return(

<section className="py-28 bg-slate-50">

<div className="container mx-auto px-4">

<div className="text-center">

<p className="uppercase tracking-[5px] font-bold text-agc-gold">

North-East Network

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

Connecting Every Corner

</h2>

<p className="mt-5 max-w-3xl mx-auto text-slate-600 leading-8">

Strong logistics infrastructure across the complete
North-East with dedicated routes, modern fleet
and professional cargo handling.

</p>

</div>

<div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-20">

{northeastStates.map((state,index)=>(

<motion.div

key={index}

initial={{opacity:0,y:40}}

whileInView={{opacity:1,y:0}}

viewport={{once:true}}

transition={{delay:index*.1}}

>

<div className="group rounded-[35px] overflow-hidden bg-white shadow-xl hover:shadow-2xl duration-500">

<div className="relative overflow-hidden">

<img

src={state.image}

alt={state.name}

className="w-full h-80 object-cover duration-700 group-hover:scale-110"

/>

<div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"/>

<div className="absolute bottom-6 left-6">

<p className="text-agc-gold uppercase tracking-[3px] text-xs">

{state.city}

</p>

<h3 className="text-white text-3xl font-black mt-2">

{state.name}

</h3>

</div>

</div>

<div className="p-7">

<p className="text-slate-600 leading-7">

{state.desc}

</p>

<Button

className="mt-6 rounded-full bg-[#0F3D91] hover:bg-[#1949aa] text-white"

>

Explore Network

<ChevronRight className="ml-2 h-4 w-4"/>

</Button>

</div>

</div>

</motion.div>

))}

</div>

</div>

</section>

)

}
// ==========================================
// PART 4A
// Premium Services Section
// ==========================================

function Services(){

const services=[

{
icon:Truck,
title:"Full Truck Load",
desc:"Dedicated trucks for high-volume cargo with faster transit and secure transportation."
},

{
icon:Package,
title:"Part Load Service",
desc:"Affordable shared-load transportation for small and medium businesses."
},

{
icon:Clock,
title:"Express Delivery",
desc:"Time-critical shipments delivered through priority transport routes."
},

{
icon:Shield,
title:"Safe & Insured Cargo",
desc:"Every shipment is handled professionally with maximum cargo safety."
},

{
icon:Building2,
title:"Warehousing",
desc:"Modern storage facilities for commercial inventory and distribution."
},

{
icon:MapPin,
title:"Door Pickup & Delivery",
desc:"Complete pickup and doorstep delivery across Assam and North-East."

}

]

return(

<section
id="services"
className="py-28 bg-white"
>

<div className="container mx-auto px-4">

<div className="text-center max-w-3xl mx-auto">

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Our Services

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

Complete Logistics Solutions

</h2>

<p className="mt-6 text-slate-600 leading-8">

Reliable transportation solutions designed for
manufacturers, traders, industries and businesses
across India.

</p>

</div>

<div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mt-20">

{services.map((item,index)=>{

const Icon=item.icon

return(

<motion.div

key={index}

initial={{opacity:0,y:40}}

whileInView={{opacity:1,y:0}}

viewport={{once:true}}

transition={{delay:index*.08}}

whileHover={{y:-10}}

>

<Card className="h-full rounded-[35px] border-0 shadow-xl hover:shadow-2xl duration-500">

<CardContent className="p-10">

<div className="h-20 w-20 rounded-3xl bg-[#0F3D91] flex items-center justify-center">

<Icon className="h-9 w-9 text-agc-gold"/>

</div>

<h3 className="mt-8 text-2xl font-black text-[#0F3D91]">

{item.title}

</h3>

<p className="mt-5 text-slate-600 leading-8">

{item.desc}

</p>

<Button

variant="ghost"

className="mt-8 p-0 font-black text-[#0F3D91]"

>

Learn More

<ChevronRight className="ml-2 h-4 w-4"/>

</Button>

</CardContent>

</Card>

</motion.div>

)

})}

</div>

</div>

</section>

)

}
// ==========================================
// PART 4B
// Premium Coverage + Fleet Section
// ==========================================

function Coverage(){

const cities=[

"Guwahati",
"Silchar",
"Dibrugarh",
"Jorhat",
"Nagaon",
"Tinsukia",
"Shillong",
"Dimapur",
"Itanagar",
"Agartala",
"Aizawl",
"Imphal"

]

return(

<section
id="coverage"
className="py-28 bg-[#0F3D91] text-white overflow-hidden relative"
>

<div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-agc-gold/10 blur-[140px]"/>

<div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-[140px]"/>

<div className="container mx-auto px-4 relative">

<div className="grid lg:grid-cols-2 gap-20 items-center">

<div>

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Coverage

</p>

<h2 className="mt-4 text-5xl font-black">

North-East Connected

</h2>

<p className="mt-6 text-white/75 leading-8">

Daily transport services connecting Punjab,
Haryana, Chandigarh, Delhi and North India
to Assam and every major North-East state.

</p>

<div className="grid grid-cols-2 gap-6 mt-10">

<div className="rounded-3xl bg-white/10 p-6">

<h3 className="text-5xl font-black text-agc-gold">

25+

</h3>

<p className="mt-2">

Branches

</p>

</div>

<div className="rounded-3xl bg-white/10 p-6">

<h3 className="text-5xl font-black text-agc-gold">

500+

</h3>

<p className="mt-2">

Fleet

</p>

</div>

<div className="rounded-3xl bg-white/10 p-6">

<h3 className="text-5xl font-black text-agc-gold">

10K+

</h3>

<p className="mt-2">

Monthly Shipments

</p>

</div>

<div className="rounded-3xl bg-white/10 p-6">

<h3 className="text-5xl font-black text-agc-gold">

99.8%

</h3>

<p className="mt-2">

On-Time

</p>

</div>

</div>

</div>

<div>

<img

src={FLEET_IMG}

alt="Fleet"

className="rounded-[40px] h-[500px] w-full object-cover shadow-2xl"

/>

<div className="flex flex-wrap gap-3 mt-8">

{cities.map((city,index)=>(

<div

key={index}

className="px-4 py-2 rounded-full bg-white/10 border border-white/10"

>

{city}

</div>

))}

</div>

</div>

</div>

</div>

</section>

)

}

function FleetSection(){

return(

<section className="py-28 bg-slate-50">

<div className="container mx-auto px-4">

<div className="grid lg:grid-cols-2 gap-20 items-center">

<div>

<img

src={FLEET_IMG}

alt="Fleet"

className="rounded-[40px] w-full h-[620px] object-cover shadow-2xl"

/>

</div>

<div>

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Modern Fleet

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

Built For Heavy Logistics

</h2>

<p className="mt-6 text-slate-600 leading-8">

Modern GPS-enabled fleet designed for
safe, reliable and on-time transportation
across India.

</p>

<div className="space-y-6 mt-10">

{[
"GPS Enabled Vehicles",
"Dedicated Long Route Fleet",
"Professional Drivers",
"24×7 Fleet Monitoring",
"Fast Transit Time",
"Secure Cargo Handling"
].map((item,index)=>(

<div

key={index}

className="flex items-center gap-4"

>

<div className="h-12 w-12 rounded-full bg-[#0F3D91] flex items-center justify-center">

<CheckCircle2 className="h-6 w-6 text-agc-gold"/>

</div>

<h3 className="text-xl font-bold text-[#0F3D91]">

{item}

</h3>

</div>

))}

</div>

</div>

</div>

</div>

</section>

)

}
// ==========================================
// PART 5A
// Route Timeline + Why Choose AGC
// ==========================================

function RouteTimeline(){

const route=[

"Chandigarh",
"Delhi",
"Lucknow",
"Patna",
"Siliguri",
"Guwahati"

]

return(

<section className="py-28 bg-white">

<div className="container mx-auto px-4">

<div className="text-center">

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Daily Transport Route

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

North India ➜ North-East

</h2>

<p className="mt-6 text-slate-600 max-w-3xl mx-auto leading-8">

Daily scheduled transportation connecting Punjab,
Haryana, Chandigarh and Delhi directly with Assam
through our dedicated logistics corridor.

</p>

</div>

<div className="mt-20 relative">

<div className="absolute left-0 right-0 top-6 h-1 bg-slate-300 rounded-full"/>

<motion.div

className="absolute left-0 top-6 h-1 bg-agc-gold rounded-full"

initial={{width:"0%"}}

whileInView={{width:"100%"}}

viewport={{once:true}}

transition={{duration:2}}

></motion.div>

<div className="grid grid-cols-6 relative">

{route.map((city,index)=>(

<div
key={index}
className="text-center"
>

<div className="mx-auto h-12 w-12 rounded-full bg-[#0F3D91] border-4 border-agc-gold"/>

<h3 className="mt-5 font-black text-[#0F3D91]">

{city}

</h3>

</div>

))}

</div>

</div>

</div>

</section>

)

}

function WhyChooseAGC(){

const points=[

{
icon:Shield,
title:"100% Safe Cargo",
desc:"Professional cargo handling with maximum security."
},

{
icon:Clock,
title:"On Time Delivery",
desc:"Fast transportation through scheduled routes."
},

{
icon:Truck,
title:"Modern Fleet",
desc:"GPS-enabled vehicles with dedicated operations."
},

{
icon:Phone,
title:"24×7 Support",
desc:"Dedicated customer support for every shipment."
}

]

return(

<section className="py-28 bg-slate-50">

<div className="container mx-auto px-4">

<div className="text-center">

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Why Choose AGC

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

Experience Better Logistics

</h2>

</div>

<div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mt-20">

{points.map((item,index)=>{

const Icon=item.icon

return(

<motion.div

key={index}

whileHover={{y:-12}}

transition={{duration:.3}}

>

<Card className="rounded-[35px] border-0 shadow-xl hover:shadow-2xl h-full">

<CardContent className="p-10 text-center">

<div className="mx-auto h-20 w-20 rounded-full bg-[#0F3D91] flex items-center justify-center">

<Icon className="h-9 w-9 text-agc-gold"/>

</div>

<h3 className="mt-8 text-2xl font-black text-[#0F3D91]">

{item.title}

</h3>

<p className="mt-5 text-slate-600 leading-7">

{item.desc}

</p>

</CardContent>

</Card>

</motion.div>

)

})}

</div>

</div>

</section>

)

}
// ==========================================
// PART 5B
// Testimonials + TrustBar + CTA + PremiumFooter + App
// ==========================================

function Testimonials(){

const reviews=[

{
name:"Rajesh Sharma",
company:"Sharma Traders • Guwahati",
review:"Outstanding transport service with accurate tracking and timely deliveries."
},

{
name:"Meera Devi",
company:"Silk House • Sualkuchi",
review:"Professional staff and safe handling of fragile products. Highly recommended."
},

{
name:"Vikram Bora",
company:"Bora Tea Estate • Dibrugarh",
review:"Reliable logistics partner for bulk tea transportation across India."
}

]

return(

<section className="py-28 bg-white">

<div className="container mx-auto px-4">

<div className="text-center">

<p className="uppercase tracking-[5px] text-agc-gold font-bold">

Testimonials

</p>

<h2 className="mt-4 text-5xl font-black text-[#0F3D91]">

Trusted By Businesses

</h2>

</div>

<div className="grid lg:grid-cols-3 gap-8 mt-20">

{reviews.map((item,index)=>(

<Card
key={index}
className="rounded-[35px] border-0 shadow-xl"
>

<CardContent className="p-10">

<div className="flex gap-1 text-agc-gold">

{Array.from({length:5}).map((_,i)=>(

<Star key={i} className="fill-current h-5 w-5"/>

))}

</div>

<p className="mt-6 text-slate-600 leading-8">

"{item.review}"

</p>

<h3 className="mt-8 font-black text-[#0F3D91]">

{item.name}

</h3>

<p className="text-slate-500">

{item.company}

</p>

</CardContent>

</Card>

))}

</div>

</div>

</section>

)

}

function TrustBar(){

const items=[

"GPS Enabled Fleet",

"Real Time Tracking",

"24×7 Support",

"Door Pickup",

"Daily Dispatch",

"Safe Cargo"

]

return(

<section className="py-14 bg-[#0F3D91]">

<div className="container mx-auto px-4">

<div className="flex flex-wrap justify-center gap-4">

{items.map((item,index)=>(

<div
key={index}
className="px-6 py-3 rounded-full bg-white/10 text-white border border-white/10"
>

<CheckCircle2 className="inline h-4 w-4 mr-2 text-agc-gold"/>

{item}

</div>

))}

</div>

</div>

</section>

)

}

function CTASection(){

return(

<section className="py-28 bg-gradient-to-r from-[#0F3D91] to-[#1949aa] text-white">

<div className="container mx-auto px-4 text-center">

<h2 className="text-5xl font-black">

Ready To Ship?

</h2>

<p className="mt-6 text-white/80 max-w-2xl mx-auto">

Book your shipment today with Assam Goods Carrier.

</p>

<div className="flex justify-center gap-5 mt-10">

<Button className="bg-agc-gold text-[#0F3D91] rounded-full px-10">

<Phone className="mr-2 h-5 w-5"/>

Call Now

</Button>

<Button
variant="outline"
className="rounded-full border-white text-white px-10"
>

<MessageCircle className="mr-2 h-5 w-5"/>

WhatsApp

</Button>

</div>

</div>

</section>

)

}

function PremiumFooter(){

return(

<footer className="bg-[#06173A] text-white py-20">

<div className="container mx-auto px-4">

<div className="grid lg:grid-cols-4 gap-10">

<div>

<Logo theme="dark"/>

<p className="mt-5 text-agc-gold font-bold uppercase tracking-[4px]">
SAFE • FAST • RELIABLE
</p>

<p className="mt-4 text-white/70 leading-8">
Connecting Chandigarh, Haryana, Punjab, Delhi and North India with Assam & the complete North-East through trusted logistics and transport solutions.
</p>
<div className="flex items-center gap-4 mt-8">


</div>
</div>

<div>

<h3 className="font-bold text-agc-gold">

Quick Links

</h3>

<div className="mt-5 flex flex-col gap-4 text-white/80">

  <a
    href="#track"
    className="hover:text-agc-gold transition duration-300"
  >
    📦 Track Shipment
  </a>

  <a
    href="#services"
    className="hover:text-agc-gold transition duration-300"
  >
    🚚 Our Services
  </a>

  <a
    href="#coverage"
    className="hover:text-agc-gold transition duration-300"
  >
    📍 Coverage Area
  </a>

  <a
    href="/customer"
    className="hover:text-agc-gold transition duration-300"
  >
    👤 Customer Login
  </a>

  <a
    href="/branch"
    className="hover:text-agc-gold transition duration-300"
  >
    🏢 Branch Login
  </a>

</div>
</div>

<div>

<h3 className="font-bold text-agc-gold">

Contact

</h3>

<div className="mt-5 space-y-4 text-white/80">

  <div>
    <p className="text-agc-gold font-semibold">Head Office</p>

    <p className="leading-7">
      Plot No. 5A,<br/>
      Industrial Area,<br/>
      Phase-2,<br/>
      Panchkula,<br/>
      Haryana - 134113
    </p>
  </div>

  <div className="space-y-2">
    <p>📞 +91 8847428801</p>
    <p>📧 info@assamgoodscarrier.com</p>
    <p>🕒 24×7 Customer Support</p>
  </div>

</div>
</div>

<div>

<h3 className="font-bold text-agc-gold">

Certificates

</h3>

<div className="flex flex-wrap gap-2 mt-5">

{["ISO 9001","GST Registered","MSME","PAN INDIA"].map((x)=>(

<span
key={x}
className="px-3 py-2 rounded-full bg-white/10 text-xs"
>

{x}

</span>

))}

</div>

</div>

</div>

<div className="border-t border-white/10 mt-12 pt-6 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-white/70">

  <p>
    Copyright © {new Date().getFullYear()}{" "}
    <span className="font-semibold text-white">
      Assam Goods Carrier
    </span>{" "}
    All Rights Reserved.
  </p>

  <p className="flex items-center gap-2">
  Made in 🇮🇳 with ❤️
</p>

  <p>
    Website Designed & Maintained By{" "}
    <span className="font-semibold text-agc-gold">
      SD Enterprises
    </span>
  </p>

</div>

</div>

</footer>

)

}

function FloatingButtons(){

return(

<div className="fixed right-5 bottom-5 z-50 flex flex-col gap-3">

<a
href={`https://wa.me/91${PHONE}`}
className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center"
>

<MessageCircle className="h-6 w-6 text-white"/>

</a>

<a
href={`tel:${PHONE}`}
className="h-14 w-14 rounded-full bg-agc-gold flex items-center justify-center"
>

<Phone className="h-6 w-6 text-[#0F3D91]"/>

</a>

</div>

)

}

export default function App(){

return(

<div className="min-h-screen bg-white">

<Hero/>

<FloatingStats/>

<Partners/>

<NorthEastSection/>

<Services/>

<Coverage/>

<FleetSection/>

<RouteTimeline/>

<WhyChooseAGC/>

<Testimonials/>

<TrustBar/>

<CTASection/>

<PremiumFooter/>

<FloatingButtons/>

</div>

)

}