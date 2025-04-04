import React from "react";
import { IconButtons } from "../ui/IconButton";

interface EditorSubmenuProps {
  editableTitle: string;
  setEditableTitle: (title: string) => void;
  isEditMode: boolean;
  setIsEditMode: (editMode: boolean) => void;
  handleSaveEdit: () => void;
  handleDelete: () => void;
  handleUploadImage: () => void;
  isStudent: boolean;
  filePath?: string;
}

export const EditorSubmenu: React.FC<EditorSubmenuProps> = ({
  editableTitle,
  setEditableTitle,
  isEditMode,
  setIsEditMode,
  handleSaveEdit,
  handleDelete,
  handleUploadImage,
  isStudent,
  filePath,
}) => {
  return (
    <div className="flex justify-between p-2 border-b border-gray-200 dark:border-[#333] sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
      <div className="text-sm text-gray-600 dark:text-[#999] flex items-center">
        {isEditMode ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            className="px-2 py-1 bg-white dark:bg-[#333] border border-gray-300 dark:border-[#555] rounded text-gray-800 dark:text-[#dcddde] focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isStudent}
          />
        ) : (
          filePath?.split("/").pop()
        )}
      </div>

      {!isStudent && (
        <IconButtons
          isEditMode={isEditMode}
          onEdit={() => setIsEditMode(true)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onUpload={handleUploadImage}
          disabled={isStudent}
        />
      )}
    </div>
  );
};