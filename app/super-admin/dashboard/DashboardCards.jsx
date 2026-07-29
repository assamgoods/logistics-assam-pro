import React from 'react';
import {
  Package,
  CalendarCheck,
  CreditCard,
  Banknote,
  Receipt,
  Coins,
  Wallet,
  TrendingUp,
  BadgePercent,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

const DashboardCards = ({ metrics = {} }) => {
  // Format numbers into Indian Currency / Number Format
  const formatCurrency = (val) => {
    const numericVal = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numericVal);
  };

  const formatNumber = (val) => {
    const numericVal = Number(val) || 0;
    return new Intl.NumberFormat('en-IN').format(numericVal);
  };

  const handleCardClick = (target) => {
    // Action handler for navigation/filtering across system modules
    console.log(`Navigating to: ${target}`);
  };

  const cardsData = [
    {
      id: 'total-bookings',
      title: 'Total Bookings',
      value: formatNumber(metrics.totalBookings),
      description: 'All bookings till date',
      icon: Package,
      action: '/bookings',
      theme: {
        bg: 'bg-indigo-50/60 hover:bg-indigo-50',
        border: 'border-indigo-100',
        text: 'text-indigo-900',
        iconBg: 'bg-indigo-600',
        iconColor: 'text-white',
        badge: 'bg-indigo-100 text-indigo-700'
      }
    },
    {
      id: 'todays-bookings',
      title: "Today's Bookings",
      value: formatNumber(metrics.todaysBookings),
      description: 'Booked today',
      icon: CalendarCheck,
      action: '/bookings?filter=today',
      theme: {
        bg: 'bg-blue-50/60 hover:bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-900',
        iconBg: 'bg-blue-600',
        iconColor: 'text-white',
        badge: 'bg-blue-100 text-blue-700'
      }
    },
    {
      id: 'prepaid-shipments',
      title: 'Prepaid Shipments',
      value: formatNumber(metrics.prepaidShipments),
      description: 'Prepaid payment orders',
      icon: CreditCard,
      action: '/shipments?type=prepaid',
      theme: {
        bg: 'bg-teal-50/60 hover:bg-teal-50',
        border: 'border-teal-100',
        text: 'text-teal-900',
        iconBg: 'bg-teal-600',
        iconColor: 'text-white',
        badge: 'bg-teal-100 text-teal-700'
      }
    },
    {
      id: 'cod-shipments',
      title: 'COD Shipments',
      value: formatNumber(metrics.codShipments),
      description: 'Cash on delivery orders',
      icon: Banknote,
      action: '/shipments?type=cod',
      theme: {
        bg: 'bg-cyan-50/60 hover:bg-cyan-50',
        border: 'border-cyan-100',
        text: 'text-cyan-900',
        iconBg: 'bg-cyan-600',
        iconColor: 'text-white',
        badge: 'bg-cyan-100 text-cyan-700'
      }
    },
    {
      id: 'total-freight',
      title: 'Total Freight',
      value: formatCurrency(metrics.totalFreight),
      description: 'Cumulative freight charged',
      icon: Receipt,
      action: '/reports/freight',
      theme: {
        bg: 'bg-slate-50 hover:bg-slate-100/80',
        border: 'border-slate-200',
        text: 'text-slate-900',
        iconBg: 'bg-slate-800',
        iconColor: 'text-white',
        badge: 'bg-slate-200 text-slate-800'
      }
    },
    {
      id: 'cod-amount',
      title: 'COD Amount',
      value: formatCurrency(metrics.codAmount),
      description: 'Total COD value to collect',
      icon: Coins,
      action: '/finance/cod',
      theme: {
        bg: 'bg-sky-50/60 hover:bg-sky-50',
        border: 'border-sky-100',
        text: 'text-sky-900',
        iconBg: 'bg-sky-600',
        iconColor: 'text-white',
        badge: 'bg-sky-100 text-sky-700'
      }
    },
    {
      id: 'wallet-balance',
      title: 'Wallet Balance',
      value: formatCurrency(metrics.walletBalance),
      description: 'Available balance',
      icon: Wallet,
      action: '/wallet',
      theme: {
        bg: 'bg-emerald-50/60 hover:bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-900',
        iconBg: 'bg-emerald-600',
        iconColor: 'text-white',
        badge: 'bg-emerald-100 text-emerald-700'
      }
    },
    {
      id: 'todays-revenue',
      title: "Today's Revenue",
      value: formatCurrency(metrics.todaysRevenue),
      description: 'Gross revenue earned today',
      icon: TrendingUp,
      action: '/reports/revenue?period=today',
      theme: {
        bg: 'bg-violet-50/60 hover:bg-violet-50',
        border: 'border-violet-100',
        text: 'text-violet-900',
        iconBg: 'bg-violet-600',
        iconColor: 'text-white',
        badge: 'bg-violet-100 text-violet-700'
      }
    },
    {
      id: 'todays-profit',
      title: "Today's Profit",
      value: formatCurrency(metrics.todaysProfit),
      description: 'Net profit earned today',
      icon: BadgePercent,
      action: '/reports/profit?period=today',
      theme: {
        bg: 'bg-purple-50/60 hover:bg-purple-50',
        border: 'border-purple-100',
        text: 'text-purple-900',
        iconBg: 'bg-purple-600',
        iconColor: 'text-white',
        badge: 'bg-purple-100 text-purple-700'
      }
    },
    {
      id: 'pending-pickup',
      title: 'Pending Pickup',
      value: formatNumber(metrics.pendingPickup),
      description: 'Awaiting courier pickup',
      icon: Clock,
      action: '/shipments?status=pending_pickup',
      theme: {
        bg: 'bg-amber-50/60 hover:bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-900',
        iconBg: 'bg-amber-500',
        iconColor: 'text-white',
        badge: 'bg-amber-100 text-amber-800'
      }
    },
    {
      id: 'in-transit',
      title: 'In Transit',
      value: formatNumber(metrics.inTransit),
      description: 'Shipments currently moving',
      icon: Truck,
      action: '/shipments?status=in_transit',
      theme: {
        bg: 'bg-blue-50/60 hover:bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-900',
        iconBg: 'bg-blue-500',
        iconColor: 'text-white',
        badge: 'bg-blue-100 text-blue-800'
      }
    },
    {
      id: 'delivered',
      title: 'Delivered',
      value: formatNumber(metrics.delivered),
      description: 'Successfully delivered',
      icon: CheckCircle2,
      action: '/shipments?status=delivered',
      theme: {
        bg: 'bg-emerald-50/60 hover:bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-900',
        iconBg: 'bg-emerald-600',
        iconColor: 'text-white',
        badge: 'bg-emerald-100 text-emerald-800'
      }
    },
    {
      id: 'ndr',
      title: 'NDR',
      value: formatNumber(metrics.ndr),
      description: 'Non-delivery reports',
      icon: AlertTriangle,
      action: '/ndr',
      theme: {
        bg: 'bg-orange-50/60 hover:bg-orange-50',
        border: 'border-orange-100',
        text: 'text-orange-900',
        iconBg: 'bg-orange-500',
        iconColor: 'text-white',
        badge: 'bg-orange-100 text-orange-800'
      }
    },
    {
      id: 'rto',
      title: 'RTO',
      value: formatNumber(metrics.rto),
      description: 'Return to origin shipments',
      icon: RotateCcw,
      action: '/rto',
      theme: {
        bg: 'bg-rose-50/60 hover:bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-900',
        iconBg: 'bg-rose-500',
        iconColor: 'text-white',
        badge: 'bg-rose-100 text-rose-800'
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {cardsData.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.action)}
            className={`group relative p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer ${card.theme.bg} ${card.theme.border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${card.theme.text}`}>
                  {card.value}
                </h3>
              </div>

              <div
                className={`p-3 rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${card.theme.iconBg}`}
              >
                <IconComponent className={`w-6 h-6 ${card.theme.iconColor}`} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600 line-clamp-1">
                {card.description}
              </p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.theme.badge}`}>
                View
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;