import React, { useState } from 'react'
import { Sun, Moon, Send, Menu, ChevronRight } from 'lucide-react'
import { DeployModal } from '../modals/DeployModal'

interface SidebarHeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
  onDeployClick?: () => void
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isOpen: boolean
  isStudentPage: boolean
}

export function SidebarHeader({
  isDarkMode,
  toggleDarkMode,
  onDeployClick,
  setIsOpen,
  isOpen,
  isStudentPage,
}: SidebarHeaderProps) {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)

  const handleDeployClick = () => {
    if (onDeployClick) {
      onDeployClick()
    }
    setIsDeployModalOpen(true)
  }

  return (
    <div className="p-2 flex items-center justify-between border-b border-gray-200 dark:border-[#333]">
      {!isOpen && (
        <div className="flex justify-center w-full">
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
      {isOpen && <div className="text-sm font-medium">Service dev</div>}
      {isOpen && (
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {!isStudentPage && (
            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={handleDeployClick}>
              <Send size={16} />
            </button>
          )}
          <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333]" onClick={() => setIsOpen(false)}>
            <Menu size={16} />
          </button>
        </div>
      )}
      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
    </div>
  )
}