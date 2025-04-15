import React, { useState, useEffect } from 'react'
import { FileText, FolderClosed, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { useFileSystemStore } from '@/store/fileSystemStore'
import { FileSystemNode } from '@/lib/fileSystemUtils'
import { Menu, Item, useContextMenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

interface DragItem {
  node: FileSystemNode
}

interface SidebarContentProps {
  onFileClick: (filePath: string) => void
  onMoveNode?: (nodePath: string, targetFolderPath: string) => void
  setActivePath: (path: string | null) => void
  isStudentPage: boolean
  fileSystem: FileSystemNode | null
  searchTerm?: string; 
}

function highlightMatch(name: string, term: string) {
  if (!term) return name;
  const index = name.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return name;
  const before = name.slice(0, index);
  const match = name.slice(index, index + term.length);
  const after = name.slice(index + term.length);
  return (
    <>
      {before}
      <span className="bg-yellow-200 text-black">{match}</span>
      {after}
    </>
  );
}

export function SidebarContent({
  onFileClick,
  onMoveNode,
  setActivePath,
  isStudentPage,
  fileSystem,
  searchTerm,
}: SidebarContentProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const [selectedPath, setSelectedPath] = useState<string | null>(null) // 클릭된 항목 추적
  const fetchFileSystem = useFileSystemStore((state) => state.fetchFileSystem)
  const handleDeleteFile = useFileSystemStore((state) => state.handleDeleteFile);
  const { show } = useContextMenu({ id: "folder-context-menu" });

  useEffect(() => {
    fetchFileSystem(isStudentPage); // ← isStudentPage 전달
  }, [fetchFileSystem, isStudentPage]);

  useEffect(() => {
    const initialExpandedFolders: Record<string, boolean> = {}

    function initializeExpandedState(node: FileSystemNode) {
      if (node.type === "folder") {
        initialExpandedFolders[node.path] = true
        node.children.forEach(initializeExpandedState)
      }
    }

    if (fileSystem) {
      initializeExpandedState(fileSystem)
      setExpandedFolders((prev) => ({ ...initialExpandedFolders, ...prev }))
    }
  }, [fileSystem])

  useEffect(() => {
    if (!searchTerm || !fileSystem) return;
    const newExpandedFolders = { ...expandedFolders };
    function expandIfMatch(node: FileSystemNode, parents: string[]): boolean {
      let hasMatch = false;
      if (node.type === "folder") {
        for (const child of node.children) {
          if (expandIfMatch(child, [...parents, node.path])) {
            hasMatch = true;
          }
        }
      } else if (node.type === "file") {
        if (node.name.toLowerCase().includes((searchTerm ?? "").toLowerCase())) {
          hasMatch = true;
        }
      }
      if (hasMatch) {
        parents.forEach((p) => {
          newExpandedFolders[p] = true;
        });
      }
      return hasMatch;
    }
    expandIfMatch(fileSystem, []);
    setExpandedFolders((prev) => ({ ...prev, ...newExpandedFolders }));
  }, [searchTerm, fileSystem]);

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }))
  }

  const handleDragStart = (e: React.DragEvent, node: FileSystemNode) => {
    if (onMoveNode) {
      setDraggedItem({ node })
      e.dataTransfer.setData("text/plain", node.path)
      e.dataTransfer.effectAllowed = "move"
    }
  }

  const handleDragOver = (e: React.DragEvent, targetPath: string) => {
    if (onMoveNode) {
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
  }

  const handleDragLeave = () => {
    if (onMoveNode) {
      setDropTarget(null)
    }
  }

  const handleDrop = (e: React.DragEvent, targetFolderPath: string) => {
    if (onMoveNode) {
      e.preventDefault()
      e.stopPropagation()
      setDropTarget(null)

      if (!draggedItem) return

      if (draggedItem.node.type === "folder" && targetFolderPath.startsWith(draggedItem.node.path + "/")) {
        return
      }

      onMoveNode(draggedItem.node.path, targetFolderPath)
      setDraggedItem(null)
    }
  }

  const handleDragEnd = () => {
    if (onMoveNode) {
      setDraggedItem(null)
      setDropTarget(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, nodePath: string) => {
    e.preventDefault();
    setSelectedPath(nodePath);

    show({
      event: e.nativeEvent, // React.MouseEvent에서 nativeEvent를 전달
      props: { path: nodePath },
    });
  };

  const handleDelete = async () => {
    if (selectedPath && window.confirm("Are you sure you want to delete this folder?")) {
      await handleDeleteFile(selectedPath, "folder");
    }
  }

  const renderNode = (node: FileSystemNode, depth = 1) => {
    const paddingLeft = depth * 5

    if (node.type === "file") {
      const safeName = node.name.endsWith(".md") ? node.name.slice(0, -3) : node.name;
      const displayName = highlightMatch(safeName, searchTerm || "");
      return (
        <div
          key={node.id}
          className={`flex items-center gap-1 p-1 rounded text-sm cursor-pointer ${
            selectedPath === node.path ? "bg-gray-300 dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-[#333]"
          }`}
          onClick={(e) => {
            e.stopPropagation()
            onFileClick(node.path)
            setActivePath(node.path)
            setSelectedPath(node.path) // 클릭된 항목 설정
          }}
          draggable={!!onMoveNode}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          style={{ paddingLeft: `${paddingLeft + 20}px` }}
        >
          <FileText size={14} />
          <span>{displayName}</span>
        </div>
      )
    } else {
      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-1 p-1 rounded cursor-pointer ${
              selectedPath === node.path ? "bg-gray-300 dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-[#333]"
            } ${dropTarget === node.path ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              toggleFolder(node.path)
              setActivePath(node.path)
              setSelectedPath(node.path) // 클릭된 항목 설정
            }}
            draggable={!!onMoveNode}
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node.path)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node.path)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, node.path)}
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {expandedFolders[node.path] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {expandedFolders[node.path] ? <FolderOpen size={16} /> : <FolderClosed size={16} />}
            <span className="text-sm">
              {highlightMatch(node.name, searchTerm || "")}
            </span>
          </div>

          {expandedFolders[node.path] && (
            <div style={{ borderLeft: "1px solid #ccc", marginLeft: "10px" }}>
              {node.children.map((child: FileSystemNode) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div
      className="flex-1 overflow-y-auto sidebar-content pt-2"
      onClick={() => {
        setActivePath('/')
        setSelectedPath(null) 
      }}
    >
      {fileSystem && fileSystem.children.map((node: FileSystemNode) => renderNode(node))}
      <Menu id="folder-context-menu">
        <Item onClick={handleDelete}>삭제하기</Item>
      </Menu>
    </div>
  )
}