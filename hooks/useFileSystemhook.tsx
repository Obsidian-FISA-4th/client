import { useState, useEffect } from "react"
import { FolderNode, OpenFile } from "../data/initialFileSystem"
import { getFileContent, updateFileContent, renameFile, deleteFile, addFile, addFolder, moveNode } from "@/utils/fileSystemUtils"

export const useFileSystem = (initialFileSystem: FolderNode) => {
  const [fileSystem, setFileSystem] = useState<FolderNode>(initialFileSystem)
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")

  useEffect(() => {
    if (activeFilePath) {
      const activeFile = openFiles.find((file) => file.path === activeFilePath)
      if (activeFile) {
        setFileContent(activeFile.content)
      }
    } else {
      setFileContent("")
    }
  }, [activeFilePath, openFiles])

  const handleFileClick = (filePath: string) => {
    const isFileOpen = openFiles.some((file) => file.path === filePath)
    if (isFileOpen) {
      setOpenFiles(openFiles.map((file) => ({ ...file, active: file.path === filePath })))
      setActiveFilePath(filePath)
    } else {
      const content = getFileContent(filePath, fileSystem) || `# ${filePath}\n\nStart writing here...`
      const updatedFiles = openFiles.map((file) => ({ ...file, active: false }))
      updatedFiles.push({ path: filePath, content, active: true })
      setOpenFiles(updatedFiles)
      setActiveFilePath(filePath)
      setFileContent(content)
    }
  }

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent)
    if (activeFilePath) {
      setOpenFiles(openFiles.map((file) => (file.path === activeFilePath ? { ...file, content: newContent } : file)))
      const newFileSystem = { ...fileSystem }
      updateFileContent(activeFilePath, newContent, newFileSystem)
      setFileSystem(newFileSystem)
    }
  }

  const handleFileRename = (oldPath: string, newName: string) => {
    if (!oldPath) return
    const newFileSystem = { ...fileSystem }
    const newPath = renameFile(oldPath, newName, newFileSystem)
    if (!newPath) return
    setFileSystem(newFileSystem)
    setOpenFiles(openFiles.map((file) => (file.path === oldPath ? { ...file, path: newPath } : file)))
    if (activeFilePath === oldPath) {
      setActiveFilePath(newPath)
    }
  }

  const handleDeleteFile = () => {
    if (!activeFilePath) return
    const newFileSystem = { ...fileSystem }
    const success = deleteFile(activeFilePath, newFileSystem)
    if (!success) return
    setFileSystem(newFileSystem)
    handleTabClose(activeFilePath)
  }

  const handleTabClose = (filePath: string) => {
    const fileIndex = openFiles.findIndex((file) => file.path === filePath)
    if (fileIndex === -1) return
    const newOpenFiles = [...openFiles]
    newOpenFiles.splice(fileIndex, 1)
    if (filePath === activeFilePath) {
      if (newOpenFiles.length > 0) {
        const newActiveIndex = Math.max(0, fileIndex - 1)
        newOpenFiles[newActiveIndex].active = true
        setActiveFilePath(newOpenFiles[newActiveIndex].path)
      } else {
        setActiveFilePath(null)
      }
    }
    setOpenFiles(newOpenFiles)
  }

  return {
    fileSystem,
    setFileSystem,
    openFiles,
    activeFilePath,
    fileContent,
    handleFileClick,
    handleContentChange,
    handleFileRename,
    handleDeleteFile,
    handleTabClose,
  }
}