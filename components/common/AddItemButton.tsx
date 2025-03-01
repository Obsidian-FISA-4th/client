import React from 'react'
import { FilePlus, FolderPlus } from 'lucide-react'

interface AddItemButtonProps {
  type: 'file' | 'folder'
  onClick: () => void
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({ type, onClick }) => {
  return (
    <button
      className="flex items-center gap-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] text-sm flex-1"
      onClick={onClick}
    >
      {type === 'file' ? <FilePlus size={14} /> : <FolderPlus size={14} />}
      <span>{type === 'file' ? 'Add File' : 'Add Folder'}</span>
    </button>
  )
}