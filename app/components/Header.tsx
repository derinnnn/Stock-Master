"use client"

import { useAuth } from "../contexts/AuthContext"
import { Menu, User } from "lucide-react"

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Trigger */}
          <button onClick={onMenuClick} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Welcome Message */}
          <div>
             <h1 className="text-lg font-semibold text-gray-800">
               {/* Uses real business name or falls back to generic */}
               {user?.businessName ? user.businessName : "StockKeeper Dashboard"}
             </h1>
             <p className="text-xs text-gray-500 hidden sm:block">Overview of your business performance</p>
          </div>
        </div>

        {/* User Badge (Clean & Simple) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
            <User className="h-4 w-4 text-gray-500" />
            <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 leading-none">
                  {/* Shows email since we don't have a personal 'name' column yet */}
                  {user?.email?.split('@')[0] || "User"}
                </span>
                <span className="text-[10px] text-gray-500 leading-none mt-1 capitalize">
                  {user?.role || "Owner"}
                </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}