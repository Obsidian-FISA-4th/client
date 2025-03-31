"use client"

import { useState, useEffect } from "react"
import { X, FileText, Check, FolderClosed, FolderOpen, ChevronRight, ChevronDown } from "lucide-react"
import { fetchFileSystemData } from "@/lib/api";
import { getRelativePath, transformApiResponseForDeployModal } from "@/lib/fileSystemUtils";
import { publishFiles, unpublishFiles } from "@/lib/api";

const BASE_URL = process.env.BASE_URL || "/default/note/";

// 타입 정의
interface FileNode {
  id: string
  name: string
  path: string
  type: "file"
  content?: string
}

interface FolderNode {
  id: string
  name: string
  path: string
  type: "folder"
  children: (FileNode | FolderNode)[]
}

type Node = FileNode | FolderNode

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
}

type SelectionState = "none" | "partial" | "all"

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  // 배포된 파일과 배포되지 않은 파일 상태 관리
  const [publishedFiles, setPublishedFiles] = useState<string[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [fileSystem, setFileSystem] = useState<FolderNode>({
    id: "/",
    name: "root",
    path: "/",
    type: "folder",
    children: [],
  });




  // 초기 데이터 로드
  useEffect(() => {
    const loadFileSystem = async () => {
      try {
        const rawFileSystem = await fetchFileSystemData();
        const transformedFileSystem = transformApiResponseForDeployModal(rawFileSystem);
        setFileSystem({
          id: "/",
          name: "root",
          path: "/",
          type: "folder",
          children: transformedFileSystem,
        });
      } catch (error) {
        console.error("Error fetching file system:", error);
      }

      // 배포된 파일 초기화 (예시 데이터)
      const initialPublishedFiles = [
        "1. Daily Notes/2024-02-25.md",
        "2. Projects/Project Ideas.md",
        "2. Projects/1. Web Development/1. React/React Hooks.md",
      ];
      setPublishedFiles(initialPublishedFiles);
      setSelectedFiles([...initialPublishedFiles]); // 배포된 파일은 기본적으로 선택됨
    };

    if (isOpen) {
      loadFileSystem(); // 모달이 열릴 때 파일 시스템 데이터 로드
    }
  }, [isOpen]);

  // 파일 선택 토글
  const toggleFileSelection = (filePath: string) => {
    setSelectedFiles((prev) => {
      if (prev.includes(filePath)) {
        return prev.filter((path) => path !== filePath)
      } else {
        return [...prev, filePath]
      }
    })
  }

  // 폴더 확장/축소 토글
  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }))
  }

  // 폴더 내 모든 파일 선택/해제
  const toggleFolderSelection = (folder: Node) => {
    // 폴더 내 모든 파일 경로 수집
    const getAllFilePaths = (node: Node): string[] => {
      let paths: string[] = []

      if (node.type === "file") {
        paths.push(node.path)
      } else if (node.type === "folder") {
        node.children.forEach((child) => {
          paths = [...paths, ...getAllFilePaths(child)]
        })
      }

      return paths
    }

    const folderFiles = getAllFilePaths(folder)

    // 폴더 내 모든 파일이 선택되었는지 확인
    const allSelected = folderFiles.every((path) => selectedFiles.includes(path))

    if (allSelected) {
      // 모두 선택되었다면 모두 해제
      setSelectedFiles((prev) => prev.filter((path) => !folderFiles.includes(path)))
    } else {
      // 일부만 선택되었거나 모두 선택되지 않았다면 모두 선택
      setSelectedFiles((prev) => {
        const newSelection = [...prev]
        folderFiles.forEach((path) => {
          if (!newSelection.includes(path)) {
            newSelection.push(path)
          }
        })
        return newSelection
      })
    }
  }

  // 폴더 내 파일 선택 상태 확인
  const getFolderSelectionState = (folder: Node): SelectionState => {
    const getAllFilePaths = (node: Node): string[] => {
      let paths: string[] = []

      if (node.type === "file") {
        paths.push(node.path)
      } else if (node.type === "folder") {
        node.children.forEach((child) => {
          paths = [...paths, ...getAllFilePaths(child)]
        })
      }

      return paths
    }

    const folderFiles = getAllFilePaths(folder)

    if (folderFiles.length === 0) return "none"

    const selectedCount = folderFiles.filter((path) => selectedFiles.includes(path)).length

    if (selectedCount === 0) return "none"
    if (selectedCount === folderFiles.length) return "all"
    return "partial"
  }

  // 배포 처리
  const handleDeploy = async () => {
    try {
      // 배포할 파일 (선택된 파일 중 배포되지 않은 파일)
    const filesToDeploy = selectedFiles
    .filter((file) => !publishedFiles.includes(file))
    .map((file) => getRelativePath(file, BASE_URL)); // 상대 경로로 변환

  // 회수할 파일 (배포된 파일 중 선택되지 않은 파일)
  const filesToUndeploy = publishedFiles
    .filter((file) => !selectedFiles.includes(file))
    .map((file) => getRelativePath(file, BASE_URL)); // 상대 경로로 변환

      // 배포 API 호출
      if (filesToDeploy.length > 0) {
        await publishFiles(filesToDeploy);
        console.log("Published files:", filesToDeploy);
      }

      // 회수 API 호출
      if (filesToUndeploy.length > 0) {
        await unpublishFiles(filesToUndeploy);
        console.log("Unpublished files:", filesToUndeploy);
      }

      // 배포 상태 업데이트
      setPublishedFiles(selectedFiles);

      // 모달 닫기
      onClose();
    } catch (error) {
      console.error("Error during deployment:", error);
    }
  };

  // 파일 트리 렌더링 함수
  const renderFileTree = (node: Node, depth = 0) => {
    const paddingLeft = depth * 16 // 16px padding per level

    if (node.type === "file") {
      const isPublished = publishedFiles.includes(node.path)
      const isSelected = selectedFiles.includes(node.path)

      return (
        <div
          key={node.id}
          className={`flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer ${isPublished ? "border-l-2 border-green-500 dark:border-green-400" : ""}`}
          onClick={() => toggleFileSelection(node.path)}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <div
            className={`w-5 h-5 rounded border ${isSelected ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
          >
            {isSelected && <Check size={14} className="text-white" />}
          </div>
          <div className="flex items-center ml-3">
            <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
            <span className="text-sm text-gray-800 dark:text-[#dcddde]">{node.name}</span>
            {isPublished && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded">
                Published
              </span>
            )}
          </div>
        </div>
      )
    } else if (node.type === "folder") {
      const isExpanded = expandedFolders[node.path]
      const selectionState = getFolderSelectionState(node)

      return (
        <div key={node.id}>
          <div
            className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            <div className="flex items-center" onClick={() => toggleFolder(node.path)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {isExpanded ? <FolderOpen size={16} className="ml-1" /> : <FolderClosed size={16} className="ml-1" />}
            </div>

            <div className="flex items-center ml-2" onClick={() => toggleFolderSelection(node)}>
              <div
                className={`w-5 h-5 rounded border ${selectionState === "all"
                    ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                    : selectionState === "partial"
                      ? "bg-blue-200 border-blue-300 flex items-center justify-center"
                      : "border-gray-300 dark:border-[#555]"
                  }`}
              >
                {selectionState !== "none" && (
                  <Check size={14} className={selectionState === "all" ? "text-white" : "text-blue-500"} />
                )}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-800 dark:text-[#dcddde]">{node.name}</span>
            </div>
          </div>

          {isExpanded && <div>{node.children.map((child) => renderFileTree(child, depth + 1))}</div>}
        </div>
      )
    }

    return null
  }

  // 배포된 파일 목록 렌더링
  const renderPublishedFiles = () => {
    if (publishedFiles.length === 0) {
      return <div className="p-2 text-sm text-gray-500 dark:text-[#999]">No published files yet.</div>
    }

    return (
      <div className="space-y-1">
        {publishedFiles.map((filePath) => {
          const isSelected = selectedFiles.includes(filePath)
          const fileName = filePath.split("/").pop() || ""

          return (
            <div
              key={filePath}
              className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-[#333] cursor-pointer"
              onClick={() => toggleFileSelection(filePath)}
            >
              <div
                className={`w-5 h-5 rounded border ${isSelected ? "bg-blue-500 border-blue-500 flex items-center justify-center" : "border-gray-300 dark:border-[#555]"}`}
              >
                {isSelected && <Check size={14} className="text-white" />}
              </div>
              <div className="flex items-center ml-3">
                <FileText size={16} className="mr-2 text-gray-500 dark:text-[#999]" />
                <span className="text-sm text-gray-800 dark:text-[#dcddde]">{fileName}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">{filePath}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (!isOpen || !fileSystem) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#333]">
          <h2 className="text-lg font-medium text-gray-800 dark:text-[#dcddde]">Deploy Files</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-[#333]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Published Files Section */}
          <div className="p-4 border-b border-gray-200 dark:border-[#333] overflow-hidden flex flex-col">
            <h3 className="text-md font-medium text-gray-800 dark:text-[#dcddde] mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Published Files
              <span className="ml-2 text-xs text-gray-500 dark:text-[#999]">({publishedFiles.length} files)</span>
            </h3>

            <div className="overflow-y-auto sidebar-content" style={{ maxHeight: "25vh" }}>
              {renderPublishedFiles()}
            </div>
          </div>

          {/* Unpublished Files Section */}
          <div className="p-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-md font-medium text-gray-800 dark:text-[#dcddde] mb-2">File System</h3>

            <div className="flex-1 overflow-y-auto sidebar-content">
              {fileSystem.children.map((node) => renderFileTree(node))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-[#333]">
          <div className="text-sm text-gray-600 dark:text-[#999]">
            <span className="font-medium">{selectedFiles.length}</span> files selected for deployment
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-[#dcddde] bg-gray-100 dark:bg-[#333] rounded hover:bg-gray-200 dark:hover:bg-[#444]"
            >
              Cancel
            </button>
            <button
              onClick={handleDeploy}
              className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Deploy Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

