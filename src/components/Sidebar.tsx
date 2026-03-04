'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/', icon: GridIcon },
  { name: 'P&L', href: '/pnl', icon: DollarIcon },
  { name: 'Creatives', href: '/creatives', icon: ImageIcon },
  { name: 'Halo Effect', href: '/halo', icon: TrendingIcon },
]

const platformNav = [
  { name: 'Shopify', href: '/pnl/shopify', color: 'bg-green-500' },
  { name: 'Amazon', href: '/pnl/amazon', color: 'bg-orange-500' },
  { name: 'MercadoLibre', href: '/pnl/mercadolibre', color: 'bg-yellow-500' },
  { name: 'TikTok Shop', href: '/pnl/tiktok', color: 'bg-pink-500' },
]

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  )
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const isPnlSection = pathname.startsWith('/pnl')

  return (
    <aside className="w-56 bg-zinc-900 min-h-screen p-4 flex flex-col">
      <div className="text-xl font-bold text-white mb-8">
        DOSE<span className="text-emerald-500">.</span>analytics
      </div>
      <nav className="space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isPnlItem = item.href === '/pnl'
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive || (isPnlItem && isPnlSection)
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
              {/* Platform sub-navigation under P&L */}
              {isPnlItem && isPnlSection && (
                <div className="ml-8 mt-1 space-y-1">
                  {platformNav.map((platform) => {
                    const isActivePlatform = pathname === platform.href
                    return (
                      <Link
                        key={platform.name}
                        href={platform.href}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors
                          ${isActivePlatform
                            ? 'bg-white/10 text-white'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                        `}
                      >
                        <span className={`w-2 h-2 rounded-full ${platform.color}`} />
                        {platform.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="pt-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-500">
          Data refreshes daily at 8am
        </div>
      </div>
    </aside>
  )
}
