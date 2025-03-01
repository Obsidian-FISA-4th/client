import React from 'react'

interface NewItemModalProps {
  show: boolean
  type: 'file' | 'folder'
  onClose: () => void
  onCreate: () => void
  newItemName: string
  setNewItemName: (name: string) => void
  newItemParentPath: string | null
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  show,
  type,
  onClose,
  onCreate,
  newItemName,
  setNewItemName,
  newItemParentPath,
}) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg w-full max-w-md p-4">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-[#dcddde]">
          Create New {type === 'file' ? 'File' : 'Folder'}
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-[#999] mb-1">
            Location: {newItemParentPath || "Root"}
          </label>
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={type === 'file' ? 'File name (e.g., My Note.md)' : 'Folder name (e.g., New Folder)'}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-[#333] text-gray-800 dark:text-[#dcddde] border-gray-300 dark:border-[#444]"
            autoFocus
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] bg-gray-100 dark:bg-[#333] rounded hover:bg-gray-200 dark:hover:bg-[#444]"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            disabled={!newItemName.trim()}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}