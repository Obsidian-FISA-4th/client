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
  const [selectedPath, setSelectedPath] = useState<string | null>(null) 
  const fetchFileSystem = useFileSystemStore((state) => state.fetchFileSystem)
  const handleDeleteFile = useFileSystemStore((state) => state.handleDeleteFile);
  const { show } = useContextMenu({ id: "folder-context-menu" });

  useEffect(() => {
    fetchFileSystem(isStudentPage); 
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
      event: e.nativeEvent, 
      props: { path: nodePath },
    });
  };

  const handleDelete = async () => {
    if (selectedPath && window.confirm("Are you sure you want to delete this folder?")) {
      await handleDeleteFile(selectedPath, "folder");
    }
  }

  const renderNode = (node: FileSystemNode, depth = 1) => {
    const paddingLeft = depth * 5;
  
    if (node.type === "file") {
      const safeName = node.name.endsWith(".md") ? node.name.slice(0, -3) : node.name;
      const displayName = highlightMatch(safeName, searchTerm || "");
      return (
        <div
          key={node.id}
          className={`flex items-center gap-2 p-1 rounded text-sm cursor-pointer ${
            selectedPath === node.path ? "bg-gray-300 dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-[#333]"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onFileClick(node.path);
            setActivePath(node.path);
            setSelectedPath(node.path);
          }}
          draggable={!!onMoveNode}
          onDragStart={(e) => handleDragStart(e, node)}
          onDragEnd={handleDragEnd}
          style={{
            paddingLeft: `${paddingLeft}px`,
            borderLeft: `1px solid ${
              selectedPath === node.path ? "#8a5cf4" : "#ccc"
            }`, 
            marginLeft: "15px",
            borderRadius: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderLeft = "1px solid #666";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderLeft = `1px solid ${
              selectedPath === node.path ? "#8a5cf4" : "#ccc"
            }`; 
          }}
        >
          {/* 아이콘 */}
          <div
            style={{
              flexShrink: 0,
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={14} />
          </div>
          <span
            className="break-words"
            style={{
              wordWrap: "break-word",
              whiteSpace: "normal",
              color: selectedPath === node.path ? "#8a5cf4" : "inherit",
            }}
          >
            {displayName}
          </span>
        </div>
      );
    } else {
      return (
        <div key={node.id}>
          <div
            className={`flex items-center gap-2 p-1 rounded cursor-pointer ${
              selectedPath === node.path ? "bg-gray-300 dark:bg-gray-700" : ""
            } ${dropTarget === node.path ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(node.path);
              setActivePath(node.path);
              setSelectedPath(node.path);
            }}
            draggable={!!onMoveNode}
            onDragStart={(e) => handleDragStart(e, node)}
            onDragOver={(e) => handleDragOver(e, node.path)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, node.path)}
            onDragEnd={handleDragEnd}
            onContextMenu={(e) => handleContextMenu(e, node.path)}
            style={{
              paddingLeft: `${paddingLeft}px`,
              fontWeight: "normal", 
              ...(dropTarget === node.path && { fontWeight: "bold" }), 
            }}
            onMouseEnter={(e) => {
              if (node.type === "folder") {
                e.currentTarget.style.fontWeight = "bold"; 
              }
            }}
            onMouseLeave={(e) => {
              if (node.type === "folder") {
                e.currentTarget.style.fontWeight = "normal"; 
              }
            }}
          >
            {expandedFolders[node.path] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {expandedFolders[node.path] ? <FolderOpen size={14} /> : <FolderClosed size={14} />}
            <span
              className="text-sm"
              style={{
                fontWeight: 500,
                fontSize: "0.9rem",
              }}
            >
              {highlightMatch(node.name, searchTerm || "")}
            </span>
          </div>
  
          {expandedFolders[node.path] && (
            <div
              style={{
                borderLeft: depth >= 2 ? "1px solid #ccc" : "none",
                marginLeft: "15px",
              }}
            >
              {node.children.map((child: FileSystemNode) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto sidebar-content pt-2 pb-4"
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