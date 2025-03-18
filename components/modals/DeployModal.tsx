"use client"

import { useState, useEffect } from "react"
import { X, FileText, Check, Upload, CheckCircle } from "lucide-react"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MarkdownFile {
  path: string
  lastModified: string
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [publishedFiles, setPublishedFiles] = useState<MarkdownFile[]>([
    { path: "Projects/Web Development/React/React Hooks.md", lastModified: "2024-02-20" },
    { path: "Projects/Web Development/CSS Tricks.md", lastModified: "2024-02-15" },
    { path: "Research/Research Notes.md", lastModified: "2024-02-10" },
  ])

  const [unpublishedFiles, setUnpublishedFiles] = useState<MarkdownFile[]>([
    { path: "Daily Notes/2024-02-25.md", lastModified: "2024-02-25" },
    { path: "Daily Notes/2024-02-24.md", lastModified: "2024-02-24" },
    { path: "Projects/Web Development/React/Component Patterns.md", lastModified: "2024-02-23" },
    { path: "Projects/Web Development/React/Next.js Notes.md", lastModified: "2024-02-22" },
    { path: "Projects/Project Ideas.md", lastModified: "2024-02-21" },
  ])

  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectAllUnpublished, setSelectAllUnpublished] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploySuccess, setDeploySuccess] = useState<number | false>(false)

  const toggleFileSelection = (file: string) => {
    if (selectedFiles.includes(file)) {
      const newSelectedFiles = selectedFiles.filter((f) => f !== file)
      setSelectedFiles(newSelectedFiles)
      setSelectAllUnpublished(false)
    } else {
      const newSelectedFiles = [...selectedFiles, file]
      setSelectedFiles(newSelectedFiles)

      // 모든 배포되지 않은 파일이 선택되었는지 확인
      const allUnpublishedSelected = unpublishedFiles.every((f) => newSelectedFiles.includes(f.path))
      setSelectAllUnpublished(allUnpublishedSelected)
    }
  }

  const toggleSelectAllUnpublished = () => {
    if (selectAllUnpublished) {
      // 모든 배포되지 않은 파일 선택 해제
      setSelectedFiles([])
    } else {
      // 모든 배포되지 않은 파일 선택
      const unpublishedPaths = unpublishedFiles.map((f) => f.path)
      setSelectedFiles(unpublishedPaths)
    }
    setSelectAllUnpublished(!selectAllUnpublished)
  }

  // handleDeploy 함수를 업데이트하여 선택을 지우기 전에 배포된 파일의 수를 저장
  const handleDeploy = () => {
    // 배포 상태 표시
    setIsDeploying(true)

    // 배포되는 파일의 수 저장
    const deployedFilesCount = selectedFiles.length

    // 배포 프로세스 시뮬레이션
    setTimeout(() => {
      // 선택된 파일을 배포되지 않은 파일에서 배포된 파일로 이동
      const filesToMove = unpublishedFiles.filter((file) => selectedFiles.includes(file.path))

      // 배포된 파일의 현재 날짜 업데이트
      const today = new Date()
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

      const movedFiles = filesToMove.map((file) => ({
        ...file,
        lastModified: formattedDate, // 마지막 수정 날짜를 오늘로 업데이트
      }))

      // 배포된 파일 목록 업데이트
      setPublishedFiles((prev) => [...prev, ...movedFiles])

      // 배포된 파일을 배포되지 않은 파일에서 제거
      setUnpublishedFiles((prev) => prev.filter((file) => !selectedFiles.includes(file.path)))

      // 선택 지우기
      setSelectedFiles([])
      setSelectAllUnpublished(false)

      console.log("Deployed files:", filesToMove)
      setIsDeploying(false)

      // 저장된 수로 성공 상태 설정
      setDeploySuccess(deployedFilesCount)

      // 3초 후에 성공 메시지 자동 숨기기
      setTimeout(() => {
        setDeploySuccess(false)
      }, 3000)
    }, 1500) // 1.5초 배포 프로세스 시뮬레이션
  }

  useEffect(() => {
    if (selectAllUnpublished) {
      const unpublishedPaths = unpublishedFiles.map((f) => f.path)
      setSelectedFiles(unpublishedPaths)
    }
  }, [selectAllUnpublished, unpublishedFiles])

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
          {/* 배포된 파일 섹션 */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <CheckCircle size={16} className="text-green-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-[#dcddde]">Published</h3>
              <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">({publishedFiles.length} files)</span>
            </div>

            <div className="space-y-2 pl-2">
              {publishedFiles.length > 0 ? (
                publishedFiles.map((file) => (
                  <div key={file.path} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333]">
                    <div className="flex items-center ml-3 flex-1">
                      <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
                      <span className="text-sm text-gray-800 dark:text-[#dcddde]">{file.path}</span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-[#999]">{file.lastModified}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 dark:text-[#999] italic p-2">No published files yet</div>
              )}
            </div>
          </div>

          {/* 배포되지 않은 파일 섹션 */}
          <div>
            <div className="flex items-center mb-3">
              <Upload size={16} className="text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-700 dark:text-[#dcddde]">Unpublished</h3>
              <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">({unpublishedFiles.length} files)</span>
            </div>

            {unpublishedFiles.length > 0 ? (
              <>
                <div
                  className="flex items-center p-2 mb-2 rounded bg-gray-50 dark:bg-[#333] cursor-pointer"
                  onClick={toggleSelectAllUnpublished}
                >
                  <div
                    className={`w-5 h-5 rounded border ${selectAllUnpublished ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
                  >
                    {selectAllUnpublished && <Check size={14} className="text-white" />}
                  </div>
                  <div className="flex items-center ml-3">
                    <span className="text-sm font-medium text-gray-800 dark:text-[#dcddde]">
                      Select All Unpublished
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pl-2">
                  {unpublishedFiles.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
                      onClick={() => toggleFileSelection(file.path)}
                    >
                      <div
                        className={`w-5 h-5 rounded border ${selectedFiles.includes(file.path) ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
                      >
                        {selectedFiles.includes(file.path) && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex items-center ml-3 flex-1">
                        <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
                        <span className="text-sm text-gray-800 dark:text-[#dcddde]">{file.path}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-[#999]">{file.lastModified}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 dark:text-[#999] italic p-2">No unpublished files</div>
            )}
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
            disabled={selectedFiles.length === 0 || isDeploying || unpublishedFiles.length === 0}
          >
            {isDeploying ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deploying...
              </span>
            ) : (
              <>Deploy {selectedFiles.length > 0 && `(${selectedFiles.length})`}</>
            )}
          </button>
        </div>
        {deploySuccess !== false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white dark:bg-[#333] rounded-lg shadow-lg p-6 flex flex-col items-center max-w-xs">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <Check size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 dark:text-[#dcddde] mb-2">Deployment Successful!</h3>
              <p className="text-sm text-gray-600 dark:text-[#999] text-center">
                {deploySuccess} files have been successfully deployed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}