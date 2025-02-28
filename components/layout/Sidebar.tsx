import React from 'react'
import { SidebarHeader } from './sidebar/SidebarHeader'
import { SidebarSearch } from './sidebar/SidebarSearch'
import { SidebarContent } from './sidebar/SidebarContent'
import { SidebarFooter } from './sidebar/SidebarFooter'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onDeployClick: () => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  onFileClick: (filePath: string) => void
  fileSystem: any
  onSearchChange: (term: string) => void
  onAddFile: (folderPath: string, fileName: string) => void
  onAddFolder: (parentPath: string, folderName: string) => void
  onMoveNode: (nodePath: string, targetFolderPath: string) => void
}

export function Sidebar({
  isOpen,
  setIsOpen,
  onDeployClick,
  isDarkMode,
  toggleDarkMode,
  onFileClick,
  fileSystem,
  onSearchChange,
  onAddFile,
  onAddFolder,
  onMoveNode,
}: SidebarProps) {
  return (
    <div className={`w-64 h-full flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#333] bg-gray-100 dark:bg-[#262626] transition-all duration-300 absolute md:relative z-10`}>
      <SidebarHeader
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onDeployClick={onDeployClick}
        setIsOpen={setIsOpen}
      />
      <SidebarSearch onSearchChange={onSearchChange} />
      <SidebarContent
        onFileClick={onFileClick}
        fileSystem={fileSystem}
        onAddFile={onAddFile}
        onAddFolder={onAddFolder}
        onMoveNode={onMoveNode}
      />
      <SidebarFooter />
    </div>
  )
}