"use client"

import { useState, useEffect } from "react"
import { X, FileText, Check } from "lucide-react"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)

  const markdownFiles = [
    "Daily Notes/2024-02-25.md",
    "Daily Notes/2024-02-24.md",
    "Projects/Web Development/React/React Hooks.md",
    "Projects/Web Development/React/Component Patterns.md",
    "Projects/Web Development/React/Next.js Notes.md",
    "Projects/Web Development/CSS Tricks.md",
    "Projects/Project Ideas.md",
    "Research/Research Notes.md",
  ]

  const toggleFileSelection = (file: string) => {
    if (selectedFiles.includes(file)) {
      const newSelectedFiles = selectedFiles.filter((f) => f !== file)
      setSelectedFiles(newSelectedFiles)
      // 모든 파일이 선택되지 않았으므로 selectAll을 false로 설정
      setSelectAll(false)
    } else {
      const newSelectedFiles = [...selectedFiles, file]
      setSelectedFiles(newSelectedFiles)
      // 모든 파일이 선택되었는지 확인
      if (newSelectedFiles.length === markdownFiles.length) {
        setSelectAll(true)
      }
    }
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      // 모두 선택 해제
      setSelectedFiles([])
    } else {
      // 모두 선택
      setSelectedFiles([...markdownFiles])
    }
    setSelectAll(!selectAll)
  }

  const handleDeploy = () => {
    // Here you would handle the deployment logic
    console.log("Deploying files:", selectedFiles)
    onClose()
  }

  useEffect(() => {
    if (selectAll) {
      setSelectedFiles([...markdownFiles])
    }
  }, [selectAll])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-medium text-gray-800 dark:text-[#dcddde]">Deploy Markdown Files</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333]">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-[#999] mb-4">Select the markdown files you want to deploy:</p>

          <div
            className="flex items-center p-2 mb-2 rounded bg-gray-50 dark:bg-[#333] cursor-pointer"
            onClick={toggleSelectAll}
          >
            <div
              className={`w-5 h-5 rounded border ${selectAll ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
            >
              {selectAll && <Check size={14} className="text-white" />}
            </div>
            <div className="flex items-center ml-3">
              <span className="text-sm font-medium text-gray-800 dark:text-[#dcddde]">ALL</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">({markdownFiles.length} files)</span>
            </div>
          </div>

          <div className="space-y-2">
            {markdownFiles.map((file) => (
              <div
                key={file}
                className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
                onClick={() => toggleFileSelection(file)}
              >
                <div
                  className={`w-5 h-5 rounded border ${selectedFiles.includes(file) ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
                >
                  {selectedFiles.includes(file) && <Check size={14} className="text-white" />}
                </div>
                <div className="flex items-center ml-3">
                  <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
                  <span className="text-sm text-gray-800 dark:text-[#dcddde]">{file}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-[#333]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] bg-gray-100 dark:bg-[#333] rounded hover:bg-gray-200 dark:hover:bg-[#444]"
          >
            Cancel
          </button>
          <button
            onClick={handleDeploy}
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedFiles.length === 0}
          >
            Deploy
          </button>
        </div>
      </div>
    </div>
  )
}

