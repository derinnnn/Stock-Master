"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { LayoutDashboard, ShoppingCart, Package, BarChart3, Users, Settings, X, LogOut, History } from "lucide-react"
import { signout } from "../actions/auth" 

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sales Entry", href: "/sales-entry", icon: ShoppingCart },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Sales History", href: "/sales-history", icon: History }, // New Tab
    { name: "Reports", href: "/reports", icon: BarChart3 },
    // Only show these if role is owner (or if user is null during dev)
    ...(user?.role === "owner" || !user
      ? [
          { name: "Staff Management", href: "/staff-management", icon: Users },
          { name: "Settings", href: "/settings", icon: Settings },
        ]
      : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col
        lg:relative lg:translate-x-0 lg:z-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">StockKeeper</h2>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Business info */}
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600">Business</p>
          <p className="font-medium text-gray-800">{user?.businessName || "My Business"}</p>
        </div>

        {/* Navigation - Flex Grow pushes the logout button to bottom */}
        <nav className="p-4 space-y-2 flex-grow">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign Out Button (Pinned to Bottom) */}
        <div className="p-4 border-t border-gray-100">
          <form action={signout}>
            <button 
              type="submit" 
              className="flex w-full items-center gap-3 px-3 py-2 text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}