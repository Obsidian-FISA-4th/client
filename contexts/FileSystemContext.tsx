import React, { createContext, useContext, useState, ReactNode } from 'react'

import { FolderNode, initialFileSystem, OpenFile } from '@/data/initialFileSystem'
import { getFileContent, updateFileContent, renameFile, deleteFile, addFile, addFolder, moveNode } from '@/utils/fileSystemUtils'

interface FileSystemContextProps {
  fileSystem: FolderNode
  setFileSystem: React.Dispatch<React.SetStateAction<FolderNode>>
  openFiles: OpenFile[]
  setOpenFiles: React.Dispatch<React.SetStateAction<OpenFile[]>>
  activeFilePath: string | null
  setActiveFilePath: React.Dispatch<React.SetStateAction<string | null>>
  fileContent: string
  setFileContent: React.Dispatch<React.SetStateAction<string>>
  handleFileClick: (filePath: string) => void
  handleContentChange: (newContent: string) => void
  handleFileRename: (oldPath: string, newName: string) => void
  handleDeleteFile: () => void
  handleTabClose: (filePath: string) => void
}

const FileSystemContext = createContext<FileSystemContextProps | undefined>(undefined)

export const FileSystemProvider = ({ children }: { children: ReactNode }) => {
  const [fileSystem, setFileSystem] = useState<FolderNode>(initialFileSystem)
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([])
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState("")

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

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        setFileSystem,
        openFiles,
        setOpenFiles,
        activeFilePath,
        setActiveFilePath,
        fileContent,
        setFileContent,
        handleFileClick,
        handleContentChange,
        handleFileRename,
        handleDeleteFile,
        handleTabClose,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  )
}

export const useFileSystem = () => {
  const context = useContext(FileSystemContext)
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider')
  }
  return context
}