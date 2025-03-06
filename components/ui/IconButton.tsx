import { Pencil, Check, Trash2, Upload } from "lucide-react"

interface IconButtonsProps {
  isEditMode: boolean
  onEdit: () => void
  onSave: () => void
  onDelete: () => void
  onUpload: () => void  
  disabled: boolean;
}

export const IconButtons = ({ isEditMode, onEdit, onSave, onDelete, onUpload, disabled }: IconButtonsProps) => {
  return (
    <div className="flex items-center">
      {isEditMode ? (
        <>
          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] mr-2"
            onClick={disabled ? undefined : onSave}  
            title="Save Changes"
            disabled={disabled}  
          >
            <Check size={16} className="text-green-500" />
          </button>
          {/* 업로드 버튼은 편집 모드에서만 표시 */}
          <button
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] ml-2"
            onClick={disabled ? undefined : onUpload}  
            title="Upload Image"
            disabled={disabled}  
          >
            <Upload size={16} />
          </button>
        </>
      ) : (
        <button
          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333]"
          onClick={disabled ? undefined : onEdit}  
          title="Edit"
          disabled={disabled}  
        >
          <Pencil size={16} />
        </button>
      )}
      <button
        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#333] ml-2"
        onClick={disabled ? undefined : onDelete} 
        title="Delete File"
        disabled={disabled} 
      >
        <Trash2 size={16} className="text-red-500" />
      </button>
    </div>
  )
}
