import React, { useEffect, useState } from 'react'
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

  return (
    <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'} h-full flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-[#333] bg-gray-100 dark:bg-[#262626] absolute md:relative z-10`}>
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
          <SidebarSearch onSearchChange={onSearchChange} />
          {onAddFile && onAddFolder && <SidebarSubMenu onAddItem={handleAddItem} />}
          <SidebarContent
            onFileClick={onFileClick}
            fileSystem={fileSystem}
            onMoveNode={onMoveNode}
            setActivePath={setActivePath}
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
    </div>
  )
}