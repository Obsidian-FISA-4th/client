import React, { useState } from 'react'
import { Hash, SettingsIcon, User, Mail, HelpCircle, LogOut } from 'lucide-react'

export function SidebarFooter() {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  return (
    <div className="p-2 border-t border-gray-200 dark:border-[#333]">
      <div className="relative">
        <div
          className="flex items-center gap-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] text-sm cursor-pointer"
          onClick={() => setShowSettingsMenu(!showSettingsMenu)}
        >
          <SettingsIcon size={16} />
          <span>Settings</span>
        </div>

        {showSettingsMenu && (
          <div className="absolute bottom-full left-0 mb-1 w-48 bg-white dark:bg-[#262626] rounded-md shadow-lg border border-gray-200 dark:border-[#333] z-50">
            <div className="py-1">
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer">
                <User size={14} />
                <span>Profile</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer">
                <Mail size={14} />
                <span>Notifications</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer">
                <HelpCircle size={14} />
                <span>Help & Support</span>
              </div>
              <div className="border-t border-gray-200 dark:border-[#333] my-1"></div>
              <div
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
                onClick={() => {
                  document.cookie = "obsidian_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
                  window.location.reload()
                }}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}