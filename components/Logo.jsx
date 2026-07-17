import React from 'react'

// Original AGC brand mark — a rounded navy chevron badge with an orange arrow-A
// forming the 'A' of AGC, symbolising forward motion, speed & trusted delivery.
export function LogoMark({ size = 40, className = '', accent = '#F97316', primary = '#0F3D91', secondary = '#1E4FB8', bg = null }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label="Assam Goods Carrier">
      <defs>
        <linearGradient id="agcNavyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={primary}/>
          <stop offset="1" stopColor={secondary}/>
        </linearGradient>
        <linearGradient id="agcOrangeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="1"/>
          <stop offset="1" stopColor="#EA580C"/>
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="11" fill={bg || 'url(#agcNavyGrad)'} />
      {/* Speed lines / highway hint on left */}
      <path d="M6 32 H12 M6 36 H10" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Stylised A = arrow forward */}
      <path d="M13 36 L24 12 L35 36" stroke="url(#agcOrangeGrad)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Crossbar of the A (also reads as a road) */}
      <path d="M18 27 H30" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round"/>
      {/* Arrow chevron above A - motion */}
      <path d="M20 12 L24 6 L28 12" stroke="url(#agcOrangeGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Icon-only variant that adapts to any background (mono, uses currentColor)
export function LogoIconMono({ size = 40, className = '', color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="1" y="1" width="46" height="46" rx="11" fill="transparent" stroke={color} strokeWidth="2"/>
      <path d="M13 36 L24 12 L35 36" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 27 H30" stroke={color} strokeWidth="2.4" strokeLinecap="round"/>
      <path d="M20 12 L24 6 L28 12" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// Full lock-up: icon + AGC wordmark + tagline
export function Logo({ variant = 'full', size = 'md', theme = 'light', className = '' }) {
  const iconSize = size === 'lg' ? 48 : size === 'sm' ? 32 : 40
  const titleSize = size === 'lg' ? 'text-[22px]' : size === 'sm' ? 'text-[14px]' : 'text-[16px]'
  const taglineSize = size === 'lg' ? 'text-[10px]' : 'text-[9px]'
  const isDark = theme === 'dark'
  const titleColor = isDark ? 'text-white' : 'text-[#0F3D91]'
  const taglineColor = 'text-[#F97316]'

  if (variant === 'icon') return <LogoMark size={iconSize} className={className}/>
  if (variant === 'mono') return <LogoIconMono size={iconSize} className={className} color={isDark ? '#ffffff' : '#0F3D91'}/>

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={iconSize}/>
      <div className="leading-tight">
        <div className={`font-black tracking-tight ${titleSize} ${titleColor}`}>ASSAM GOODS CARRIER</div>
        <div className={`uppercase tracking-[0.28em] font-bold ${taglineSize} ${taglineColor}`}>Safe • Fast • Reliable</div>
      </div>
    </div>
  )
}

export default Logo
