import React from 'react'
import { X } from "lucide-react"
import { useFileSystemStore } from '@/store/fileSystemStore'

interface TabProps {
  tabId: string
  filePath: string
  onTabClick: (path: string) => void
  onTabClose: (path: string) => void
  active: boolean
}

export function TabItem({ tabId, filePath, onTabClick, onTabClose, active }: TabProps) {
  const handleFileClick = useFileSystemStore((state) => state.handleFileClick)
  const handleTabClose = useFileSystemStore((state) => state.handleTabClose)

  return (
    <div
      className={`flex items-center h-full px-3 border-r border-gray-200 dark:border-[#333] cursor-pointer min-w-[120px] max-w-[200px] rounded-t-lg ${
        active ? "bg-gray-100 dark:bg-[#1e1e1e]" : "hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
      }`}
      onClick={() => handleFileClick(filePath)}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-sm truncate">{filePath.split("/").pop()}</span>
        <button
          className="ml-2 p-0.5 rounded-sm hover:bg-gray-200 dark:hover:bg-[#333]"
          onClick={(e) => {
            e.stopPropagation()
            handleTabClose(tabId)
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
