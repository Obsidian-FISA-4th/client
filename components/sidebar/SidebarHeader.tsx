import React from 'react'
import { Sun, Moon, Send, Menu, ChevronRight } from 'lucide-react'

interface SidebarHeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  onDeployClick: () => void
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
}

export function SidebarHeader({
  isDarkMode,
  toggleDarkMode,
  onDeployClick,
  setIsOpen,
  isOpen,
}: SidebarHeaderProps) {
  return (
    <div className="p-2 flex items-center justify-between border-b border-gray-200 dark:border-[#333]">
      {!isOpen && (
        <div className="flex justify-center w-full">
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      {isOpen && <div className="text-sm font-medium">My Vault</div>}
      {isOpen && (
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={onDeployClick}>
            <Send size={16} />
          </button>
          <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={() => setIsOpen(false)}>
            <Menu size={16} />
          </button>
        </div>
      )}
    </div>
  )
}