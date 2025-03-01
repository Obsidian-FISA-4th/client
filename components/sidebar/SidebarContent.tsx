import React, { useState, useEffect } from 'react'
import { FileText, FolderClosed, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { FileSystemNode, FolderNode } from '@/data/initialFileSystem'

interface DragItem {
  node: FileSystemNode
}

interface SidebarContentProps {
  onFileClick: (filePath: string) => void
  fileSystem: FolderNode
  onMoveNode: (nodePath: string, targetFolderPath: string) => void
  setActivePath: (path: string | null) => void
}

export function SidebarContent({
  onFileClick,
  fileSystem,
  onMoveNode,
  setActivePath,
}: SidebarContentProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  useEffect(() => {
    const initialExpandedFolders: Record<string, boolean> = {}

    function initializeExpandedState(node: FileSystemNode) {
      if (node.type === "folder") {
        const depth = node.path.split("/").length
        initialExpandedFolders[node.path] = depth <= 2
        node.children.forEach(initializeExpandedState)
      }
    }

    initializeExpandedState(fileSystem)
    setExpandedFolders((prev) => ({ ...initialExpandedFolders, ...prev }))
  }, [fileSystem])

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }))
  }

  const handleDragStart = (e: React.DragEvent, node: FileSystemNode) => {
    setDraggedItem({ node })
    e.dataTransfer.setData("text/plain", node.path)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedItem && draggedItem.node.path !== targetPath) {
      if (draggedItem.node.type === "folder" && targetPath.startsWith(draggedItem.node.path + "/")) {
        return
      }

      setDropTarget(targetPath)
      e.dataTransfer.dropEffect = "move"
    }
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDropTarget(null)

    if (!draggedItem || !onMoveNode) return

    if (draggedItem.node.type === "folder" && targetFolderPath.startsWith(draggedItem.node.path + "/")) {
      return
    }

    onMoveNode(draggedItem.node.path, targetFolderPath)
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropTarget(null)
  }

  const renderNode = (node: FileSystemNode, depth = 0) => {
    const paddingLeft = depth * 16

    if (node.type === "file") {
      return (
        <div
          key={node.id}
          className="flex items-center gap-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] text-sm cursor-pointer"
          onClick={() => {
            onFileClick(node.path)
            setActivePath(node.path)
          }}
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <FileText size={14} />
          <span>{node.name}</span>
        </div>
      )
    } else {
      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-1 p-1 rounded hover:bg-gray-200 dark:hover:bg-[#333] cursor-pointer ${dropTarget === node.path ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            onClick={() => {
              toggleFolder(node.path)
              setActivePath(node.path)
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node.path)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node.path)}
            onDragEnd={handleDragEnd}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {expandedFolders[node.path] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {expandedFolders[node.path] ? <FolderOpen size={16} /> : <FolderClosed size={16} />}
            <span className="text-sm">{node.name}</span>
          </div>

          {expandedFolders[node.path] && <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>}
        </div>
      )
    }
  }

  return (
    <div className="flex-1 overflow-y-auto sidebar-content">
      {fileSystem.children.map((node: FileSystemNode) => renderNode(node))}
    </div>
  )
}