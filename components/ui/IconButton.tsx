import { Pencil, Check, Trash2, Upload } from "lucide-react"

interface IconButtonsProps {
  isEditMode: boolean
  onEdit: () => void
  onSave: () => void
  onDelete: () => void
  onUpload: () => void  // 업로드 핸들러 추가
}

export const IconButtons = ({ isEditMode, onEdit, onSave, onDelete, onUpload }: IconButtonsProps) => {
  return (
    <div className="flex items-center">
      {isEditMode ? (
        <>
          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] mr-2"
            onClick={onSave}
            title="Save Changes"
          >
            <Check size={16} className="text-green-500" />
          </button>
          {/* 업로드 버튼은 편집 모드에서만 표시 */}
          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] ml-2"
            onClick={onUpload}
            title="Upload Image"
          >
            <Upload size={16} />
          </button>
        </>
      ) : (
        <button
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333]"
          onClick={onEdit}
          title="Edit"
        >
          <Pencil size={16} />
        </button>
      )}
      <button
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] ml-2"
        onClick={onDelete}
        title="Delete File"
      >
        <Trash2 size={16} className="text-red-500" />
      </button>
    </div>
  )
}
