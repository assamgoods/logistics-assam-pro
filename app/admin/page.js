'use client'

import { LogoMark } from '@/components/Logo'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lock,
  LayoutDashboard,
  Plus,
  Truck,
  IndianRupee,
  LogOut,
  RefreshCw,
  Search,
  Bell,
  ClipboardList,
  Users,
  Building2,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Tag,
  ArrowRightLeft,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Printer,
  Save,
  Download,
  PackageCheck,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { toast } from 'sonner'
import * as XLSX from 'xlsx'

const STAGES = [
  { key: 'BOOKED', label: 'Booking Received' },
  { key: 'PICKED_UP', label: 'Picked Up' },
  { key: 'WAREHOUSE', label: 'In Warehouse' },
  { key: 'DISPATCHED', label: 'Dispatched' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'ARRIVED', label: 'Arrived At Destination' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out For Delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' }
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('login')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('agc_token')

    if (token) {
      setAuthed(true)
    }
  }, [])

  const login = async (e) => {
    e.preventDefault()

    if (!password.trim()) {
      toast.error('Enter admin password')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: password.trim()
        })
      })

      const data = await res.json()
      if (data.ok) {
        localStorage.setItem('agc_token', data.token)
        setAuthed(true)
        toast.success('Welcome Admin')
      } else {
        toast.error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error(error)
      toast.error('Network Error')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('agc_token')
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="min-h-screen gradient-navy flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl shadow-black/30">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <LogoMark size={48} />
                <div>
                  <h1 className="text-2xl font-black text-[#0F3D91]">
                    ASSAM GOODS CARRIER
                  </h1>
                  <p className="text-xs uppercase tracking-[0.25em] text-agc-orange font-semibold">
                    Admin Portal
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#0F3D91] flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Secure Admin Login
                </h2>

                <p className="text-sm text-slate-500 mt-2">
                  Login using your administrator password to continue.
                </p>
              </div>

              <form
                onSubmit={login}
                className="space-y-4"
              >
                <div>
                  <Label className="text-xs font-semibold">
                    Admin Password
                  </Label>

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 h-11"
                    placeholder="Enter Admin Password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#0F3D91] hover:bg-[#1E4FB8] text-white font-bold"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="w-full text-center text-sm text-[#0F3D91] hover:text-agc-orange font-semibold transition-colors"
                >
                  Forgot Admin Password?
                </button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <Dashboard
      onLogout={logout}
    />
  )
}

function Dashboard({ onLogout }) {
  const [tab, setTab] = useState('overview')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [stats, setStats] = useState({})
  const [bookings, setBookings] = useState([])
  const [search, setSearch] = useState('')
  const loadDashboard = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/bookings')
      ])

      const statsData = await statsRes.json()
      const bookingsData = await bookingsRes.json()

      setStats(statsData || {})
      setBookings(bookingsData.items || [])
    } catch (error) {
      console.error(error)
      toast.error('Failed to load dashboard')
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const filteredBookings = bookings.filter((item) => {
    if (!search) return true

    const value = search.toLowerCase()

    return (
      (item.lrNumber || '').toLowerCase().includes(value) ||
      (item.senderName || item.sender?.name || '').toLowerCase().includes(value) ||
      (item.receiverName || item.receiver?.name || '').toLowerCase().includes(value) ||
      (item.destination || '').toLowerCase().includes(value)
    )
  })
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      key: 'bookings',
      label: 'Bookings',
      icon: Truck
    },
    {
      key: 'new',
      label: 'New Booking',
      icon: Plus
    },
    {
      key: 'billing',
      label: 'Billing & Invoices',
      icon: IndianRupee
    },
    {
      key: 'rates',
      label: 'Rate Management',
      icon: DollarSign
    },
    {
      key: 'branches',
      label: 'Branches',
      icon: Building2
    },
    {
      key: 'transfers',
      label: 'Branch Transfers',
      icon: ArrowRightLeft
    },
  {
  key: 'users',
  label: 'Users & Roles',
  icon: Users
},
{
  key: 'labels',
      label: 'Label Settings',
      icon: Tag
    },
    {
      key: 'company',
      label: 'Company Settings',
      icon: Building2
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: FileSpreadsheet
    },
    {
      key: 'activity',
      label: 'Activity Log',
      icon: ClipboardList
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: Bell
    }
  ]

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-64 gradient-navy text-white hidden lg:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <LogoMark size={44} />
            <div>
              <div className="font-black text-lg">
                AGC Admin
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-agc-gold">
                Control Panel
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {tabs.map((item) => (
            <SideItem
              key={item.key}
              icon={item.icon}
              active={tab === item.key}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </SideItem>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-6 py-4">

            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-agc-gold font-bold">
                {tabs.find(t => t.key === tab)?.label}
              </div>

              <h1 className="text-2xl font-black text-[#0F3D91]">
                Welcome Back, Admin
              </h1>
            </div>

            <div className="flex items-center gap-3">

              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search LR, Sender, Receiver..."
                  className="pl-10 w-80"
                />
              </div>

              <Button
                variant="outline"
                onClick={loadDashboard}
                className="h-10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

            </div>
          </div>
        </div>
        <div className="p-6">

          {tab === 'overview' && (
            <Overview
  stats={stats}
  setTab={setTab}
/>          )}

          {tab === 'bookings' && (
            <BookingsList
  bookings={filteredBookings}
  search={search}
  setSearch={setSearch}
  reload={loadDashboard}
  setTab={setTab}
  selectedBooking={selectedBooking}
  setSelectedBooking={setSelectedBooking}
/>
          )}

          {tab === 'new' && (

  <NewBooking

    editBooking={selectedBooking}

    onUpdated={() => {

      loadDashboard()

      setTab('bookings')

    }}

    onCreated={() => {

      loadDashboard()

      setTab('bookings')

    }}

  />

)}
          {tab === 'billing' && (
            <BillingModule
              bookings={bookings}
              reload={loadDashboard}
            />
          )}

          {tab === 'rates' && (
            <RateManagement
              reload={loadDashboard}
            />
          )}

          {tab === 'branches' && (
            <BranchesModule
              reload={loadDashboard}
            />
          )}
          {tab === 'transfers' && (
            <BranchTransfersModule
              reload={loadDashboard}
            />
          )}

          {tab === 'users' && (
            <UsersModule
              reload={loadDashboard}
            />
          )}

          {tab === 'labels' && (
            <LabelSettingsModule
              reload={loadDashboard}
            />
          )}

          {tab === 'company' && (
            <CompanySettingsModule
              reload={loadDashboard}
            />
          )}

          {tab === 'reports' && (
            <ReportsModule
              bookings={bookings}
            />
          )}

          {tab === 'activity' && (
            <ActivityLogModule />
          )}

          {tab === 'notifications' && (
            <NotificationsModule />
          )}

        </div>

      </main>

    </div>
  )
}
function SideItem({
  icon: Icon,
  active,
  onClick,
  children
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-white text-[#0F3D91] font-bold shadow-lg'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </button>
  )
}

function Overview({ stats, setTab }) {
  const cards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: Truck,
      color: 'bg-blue-600'
    },
    {
      title: 'Delivered',
      value: stats?.delivered || 0,
      icon: CheckCircle,
      color: 'bg-green-600'
    },
    {
      title: 'In Transit',
      value: stats?.inTransit || 0,
      icon: PackageCheck,
      color: 'bg-orange-500'
    },
    {
      title: 'Pending Delivery',
      value: stats?.pending || 0,
      icon: Timer,
      color: 'bg-yellow-500'
    },
    {
      title: 'Revenue',
      value: `₹${Number(stats?.revenue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'bg-emerald-600'
    }
  ]

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map((card, index) => {
          const Icon = card.icon

          return (
            <Card
              key={index}
              className="border-0 shadow-md hover:shadow-xl transition-all"
            >
              <CardContent className="p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      {card.title}
                    </p>

                    <h2 className="text-3xl font-black text-[#0F3D91] mt-2">
                      {card.value}
                    </h2>

                  </div>

                  <div className={`${card.color} p-4 rounded-2xl text-white`}>
                    <Icon className="h-7 w-7" />
                  </div>

                </div>

              </CardContent>
            </Card>
          )
        })}

      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">

            <h3 className="text-lg font-bold text-[#0F3D91] mb-5">
              Shipment Status
            </h3>

            <div className="space-y-4">

              {STAGES.slice(0, 6).map((stage) => {

                const count = stats?.stageCounts?.[stage.key] || 0

                return (
                  <div
                    key={stage.key}
                    className="flex items-center justify-between border-b pb-3"
                  >
                    <span className="text-sm font-medium text-slate-700">
                      {stage.label}
                    </span>

                    <span className="font-black text-[#0F3D91]">
                      {count}
                    </span>
                  </div>
                )

              })}

            </div>

          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">

            <h3 className="text-lg font-bold text-[#0F3D91] mb-5">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => setTab('new')}
                className="h-20 flex flex-col gap-2 bg-[#0F3D91] hover:bg-[#1E4FB8]"
              >
                <Plus className="h-6 w-6" />
                New Booking
              </Button>

              <Button
                onClick={() => setTab('bookings')}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <Truck className="h-6 w-6" />
                View Bookings
              </Button>

              <Button
                onClick={() => setTab('billing')}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <IndianRupee className="h-6 w-6" />
                Billing
              </Button>

              <Button
                onClick={() => setTab('reports')}
                variant="outline"
                className="h-20 flex flex-col gap-2"
              >
                <FileSpreadsheet className="h-6 w-6" />
                Reports
              </Button>

            </div>

          </CardContent>
        </Card>

      </div>

    </div>
  )
}
function BookingsList({
  bookings,
  search,
  setSearch,
  reload,
  setTab,
  selectedBooking,
  setSelectedBooking
}) {

  const [showView, setShowView] = useState(false)
  const [showEdit, setShowEdit] = useState(false)


  return (

    <div className="space-y-6">

      <Card className="border-0 shadow-md">

        <CardContent className="p-6">


          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-black text-[#0F3D91]">
              Booking Management
            </h2>


            <Button
              onClick={reload}
              variant="outline"
            >

              <RefreshCw className="h-4 w-4 mr-2" />

              Refresh

            </Button>


          </div>



          <div className="relative mb-6">


            <Search
              className="absolute left-3 top-3 h-4 w-4 text-slate-400"
            />


            <Input

              value={search}

              onChange={(e)=>setSearch(e.target.value)}

              placeholder="Search LR Number, Sender, Receiver..."

              className="pl-10 h-11"

            />


          </div>



          <div className="overflow-x-auto">


            <table className="w-full text-sm">


              <thead className="bg-slate-100 text-slate-600 uppercase text-[11px]">


                <tr>


                  <th className="p-3 text-left">
                    LR No.
                  </th>


                  <th className="p-3 text-left">
                    Sender
                  </th>


                  <th className="p-3 text-left">
                    Receiver
                  </th>


                  <th className="p-3 text-left">
                    Destination
                  </th>


                  <th className="p-3 text-center">
                    Weight
                  </th>


                  <th className="p-3 text-right">
                    Amount
                  </th>


                  <th className="p-3 text-center">
                    Status
                  </th>


                  <th className="p-3 text-center">
                    Actions
                  </th>


                </tr>


              </thead>



              <tbody>


                {bookings.map((item,index)=>(


                  <tr

                    key={item._id || index}

                    className="border-b hover:bg-slate-50"

                  >


                    <td className="p-3 font-bold text-[#0F3D91]">

                      {item.lrNumber}

                    </td>


                    <td className="p-3">

                      {item.senderName || item.sender?.name || '-'}

                    </td>


                    <td className="p-3">

                      {item.receiverName || item.receiver?.name || '-'}

                    </td>


                    <td className="p-3">

                      {item.destination || '-'}

                    </td>


                    <td className="p-3 text-center">

                      {item.chargeableWeight || item.actualWeight || 0} Kg

                    </td>


                    <td className="p-3 text-right font-bold">

                      ₹{Number(item.totalAmount || 0).toLocaleString('en-IN')}

                    </td>


                    <td className="p-3 text-center">


                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">

                        {item.status || 'BOOKED'}

                      </span>


                    </td>
<td className="p-3">

  <div className="flex items-center justify-center gap-2">


    {/* View */}

    <Button
      size="sm"
      variant="outline"
      title="View Booking"
      onClick={()=>{
        setSelectedBooking(item)
        setShowView(true)
      }}
    >

      <Eye className="h-4 w-4" />

    </Button>



    {/* Edit / Update */}

    <Button
      size="sm"
      variant="outline"
      title="Edit Booking"
      onClick={()=>{
  setSelectedBooking(item)
  setTab('new')
}}    >

      <Edit className="h-4 w-4" />

    </Button>



    {/* LR Print */}

    <Button
      size="sm"
      variant="outline"
      title="Print LR"
      onClick={()=>{
        setSelectedBooking(item)
      }}
    >

      <Printer className="h-4 w-4" />

    </Button>



    {/* Sticker Print */}

    <Button
      size="sm"
      variant="outline"
      title="Print Sticker"
      onClick={()=>{
        setSelectedBooking(item)
      }}
    >

      <Tag className="h-4 w-4" />

    </Button>



    {/* Invoice */}

    <Button
      size="sm"
      variant="outline"
      title="Generate Invoice"
      onClick={()=>setTab('billing')}
    >

      <IndianRupee className="h-4 w-4" />

    </Button>


  </div>

</td>


                </tr>

              ))}


              </tbody>


            </table>

{showView && selectedBooking && (
  <div className="p-4 bg-white border rounded">
    View: {selectedBooking.lrNumber}
  </div>
)}

{showEdit && selectedBooking && (
  <div className="p-4 bg-white border rounded">
    Edit: {selectedBooking.lrNumber}
  </div>
)}
          </div>


        </CardContent>

      </Card>


    </div>

  )

}
function NewBooking({ onCreated, editBooking, onUpdated }) {

  const emptyForm = {

    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderPincode: '',
    senderGst: '',

    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverPincode: '',
    receiverGst: '',

    origin: 'Guwahati',
    destination: '',

    packages: 1,
    actualWeight: '',
    chargeableWeight: '',

    freight: '',
    loading: '',
    unloading: '',
    otherCharges: '',

    paymentMode: 'TO_PAY',
    oda: 'NO',

  }


  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  useEffect(() => {

  if(editBooking){

    setForm({

      ...emptyForm,

      senderName:
        editBooking.senderName ||
        editBooking.sender?.name ||
        '',

      senderPhone:
        editBooking.senderPhone ||
        editBooking.sender?.phone ||
        '',

      senderAddress:
        editBooking.senderAddress ||
        editBooking.sender?.address ||
        '',


      receiverName:
        editBooking.receiverName ||
        editBooking.receiver?.name ||
        '',

      receiverPhone:
        editBooking.receiverPhone ||
        editBooking.receiver?.phone ||
        '',

      receiverAddress:
        editBooking.receiverAddress ||
        editBooking.receiver?.address ||
        '',


      destination:
        editBooking.destination || '',

      actualWeight:
        editBooking.actualWeight || '',

      chargeableWeight:
        editBooking.chargeableWeight || '',

      freight:
        editBooking.freight || '',

      loading:
        editBooking.loading || '',

      unloading:
        editBooking.unloading || '',

      hamali:
        editBooking.hamali || '',

      otherCharges:
        editBooking.otherCharges || '',

      oda:
        editBooking.oda || 'NO',

      paymentMode:
        editBooking.paymentMode || 'TO_PAY'

    })

  }

}, [editBooking])


const odaCharge =
  form.oda === 'YES'
    ? Number(form.chargeableWeight || form.actualWeight || 0) <= 120
      ? 500
      : Number(form.chargeableWeight || form.actualWeight || 0) * 3
    : 0


const totalAmount =
  Number(form.freight || 0) +
  Number(form.loading || 0) +
  Number(form.unloading || 0) +
  Number(form.hamali || 0) +
  Number(form.otherCharges || 0) +
  odaCharge
const fetchPincode = async (pincode, type) => {

  if (pincode.length !== 6) return

  try {

    const res = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    )

    const data = await res.json()

    if (
      data[0]?.Status === "Success" &&
      data[0]?.PostOffice?.length
    ) {

      const office = data[0].PostOffice.find(
  item => item.Pincode === pincode
) || data[0].PostOffice[0]

      if (type === "sender") {

        setForm(prev => ({
          ...prev,
          senderCity: office.Block || office.District,
          senderState: office.State
        }))

      }


      if (type === "receiver") {

        setForm(prev => ({
          ...prev,
          receiverCity: office.Block || office.District,
          receiverState: office.State
        }))

      }

    } else {

      toast.error("Pincode Not Found")

    }

  } catch(error) {

    console.log(error)

    toast.error("Pincode Service Error")

  }

}
  const saveBooking = async (e) => {

    e.preventDefault()

    setSaving(true)

    try {

      const token = localStorage.getItem('agc_token')


     const res = await fetch(
  editBooking
  ? `/api/bookings/${editBooking.id}`
  : '/api/bookings',
  {
    method: editBooking ? 'PUT' : 'POST',

    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },


        body: JSON.stringify({

          ...form,

          totalAmount

        })

      })


      const data = await res.json()


      if (data.ok) {

        toast.success(
  editBooking
    ? 'Booking Updated Successfully'
    : 'Booking Created Successfully'
)
        setForm(emptyForm)

        if(editBooking){
  onUpdated()
}else{
  onCreated()
}

      } else {

        toast.error(data.error || 'Failed To Create Booking')

      }


    } catch(error) {

      console.error(error)

      toast.error('Network Error')


    } finally {

      setSaving(false)

    }

  }



  return (

    <div className="space-y-6">


      <Card className="border-0 shadow-lg">


        <CardContent className="p-6">


          <h2 className="text-2xl font-black text-[#0F3D91] mb-6">
            New Booking
          </h2>



          <form
            onSubmit={saveBooking}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >



            <div className="lg:col-span-3">

              <h3 className="text-xl font-bold text-[#0F3D91]">
                Sender Details
              </h3>

            </div>



            <div>

              <Label>Sender Name</Label>

              <Input
                value={form.senderName}
                onChange={(e)=>setForm({
                  ...form,
                  senderName:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Sender Phone</Label>

              <Input
                value={form.senderPhone}
                onChange={(e)=>setForm({
                  ...form,
                  senderPhone:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Sender GST</Label>

              <Input
                value={form.senderGst}
                onChange={(e)=>setForm({
                  ...form,
                  senderGst:e.target.value
                })}
              />

            </div>



            <div className="lg:col-span-3">

              <Label>Sender Address</Label>

              <Input
                value={form.senderAddress}
                onChange={(e)=>setForm({
                  ...form,
                  senderAddress:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Sender City</Label>

              <Input
                value={form.senderCity}
                onChange={(e)=>setForm({
                  ...form,
                  senderCity:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Sender State</Label>

              <Input
                value={form.senderState}
                onChange={(e)=>setForm({
                  ...form,
                  senderState:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Sender Pincode</Label>

              <Input
  value={form.senderPincode}
  onChange={(e)=>{

    const pin = e.target.value

    setForm({
      ...form,
      senderPincode: pin
    })

    if(pin.length === 6){
      fetchPincode(pin,"sender")
    }

  }}
/>
            </div>





            <div className="lg:col-span-3 mt-4">

              <h3 className="text-xl font-bold text-[#0F3D91]">
                Receiver Details
              </h3>

            </div>



            <div>

              <Label>Receiver Name</Label>

              <Input
                value={form.receiverName}
                onChange={(e)=>setForm({
                  ...form,
                  receiverName:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Receiver Phone</Label>

              <Input
                value={form.receiverPhone}
                onChange={(e)=>setForm({
                  ...form,
                  receiverPhone:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Receiver GST</Label>

              <Input
                value={form.receiverGst}
                onChange={(e)=>setForm({
                  ...form,
                  receiverGst:e.target.value
                })}
              />

            </div>



            <div className="lg:col-span-3">

              <Label>Receiver Address</Label>

              <Input
                value={form.receiverAddress}
                onChange={(e)=>setForm({
                  ...form,
                  receiverAddress:e.target.value
                })}
              />

            </div>
            <div>

              <Label>Receiver City</Label>

              <Input
                value={form.receiverCity}
                onChange={(e)=>setForm({
                  ...form,
                  receiverCity:e.target.value
                })}
              />

            </div>


            <div>

              <Label>Receiver State</Label>

              <Input
                value={form.receiverState}
                onChange={(e)=>setForm({
                  ...form,
                  receiverState:e.target.value
                })}
              />

            </div>


            <div>

              <Label>Receiver Pincode</Label>

              <Input
  value={form.receiverPincode}
  onChange={(e)=>{

    const pin = e.target.value

    setForm({
      ...form,
      receiverPincode: pin
    })

    if(pin.length === 6){
      fetchPincode(pin,"receiver")
    }

  }}
/>

            </div>



            <div>

              <Label>Origin</Label>

              <Input
                value={form.origin}
                onChange={(e)=>setForm({
                  ...form,
                  origin:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Destination</Label>

              <Input
                value={form.destination}
                onChange={(e)=>setForm({
                  ...form,
                  destination:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Packages</Label>

              <Input
                type="number"
                value={form.packages}
                onChange={(e)=>setForm({
                  ...form,
                  packages:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Actual Weight (Kg)</Label>

              <Input
                type="number"
                value={form.actualWeight}
                onChange={(e)=>setForm({
                  ...form,
                  actualWeight:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Chargeable Weight (Kg)</Label>

              <Input
                type="number"
                value={form.chargeableWeight}
                onChange={(e)=>setForm({
                  ...form,
                  chargeableWeight:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Freight</Label>

              <Input
                type="number"
                value={form.freight}
                onChange={(e)=>setForm({
                  ...form,
                  freight:e.target.value
                })}
              />

            </div>



            <div>

              <Label>Green Charge</Label>

              <Input
                type="number"
                value={form.loading}
                onChange={(e)=>setForm({
                  ...form,
                  loading:e.target.value
                })}
              />

            </div>



            <div>
<div>

  <Label>LC</Label>

  <Input
    type="number"
    value={form.unloading || ''}
    onChange={(e)=>setForm({
      ...form,
      unloading:e.target.value
    })}
  />

</div>


<div>

  <Label>Hamali Charges</Label>

  <Input
    type="number"
    value={form.hamali || ''}
    onChange={(e)=>setForm({
      ...form,
      hamali:e.target.value
    })}
  />

</div>


<div>

  <Label>Other Charges</Label>

  <Input
    type="number"
    value={form.otherCharges || ''}
    onChange={(e)=>setForm({
      ...form,
      otherCharges:e.target.value
    })}
  />

</div>
<div>

  <Label>ODA</Label>

  <Select
    value={form.oda}
    onValueChange={(v)=>setForm({
      ...form,
      oda:v
    })}
  >

    <SelectTrigger>
      <SelectValue placeholder="Select ODA" />
    </SelectTrigger>

    <SelectContent>

      <SelectItem value="NO">
        NO
      </SelectItem>

      <SelectItem value="YES">
        YES
      </SelectItem>

    </SelectContent>

  </Select>

</div>
              <Label>Payment Mode</Label>

              <Select
                value={form.paymentMode}
                onValueChange={(v)=>setForm({
                  ...form,
                  paymentMode:v
                })}
              >

                <SelectTrigger>

                  <SelectValue placeholder="Select Payment Mode" />

                </SelectTrigger>


                <SelectContent>

                  <SelectItem value="TO_PAY">
                    To Pay
                  </SelectItem>

                  <SelectItem value="PAID">
                    Paid
                  </SelectItem>

                  <SelectItem value="TBB">
                    To Be Billed
                  </SelectItem>

                  <SelectItem value="FOC">
                    Free Of Cost
                  </SelectItem>

                </SelectContent>

              </Select>

            </div>




            <div className="lg:col-span-3">

              <Card className="bg-slate-50 border-dashed">

                <CardContent className="p-5 flex items-center justify-between">


                  <div>

                    <p className="text-xs uppercase tracking-widest text-slate-500">
                      Total Freight Amount
                    </p>


                    <h2 className="text-3xl font-black text-[#0F3D91] mt-2">
                      ₹{Number(totalAmount).toLocaleString('en-IN')}
                    </h2>

                  </div>



                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-12 px-8 bg-[#0F3D91] hover:bg-[#1E4FB8]"
                  >

                    {saving ? 'Saving...' : editBooking ? 'Update Booking' : 'Create Booking'}

                  </Button>


                </CardContent>

              </Card>

            </div>



          </form>


        </CardContent>


      </Card>


    </div>

  )

}
function BillingModule({ bookings, reload }) {

  const [lrNumber, setLrNumber] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/invoices', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.ok) {
        setHistory(data.invoices || [])
      }

    } catch (e) {
      console.error(e)
    }
  }

  const fetchLR = async () => {

    if (!lrNumber.trim()) {
      toast.error('Enter LR Number')
      return
    }

    setLoading(true)

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch(
        `/api/bookings/${encodeURIComponent(lrNumber)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await res.json()

      if (data.ok) {
        setSelectedBooking(data.booking)
        toast.success('LR Loaded')
      } else {
        toast.error('LR Not Found')
      }

    } catch (e) {
      toast.error('Network Error')
    }

    setLoading(false)
  }
  const generateInvoice = async () => {

    if (!selectedBooking) {
      toast.error('Fetch LR First')
      return
    }

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          lrNumber: selectedBooking.lrNumber
        })
      })

      const data = await res.json()

      if (data.ok) {

        toast.success('Invoice Generated Successfully')

        loadHistory()

        reload()

      } else {

        toast.error(data.error || 'Invoice Generation Failed')

      }

    } catch (e) {

      console.error(e)

      toast.error('Network Error')

    }

  }

  const printInvoice = (lr) => {
    window.open(`/invoice/${encodeURIComponent(lr)}`, '_blank')
  }

  const downloadInvoice = (lr) => {
    window.open(`/api/invoices/${encodeURIComponent(lr)}/pdf`, '_blank')
  }

  return (
    <div className="space-y-6">

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6 space-y-5">

          <h2 className="text-2xl font-black text-[#0F3D91]">
            Billing & Invoice
          </h2>

          <div className="flex gap-3">

            <Input
              value={lrNumber}
              onChange={(e) => setLrNumber(e.target.value)}
              placeholder="Enter LR Number"
            />

            <Button
              onClick={fetchLR}
              disabled={loading}
              className="bg-[#0F3D91] hover:bg-[#1E4FB8]"
            >
              {loading ? 'Fetching...' : 'Fetch LR'}
            </Button>

          </div>

          {selectedBooking && (

            <Card className="bg-slate-50">

              <CardContent className="p-5">

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

                  <div>
                    <p className="text-xs text-slate-500">LR Number</p>
                    <h3 className="font-bold text-[#0F3D91]">
                      {selectedBooking.lrNumber}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Sender</p>
                    <h3 className="font-semibold">
                      {selectedBooking.senderName}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Receiver</p>
                    <h3 className="font-semibold">
                      {selectedBooking.receiverName}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Amount</p>
                    <h3 className="font-black text-green-600">
                      ₹{Number(selectedBooking.totalAmount || 0).toLocaleString('en-IN')}
                    </h3>
                  </div>

                </div>
              </CardContent>

            </Card>

          )}

          <div className="flex justify-end">

            <Button
              onClick={generateInvoice}
              disabled={!selectedBooking}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <IndianRupee className="h-4 w-4 mr-2" />
              Generate Invoice
            </Button>

          </div>

        </CardContent>

      </Card>

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6">

          <h2 className="text-xl font-black text-[#0F3D91] mb-5">
            Invoice History
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">Invoice No.</th>

                  <th className="p-3 text-left">LR Number</th>

                  <th className="p-3 text-left">Customer</th>

                  <th className="p-3 text-right">Amount</th>

                  <th className="p-3 text-center">Action</th>

                </tr>

              </thead>

              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-400"
                    >
                      No Invoice Generated Yet
                    </td>
                  </tr>
                )}

                {history.map((invoice, index) => (

                  <tr
                    key={invoice._id || index}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3 font-bold text-[#0F3D91]">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="p-3">
                      {invoice.lrNumber}
                    </td>

                    <td className="p-3">
                      {invoice.senderName || invoice.sender?.name}
                    </td>

                    <td className="p-3 text-right font-bold">
                      ₹{Number(invoice.totalAmount || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">

                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(
                              `/invoice/${encodeURIComponent(invoice.lrNumber)}`,
                              '_blank'
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => printInvoice(invoice.lrNumber)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadInvoice(invoice.lrNumber)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </CardContent>

      </Card>

    </div>

  )
}

function RateManagement({ reload }) {

  const [rates, setRates] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRates = async () => {

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/rates', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.ok) {
        setRates(data.items || [])
      }

    } catch (e) {
      console.error(e)
    }

    setLoading(false)

  }

  useEffect(() => {
    loadRates()
  }, [])
  return (

    <div className="space-y-6">

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black text-[#0F3D91]">
              Rate Management
            </h2>

            <div className="flex gap-3">

  <Button
    onClick={()=>setShowAdd(!showAdd)}
    className="bg-[#0F3D91]"
  >
    + Add Rate
  </Button>

  
</div>

          </div>
{showAdd && (

  <Card className="mb-6 bg-slate-50">

    <CardContent className="p-5">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Input
          placeholder="Branch"
          value={rateForm.branchName}
          disabled
        />

        <Input
          placeholder="Destination City"
          value={rateForm.destination}
          onChange={(e)=>setRateForm({
            ...rateForm,
            destination:e.target.value
          })}
        />

        <Input
          placeholder="Rate / Kg"
          type="number"
          value={rateForm.rate}
          onChange={(e)=>setRateForm({
            ...rateForm,
            rate:e.target.value
          })}
        />

        <Input
          placeholder="Minimum Charge"
          type="number"
          value={rateForm.minimumCharge}
          onChange={(e)=>setRateForm({
            ...rateForm,
            minimumCharge:e.target.value
          })}
        />

        <Input
          placeholder="Bilty Charge"
          type="number"
          value={rateForm.biltyCharge}
          onChange={(e)=>setRateForm({
            ...rateForm,
            biltyCharge:e.target.value
          })}
        />

        <Input
          placeholder="ODA Charge"
          type="number"
          value={rateForm.odaCharge}
          onChange={(e)=>setRateForm({
            ...rateForm,
            odaCharge:e.target.value
          })}
        />

      </div>

      <Button
        className="mt-5 bg-[#0F3D91]"
      >
        Save Rate
      </Button>

    </CardContent>

  </Card>

)}
          {loading ? (

            <div className="text-center py-10 text-slate-500">
              Loading Rates...
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Branch
                    </th>

                    <th className="p-3 text-left">
                      Destination
                    </th>

                    <th className="p-3 text-center">
                      Rate / Kg
                    </th>

                    <th className="p-3 text-center">
                      Min Charge
                    </th>

                    <th className="p-3 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>
                {rates.length === 0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="text-center py-10 text-slate-400"
                    >
                      No Rates Available
                    </td>

                  </tr>

                )}

                {rates.map((rate, index) => (

                  <tr
                    key={rate._id || index}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3 font-semibold">
                      {rate.branchName}
                    </td>

                    <td className="p-3">
                      {rate.destination}
                    </td>

                    <td className="p-3 text-center font-bold">
                      ₹{Number(rate.rate || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3 text-center">
                      ₹{Number(rate.minimumCharge || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="p-3">

                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}
              </tbody>

                             </table>

          </div>

        )}

      </CardContent>

      </Card>

    </div>

  )

}

function BranchesModule({ reload }) {

  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

const [rateForm, setRateForm] = useState({
  branchName: "Panchkula",
  destination: "",
  rate: "",
  minimumCharge: "",
  biltyCharge: "",
  odaCharge: "500"
})

  const loadBranches = async () => {

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/branches', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.ok) {
        setBranches(data.items || [])
      }

    } catch (e) {
      console.error(e)
    }

    setLoading(false)

  }

  useEffect(() => {
    loadBranches()
  }, [])

  return (

    <div className="space-y-6">

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black text-[#0F3D91]">
              Branch Management
            </h2>
            <Button
              onClick={loadBranches}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

          </div>

          {loading ? (

            <div className="text-center py-10 text-slate-500">
              Loading Branches...
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Branch Name
                    </th>

                    <th className="p-3 text-left">
                      Branch Code
                    </th>

                    <th className="p-3 text-left">
                      City
                    </th>

                    <th className="p-3 text-left">
                      State
                    </th>

                    <th className="p-3 text-center">
                      Status
                    </th>

                    <th className="p-3 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>
                {branches.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-400"
                    >
                      No Branches Found
                    </td>

                  </tr>

                )}

                {branches.map((branch, index) => (

                  <tr
                    key={branch._id || index}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3 font-semibold">
                      {branch.branchName}
                    </td>

                    <td className="p-3">
                      {branch.branchCode}
                    </td>

                    <td className="p-3">
                      {branch.city}
                    </td>

                    <td className="p-3">
                      {branch.state}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          branch.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {branch.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>

                    </td>
                    <td className="p-3">

                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

                   </div>

        )}

        </CardContent>

      </Card>

    </div>

  )

}

function BranchTransfersModule({ reload }) {

  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransfers()
  }, [])
  const loadTransfers = async () => {

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/transfers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.ok) {
        setTransfers(data.items || [])
      }

    } catch (e) {
      console.error(e)
    }

    setLoading(false)

  }

  return (

    <div className="space-y-6">

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black text-[#0F3D91]">
              Branch Transfers
            </h2>

            <Button
              onClick={loadTransfers}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

          </div>

          {loading ? (
            <div className="text-center py-10 text-slate-500">
              Loading Transfers...
            </div>
          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Transfer No.
                    </th>

                    <th className="p-3 text-left">
                      From Branch
                    </th>

                    <th className="p-3 text-left">
                      To Branch
                    </th>

                    <th className="p-3 text-left">
                      LR Count
                    </th>

                    <th className="p-3 text-left">
                      Date
                    </th>

                    <th className="p-3 text-center">
                      Status
                    </th>

                    <th className="p-3 text-center">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transfers.length === 0 && (

                    <tr>

                      <td
                        colSpan={7}
                        className="text-center py-10 text-slate-400"
                      >
                        No Transfer Records Found
                      </td>

                    </tr>

                  )}

                  {transfers.map((item, index) => (

                    <tr
                      key={item._id || index}
                      className="border-b hover:bg-slate-50"
                    >
                    <td className="p-3 font-semibold">
                      {item.transferNumber}
                    </td>

                    <td className="p-3">
                      {item.fromBranch}
                    </td>

                    <td className="p-3">
                      {item.toBranch}
                    </td>

                    <td className="p-3">
                      {item.totalLR || item.lrCount || 0}
                    </td>

                    <td className="p-3">
                      {item.transferDate || item.date}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : item.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-700'
                            : item.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status || 'PENDING'}
                      </span>

                    </td>

                    <td className="p-3">

                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}
              </tbody>

            </table>

          </div>

        )}

      </CardContent>

    </Card>

  </div>

)

}

function UsersModule({ reload }) {

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      if (data.ok) {
        setUsers(data.items || [])
      }

    } catch (e) {
      console.error(e)
    }

    setLoading(false)

  }

  return (
    <div className="space-y-6">

      <Card className="border-0 shadow-lg">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-2xl font-black text-[#0F3D91]">
              Users & Roles
            </h2>

            <Button
              onClick={loadUsers}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

          </div>

          {loading ? (

            <div className="text-center py-10 text-slate-500">
              Loading Users...
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 text-left">
                      Name
                    </th>

                    <th className="p-3 text-left">
                      Email
                    </th>

                    <th className="p-3 text-left">
                      Branch
                    </th>

                    <th className="p-3 text-left">
                      Role
                    </th>

                    <th className="p-3 text-center">
                      Status
                    </th>

                    <th className="p-3 text-center">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>
                {users.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-400"
                    >
                      No Users Found
                    </td>

                  </tr>

                )}

                {users.map((user, index) => (

                  <tr
                    key={user._id || index}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3 font-semibold">
                      {user.name}
                    </td>

                    <td className="p-3">
                      {user.email}
                    </td>

                    <td className="p-3">
                      {user.branchName || '-'}
                    </td>

                    <td className="p-3">
                      {user.role}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {user.active ? 'ACTIVE' : 'DISABLED'}
                      </span>

                    </td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2">

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </CardContent>

    </Card>

  </div>

)

}

function LabelSettingsModule() {

  return (

    <Card className="border-0 shadow-lg">

      <CardContent className="p-6">

        <h2 className="text-2xl font-black text-[#0F3D91] mb-4">
          Label Settings
        </h2>
        <p className="text-slate-600 mb-6">
          Configure LR Label, Invoice Layout and Barcode Settings.
        </p>

        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <Label>Company Name</Label>
            <Input defaultValue="ASSAM GOODS CARRIER" />
          </div>

          <div>
            <Label>Label Size</Label>
            <Select defaultValue="4x6">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4x6">4 x 6 Inch</SelectItem>
                <SelectItem value="A4">A4 Sheet</SelectItem>
                <SelectItem value="A5">A5 Sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Barcode Type</Label>
            <Select defaultValue="CODE128">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CODE128">CODE 128</SelectItem>
                <SelectItem value="QR">QR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Auto Print</Label>
            <Select defaultValue="NO">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YES">Yes</SelectItem>
                <SelectItem value="NO">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button className="bg-[#0F3D91]">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>

        </div>

      </CardContent>

    </Card>

  )
}
function CompanySettingsModule() {

  const [company, setCompany] = useState({
    companyName: 'ASSAM GOODS CARRIER',
    gst: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  const saveCompany = async () => {

    try {

      const token = localStorage.getItem('agc_token')

      const res = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(company)
      })

      const data = await res.json()

      if (data.ok) {
        toast.success('Company Settings Saved')
      } else {
        toast.error(data.error || 'Failed')
      }

    } catch (e) {
      toast.error('Network Error')
    }

  }

  return (

    <Card className="border-0 shadow-lg">

      <CardContent className="p-6">

        <h2 className="text-2xl font-black text-[#0F3D91] mb-6">
          Company Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <Label>Company Name</Label>
            <Input
              value={company.companyName}
              onChange={(e) =>
                setCompany({ ...company, companyName: e.target.value })
              }
            />
          </div>

          <div>
            <Label>GST Number</Label>
            <Input
              value={company.gst}
              onChange={(e) =>
                setCompany({ ...company, gst: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              value={company.phone}
              onChange={(e) =>
                setCompany({ ...company, phone: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              value={company.email}
              onChange={(e) =>
                setCompany({ ...company, email: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              value={company.website}
              onChange={(e) =>
                setCompany({ ...company, website: e.target.value })
              }
            />
          </div>

          <div>
            <Label>City</Label>
            <Input
              value={company.city}
              onChange={(e) =>
                setCompany({ ...company, city: e.target.value })
              }
            />
          </div>
          <div>
            <Label>State</Label>
            <Input
              value={company.state}
              onChange={(e) =>
                setCompany({
                  ...company,
                  state: e.target.value
                })
              }
            />
          </div>

          <div>
            <Label>Pincode</Label>
            <Input
              value={company.pincode}
              onChange={(e) =>
                setCompany({
                  ...company,
                  pincode: e.target.value
                })
              }
            />
          </div>

          <div className="md:col-span-2">
            <Label>Office Address</Label>
            <Input
              value={company.address}
              onChange={(e) =>
                setCompany({
                  ...company,
                  address: e.target.value
                })
              }
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button
              onClick={saveCompany}
              className="bg-[#0F3D91] hover:bg-[#1E4FB8]"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Company Details
            </Button>
          </div>

        </div>

      </CardContent>

    </Card>

  )
}
function ReportsModule({ bookings }) {

  const exportExcel = () => {

    const rows = bookings.map(item => ({
      "LR Number": item.lrNumber,
      "Sender": item.senderName || item.sender?.name,
      "Receiver": item.receiverName || item.receiver?.name,
      "Origin": item.origin,
      "Destination": item.destination,
      "Weight": item.chargeableWeight || item.actualWeight,
      "Amount": item.totalAmount,
      "Status": item.status
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, ws, "Bookings")

    XLSX.writeFile(
      wb,
      `AGC-Report-${new Date().toISOString().slice(0,10)}.xlsx`
    )

    toast.success("Report Downloaded")

  }

  return (

    <Card className="border-0 shadow-lg">

      <CardContent className="p-6">

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-black text-[#0F3D91]">
            Reports
          </h2>

          <Button
            onClick={exportExcel}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>

        </div>

        <div className="text-slate-600">

          Total Bookings :
          <span className="font-bold ml-2">
            {bookings.length}
          </span>

        </div>
        <div className="mt-6 overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-slate-100">

              <tr>

                <th className="p-3 text-left">Status</th>

                <th className="p-3 text-center">Count</th>

              </tr>

            </thead>

            <tbody>

              {STAGES.map(stage => {

                const total = bookings.filter(
                  b => b.status === stage.key
                ).length

                return (

                  <tr
                    key={stage.key}
                    className="border-b"
                  >

                    <td className="p-3">
                      {stage.label}
                    </td>

                    <td className="p-3 text-center font-bold">
                      {total}
                    </td>

                  </tr>

                )

              })}

            </tbody>

          </table>

        </div>

      </CardContent>

    </Card>

  )

}

function ActivityLogModule() {

  return (

    <Card className="border-0 shadow-lg">

      <CardContent className="p-6">

        <h2 className="text-2xl font-black text-[#0F3D91] mb-6">
          Activity Log
        </h2>
        <div className="space-y-4">

          <div className="flex items-center justify-between p-4 border rounded-lg">

            <div>

              <h3 className="font-bold">
                Admin Login
              </h3>

              <p className="text-sm text-slate-500">
                Super Admin logged into the system.
              </p>

            </div>

            <span className="text-xs text-slate-400">
              Just Now
            </span>

          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">

            <div>

              <h3 className="font-bold">
                Booking Created
              </h3>

              <p className="text-sm text-slate-500">
                New LR booking has been created successfully.
              </p>

            </div>

            <span className="text-xs text-slate-400">
              Today
            </span>

          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">

            <div>

              <h3 className="font-bold">
                Invoice Generated
              </h3>

              <p className="text-sm text-slate-500">
                Invoice generated for the latest shipment.
              </p>

            </div>

            <span className="text-xs text-slate-400">
              Today
            </span>

          </div>

        </div>

      </CardContent>

    </Card>

  )

}

function NotificationsModule() {

  return (

    <Card className="border-0 shadow-lg">

      <CardContent className="p-6">

        <h2 className="text-2xl font-black text-[#0F3D91] mb-6">
          Notifications
        </h2>
        <div className="space-y-4">

          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">

            <div className="flex items-center gap-3">

              <Bell className="h-8 w-8 text-blue-600" />

              <div>

                <h3 className="font-bold text-[#0F3D91]">
                  Booking Notifications
                </h3>

                <p className="text-sm text-slate-600">
                  You will receive notifications whenever a new booking is created.
                </p>

              </div>

            </div>

            <CheckCircle className="h-6 w-6 text-green-600" />

          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">

            <div className="flex items-center gap-3">

              <IndianRupee className="h-8 w-8 text-green-600" />

              <div>

                <h3 className="font-bold text-[#0F3D91]">
                  Billing Notifications
                </h3>

                <p className="text-sm text-slate-600">
                  Invoice generation and payment updates will appear here.
                </p>

              </div>

            </div>

            <CheckCircle className="h-6 w-6 text-green-600" />

          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">

            <div className="flex items-center gap-3">

              <Truck className="h-8 w-8 text-orange-600" />

              <div>

                <h3 className="font-bold text-[#0F3D91]">
                  Shipment Alerts
                </h3>

                <p className="text-sm text-slate-600">
                  LR dispatch, arrival and delivery alerts will be displayed here.
                </p>

              </div>

            </div>

            <Bell className="h-6 w-6 text-orange-600" />

          </div>

        </div>

      </CardContent>

    </Card>

  )

}