'use client';

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar";
import { Editor } from "@/components/editor/Editor"
import { Header } from "@/components/layout/Header";
import { AuthModal } from "@/components/modals/AuthModal"
import { Tabs } from "@/components/tabs/Tab"
import { addFile, addFolder, moveNode } from "@/utils/fileSystemUtils";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { DeployModal } from "@/components/modals/DeployModal";
import { FileSystemProvider, useFileSystem } from "@/contexts/FileSystemContext";


/*
root page 역할
  1. 초기 상태 설정
  2. 인증 처리
  3. 레이아웃 구성
  4. 파일 시스템 관리
*/

/*
  분리 가능한 부분
    1. 상태 관리
    2. 파일 시스템 유틸리티
    3. 컴포넌트 분리
*/

function MainContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const {
    fileSystem,
    openFiles,
    activeFilePath,
    fileContent,
    setFileSystem,
    handleFileClick,
    handleContentChange,
    handleFileRename,
    handleDeleteFile,
    handleTabClose,
  } = useFileSystem()

  const handleAuthenticate = () => {
    setIsAuthenticated(true)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
  }

  const handleAddFile = (folderPath: string, fileName: string) => {
    const newFileSystem = { ...fileSystem }
    const newFilePath = addFile(folderPath, fileName, "", newFileSystem)

    if (newFilePath) {
      setFileSystem(newFileSystem)
      handleFileClick(newFilePath)
    }
  }

  const handleAddFolder = (parentPath: string, folderName: string) => {
    const newFileSystem = { ...fileSystem }
    const newFolderPath = addFolder(parentPath, folderName, newFileSystem)

    if (newFolderPath) {
      setFileSystem(newFileSystem)
    }
  }

  const handleMoveNode = (nodePath: string, targetFolderPath: string) => {
    const newFileSystem = { ...fileSystem }
    const success = moveNode(nodePath, targetFolderPath, newFileSystem)

    if (success) {
      setFileSystem(newFileSystem)
    }
  }

  const getCurrentPath = () => {
    if (!activeFilePath) return ""

    const parts = activeFilePath.split("/")
    parts.pop()
    return parts.join("/")
  }

  if (!isAuthenticated) {
    return <AuthModal onAuthenticate={handleAuthenticate} />
  }

  return (
    <div className={`flex h-screen w-full overflow-hidden ${isDarkMode ? "dark" : ""}`}>
      <div className="flex h-full w-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-[#dcddde]">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onDeployClick={() => setIsDeployModalOpen(true)}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onFileClick={handleFileClick}
          fileSystem={fileSystem}
          onSearchChange={handleSearchChange}
          onAddFile={handleAddFile}
          onAddFolder={handleAddFolder}
          onMoveNode={handleMoveNode}
        />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <Header
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            currentPath={activeFilePath ? getCurrentPath() : undefined}
          />

          <Tabs openFiles={openFiles} onTabClick={handleFileClick} onTabClose={handleTabClose} />

          {activeFilePath ? (
            <Editor
              content={fileContent}
              onChange={handleContentChange}
              filePath={activeFilePath}
              onDelete={handleDeleteFile}
              onRename={handleFileRename}
            />
          ) : (
            <WelcomeScreen />
          )}
        </div>
      </div>

      <DeployModal isOpen={isDeployModalOpen} onClose={() => setIsDeployModalOpen(false)} />
    </div>
  )
}

export default function ObsidianClone() {
  return (
    <FileSystemProvider>
      <MainContent />
    </FileSystemProvider>
  )
}