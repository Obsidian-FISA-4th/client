import React, { useState } from 'react'
import { SidebarHeader } from '../sidebar/SidebarHeader'
import { SidebarSearch } from '../sidebar/SidebarSearch'
import { SidebarFooter } from '../sidebar/SidebarFooter'
import { SidebarContent } from '../sidebar/SidebarContent'
import { NewItemModal } from '../modals/NewItemModal'
import { SidebarSubMenu } from '../sidebar/SIdebarSubMenu'


interface SidebarProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  onDeployClick?: () => void
  isDarkMode: boolean
  toggleDarkMode: () => void
  onFileClick: (filePath: string) => void
  fileSystem: any
  onSearchChange: (term: string) => void
  onAddFile?: (folderPath: string, fileName: string) => void
  onAddFolder?: (parentPath: string, folderName: string) => void
  onMoveNode?: (nodePath: string, targetFolderPath: string) => void
  isStudentPage?: boolean
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
  isStudentPage = false,
}: SidebarProps) {
  const [showNewItemModal, setShowNewItemModal] = useState(false)
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [newItemName, setNewItemName] = useState('')
  const [newItemParentPath, setNewItemParentPath] = useState<string | null>(null)
  const [activePath, setActivePath] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarWidth, setSidebarWidth] = useState(365) // 초기 너비 설정

  const handleAddItem = (type: 'file' | 'folder') => {
    setNewItemType(type)
    setNewItemParentPath(activePath || '/') // 현재 활성화된 경로로 설정, 기본값은 루트 경로
    setShowNewItemModal(true)
  }

  const createNewItem = async () => {
    if (newItemParentPath) {
      if (newItemType === 'file' && onAddFile) {
        await onAddFile(newItemParentPath, newItemName)
      } else if (newItemType === 'folder' && onAddFolder) {
        await onAddFolder(newItemParentPath, newItemName)
      }
    }
    setShowNewItemModal(false)
    setNewItemName('')
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX
    const startWidth = sidebarWidth

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, startWidth + e.clientX - startX) // 최소 너비 200px
      setSidebarWidth(newWidth)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className="h-full flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#333] bg-gray-100 dark:bg-[#262626] relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      <SidebarHeader
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onDeployClick={onDeployClick}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        isStudentPage={isStudentPage}
      />
      {isOpen && (
        <>
          <SidebarSearch
            onSearchChange={(term) => {
              setSearchTerm(term);
              onSearchChange(term);
            }}
          />
          {onAddFile && onAddFolder && <SidebarSubMenu onAddItem={handleAddItem} />}
          <SidebarContent
            onFileClick={onFileClick}
            fileSystem={fileSystem}
            onMoveNode={onMoveNode}
            setActivePath={setActivePath}
            isStudentPage={isStudentPage}
            searchTerm={searchTerm}
          />
          {!isStudentPage && <SidebarFooter />}
        </>
      )}
      {onAddFile && onAddFolder && (
        <NewItemModal
          show={showNewItemModal}
          type={newItemType}
          onClose={() => setShowNewItemModal(false)}
          onCreate={createNewItem}
          newItemName={newItemName}
          setNewItemName={setNewItemName}
          newItemParentPath={newItemParentPath}
        />
      )}
      {/* Resizer */}
      <div
        className="absolute top-0 right-0 h-full w-2 cursor-ew-resize bg-transparent"
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}