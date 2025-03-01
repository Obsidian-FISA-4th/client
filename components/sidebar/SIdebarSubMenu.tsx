import React from 'react'
import { AddItemButton } from '../common/AddItemButton'

interface SidebarSubMenuProps {
  onAddItem: (type: 'file' | 'folder') => void
}

export const SidebarSubMenu: React.FC<SidebarSubMenuProps> = ({ onAddItem }) => {
  return (
    <div className="p-2 border-b border-gray-200 dark:border-[#333] flex items-center justify-between">
      <AddItemButton type="folder" onClick={() => onAddItem('folder')} />
      <AddItemButton type="file" onClick={() => onAddItem('file')} />
    </div>
  )
}